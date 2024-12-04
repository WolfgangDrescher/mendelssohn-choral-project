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

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);
    console.log(id);
    const stdout = execSync(`cat ${file} | lnnr | beat -cp | fb -cnl | fb -cnl --hint | degx -k 1 --resolve-null -t | extractxx -I '**kern' | extractxx -I '**text' | extractxx -I '**dynam' | ridx -LGTMId`).toString();
    const lines = stdout.trim().split('\n');

    const indexMap = {
        beat: 0,
        fb: 1,
        hint: 2,
        deg: 3,
        lineNumber: 4,
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
        });
    });
 
});

fs.writeFileSync(dataFile, yaml.dump({chords: result}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
    flowLevel: 2,
}));
