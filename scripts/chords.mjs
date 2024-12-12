import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../mendelssohn-choral-works/kern/`;
const dataFile = `${__dirname}/../content/chords.yaml`;
const sequencesData = `${__dirname}/../content/sequences-data.yaml`;

function getIdFromFilename(path) {
    return path.split(/[\\\/]/).pop().replace(/\..+$/, '');
}

function getFiles(directory, fileList) {
    fileList = fileList || [];
    let files = fs.readdirSync(directory);
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
    for (let i in files) {
        const name = `${directory}/${files[i]}`;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    }
    return fileList;
}

const result = [];


function getBeatWeight(meter, beatWeight4, beatWeight8) {
    if (!meter) return 'error';
    const denominator = meter.replace(/^(\*M)?\d+\//, '');
    let beat = denominator === '8' ? beatWeight8 : beatWeight4;
    if (beat === '.') return '.'
    beat = parseFloat(beat);
    if (meter === '2/4') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
        }
    } else if (meter === '3/4') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
            case 3: return 'weak';
        }
    } else if (meter === '4/4' || meter === '2/2') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
            case 3: return 'half-strong';
            case 4: return 'weak';
        }
    } else if (meter === '3/8') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
            case 3: return 'weak';
        }
    } else if (meter === '6/8') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
            case 3: return 'weak';
            case 4: return 'half-strong';
            case 5: return 'weak';
            case 6: return 'weak';
        }
    } else if (meter === '9/8') {
        switch (beat) {
            case 1: return 'strong';
            case 2: return 'weak';
            case 3: return 'weak';
            case 4: return 'half-strong';
            case 5: return 'weak';
            case 6: return 'weak';
            case 7: return 'half-strong';
            case 8: return 'weak';
            case 9: return 'weak';
        }
    }
    return 'none';
}

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);
    console.log(id);
    const stdout = execSync(`cat ${file} | lnnr -p | beat -cp | beat -p -u 8 | beat -p -u 4 | fb -cnl | fb -cnl --hint | degx -k 1 --resolve-null -t | extractxx -I '**kern' | extractxx -I '**text' | extractxx -I '**dynam' | ridx -LGTMId`).toString();
    const lines = stdout.trim().split('\n');

    const meterLines = {};
    const sourceLines = fs.readFileSync(file, 'utf8').split('\n');
    let currentMeter = null;
    sourceLines.forEach((line, index) => {
        if (line.startsWith('*M')) {
            const match = line.match(/\*M(\d+\/\d+)/);
            if (match) {
                currentMeter = match[0];
            }
        }
        meterLines[index + 1] = currentMeter;
    });

    const indexMap = {
        beatWeight4: 0,
        beatWeight8: 1,
        beat: 2,
        lineNumber: 3,
        fb: 4,
        hint: 5,
        deg: 6,
    }

    let {[id]: sequences} = yaml.load(fs.readFileSync(sequencesData, 'utf8'))
    sequences ??= [];
    const pedalPoints = sequences.filter(seq => seq.labels.includes('orgelpunkt'));

    lines.forEach(line => {
        const tokens = line.split('\t');
        let beat = tokens[indexMap.beat];
        const fb = tokens[indexMap.fb];
        const hint = tokens[indexMap.hint];
        const deg = tokens[indexMap.deg].split(' ')[0].replace('_', '');
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);

        const isPartOfPedal = !!pedalPoints.filter(pp => beat >= pp.startBeat && beat <= pp.endBeat).length;
        const currentMeter = meterLines[lineNumber];
        const beatWeight = getBeatWeight(currentMeter.replace('*M', ''), tokens[indexMap.beatWeight4], tokens[indexMap.beatWeight8]);

        if (fb === '.') {
            return;
        }

        result.push({
            beat,
            fb,
            hint,
            deg,
            lineNumber,
            id,
            isPartOfPedal,
            beatWeight,
        });
    });
 
});

fs.writeFileSync(dataFile, yaml.dump({chords: result}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
    flowLevel: 2,
}));
