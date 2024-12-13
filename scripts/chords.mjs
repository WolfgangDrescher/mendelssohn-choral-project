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


function getBeatWeight(tsig, beat, ) {
    if (!tsig) return 'error';
    if (beat === '.') return '.'
    if (tsig === '2/4') {
        switch (beat) {
            case '1': return 'strong';
            case '1+1/2': return 'weak';
            case '2': return 'half-strong';
            case '2+1/2': return 'weak';
        }
    } else if (tsig === '3/4') {
        switch (beat) {
            case '1': return 'strong';
            case '2': return 'weak';
            case '3': return 'weak';
        }
    } else if (tsig === '4/4') {
        switch (beat) {
            case '1': return 'strong';
            case '2': return 'weak';
            case '3': return 'half-strong';
            case '4': return 'weak';
        }
    } else if (tsig === '2/2') {
        switch (beat) {
            case '1': return 'strong';
            case '1+1/2': return 'weak';
            case '2': return 'half-strong';
            case '2+1/2': return 'weak';
        }
    } else if (tsig === '3/8') {
        switch (beat) {
            case '1': return 'strong';
            case '2': return 'weak';
            case '3': return 'weak';
        }
    } else if (tsig === '6/8') {
        switch (beat) {
            case '1': return 'strong';
            case '1+1/3': return 'weak';
            case '1+2/3': return 'weak';
            case '2': return 'half-strong';
            case '2+1/3': return 'weak';
            case '2+2/3': return 'weak';
        }
    } else if (tsig === '9/8') {
        switch (beat) {
            case '1': return 'strong';
            case '1+1/3': return 'weak';
            case '1+2/3': return 'weak';
            case '2': return 'half-strong';
            case '2+1/3': return 'weak';
            case '2+2/3': return 'weak';
            case '3': return 'half-strong';
            case '3+1/3': return 'weak';
            case '3+2/3': return 'weak';
        }
    }
    return 'none';
}

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);
    console.log(id);
    const stdout = execSync(`cat ${file} | lnnr -p | beat -cp | fb -cnl | fb -cnl --hint | degx -k 1 --resolve-null -t | composite | meter -tL | shed -s 2 -e "s/beat/beat-composite/X" | shed -s 3 -e "s/tsig/tsig-composite/X" | extractxx -I '**kern' | extractxx -I '**text' | extractxx -I '**dynam' | extractxx -I '**kern-comp' | extractxx -I '**cdata-beat' | extractxx -I '**cdata-tsig' | ridx -LGTMId`).toString();
    const lines = stdout.trim().split('\n');

    const indexMap = {
        meterBeat: 0,
        meterTsig: 1,
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
        const meterBeat = tokens[indexMap.meterBeat];
        const meterTsig = tokens[indexMap.meterTsig];
        const deg = tokens[indexMap.deg].split(' ')[0].replace('_', '');
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);

        const isPartOfPedal = !!pedalPoints.filter(pp => beat >= pp.startBeat && beat <= pp.endBeat).length;
        const meterWeight = getBeatWeight(tokens[indexMap.meterTsig], tokens[indexMap.meterBeat]);

        if (fb === '.'/*|| meterBeat === '.'*/) {
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
            meterWeight,
        });
    });
 
});

fs.writeFileSync(dataFile, yaml.dump({chords: result}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
    flowLevel: 2,
}));
