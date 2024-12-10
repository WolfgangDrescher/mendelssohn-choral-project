import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { romanize } from '../utils/romanize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../mendelssohn-choral-works/kern/`;
const modulationsYamlPath = `${__dirname}/../content/modulations.yaml`;
const transitionsYamlPath = `${__dirname}/../content/transitions.yaml`;

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

const pieces = {};

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);
    console.log(id);
    const stdout = execSync(`cat ${file} | lnnr | beat -cp | beat -dp | extractxx -I '**text' | extractxx -I '**dynam' | ridx -LGMd | sed '/^\*[^:]*$/d' | sed -n '/^\*/{p;n;p;}'`).toString().trim();
    const maxBeatStdout = execSync(`cat ${file} | lnnr | beat -cp | beat -dp | beat -da --attacks 0 | extractxx -I '**text' | extractxx -I '**dynam' | ridx -LGTMId | sed -n '$p'`).toString().trim();
    const lines = stdout.trim().split('\n');
    
    const indexMap = {
        beatDur: 0,
        beat: 1,
        bass: 2,
        tenor: 3,
        alto: 4,
        soprano: 5,
        lineNumber: 6,
        beatDurAttacksNull: 7,
    };

    let maxBeat = parseFloat(maxBeatStdout.split('\t')[indexMap.beat]);

    let lastBeatDur = parseFloat(maxBeatStdout.split('\t')[indexMap.beatDur])
        || parseFloat(maxBeatStdout.split('\t')[indexMap.beatDurAttacksNull])
        || 0;

    maxBeat += lastBeatDur;

    const modulations = [];

    let pieceKey = null;

    for (let i = 0; i < lines.length; i += 2) {
        const line = lines[i];
        
        const [, key] = line.match(/\*([A-Ha-h\#\-]+):/);
        
        pieceKey ??= key;

        const tokens = lines[i + 1].split('\t');
        let beat = tokens[indexMap.beat];
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);
        
        const degScore = `**kern
*${pieceKey}:
1${key.toLowerCase()}`;

        const stdout = execSync(`echo "${degScore}" | degx | extractxx -i deg | ridx -I`).toString().trim();
        let deg = romanize(stdout);
        deg = key === key.toLowerCase() ? deg.toLowerCase() : deg.toUpperCase();

        modulations.push({
            key,
            deg,
            startBeat: beat,
            endBeat: null,
        });
    }

    modulations.forEach((modulation, index) => {
        modulation.endBeat = modulations[index + 1]?.startBeat ?? maxBeat;
    });

    pieces[id] = modulations;

});

const transitionsMap = {};

for (const piece in pieces) {
    const degs = pieces[piece];

    for (let i = 0; i < degs.length - 1; i++) {
        const currentDeg = degs[i].deg;
        const nextDeg = degs[i + 1].deg;
        const nextStartBeat = degs[i + 1].startBeat;

        transitionsMap[currentDeg] ??= {};
        transitionsMap[currentDeg][nextDeg] ??= [0, []];
        transitionsMap[currentDeg][nextDeg][0]++;
        transitionsMap[currentDeg][nextDeg][1].push([piece, nextStartBeat])
    }
}

const transitions = [];
for (const currentDeg in transitionsMap) {
    for (const nextDeg in transitionsMap[currentDeg]) {
        transitions.push({
            currentDeg,
            nextDeg,
            count: transitionsMap[currentDeg][nextDeg][0],
            items: transitionsMap[currentDeg][nextDeg][1].map(item => ({id: item[0], beat: item[1]})),
        });
    }
}

fs.writeFileSync(modulationsYamlPath, yaml.dump(pieces, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));

fs.writeFileSync(transitionsYamlPath, yaml.dump({transitions}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));
