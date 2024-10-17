import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../mendelssohn-choral-works/kern/`;
const analysisFile = `${__dirname}/../content/analysis.yaml`;

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

function escapeShell(cmd = '') {
    return '"' + cmd.replace(/(["$`\\])/g, '\\$1') + '"';
}

const result = {};

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);
    const kern = fs.readFileSync(file, 'utf8');
    const stdout = execSync(`echo ${escapeShell(kern)} | lnnr | beat -cp | fb -cn | fb -con --hint | degx -k 1 | extractxx -I **kern | extractxx -I **text | extractxx -I **dynam | ridx -LGTMId`).toString();
    const lines = stdout.trim().split('\n');

    const indexMap = {
        beat: 0,
        fb: 1,
        hint: 2,
        deg: 3,
        lineNumber: 4,
    }

    const maxBeat = parseInt(lines[lines.length - 1].split('\t')[indexMap.beat], 10);

    lines.forEach(line => {
        const tokens = line.split('\t');
        let beat = tokens[indexMap.beat];
        const fb = tokens[indexMap.fb];
        const hint = tokens[indexMap.hint];
        const deg = tokens[indexMap.deg];
        let lineNumber = tokens[indexMap.lineNumber];

        beat = parseInt(beat, 10);
        lineNumber = parseInt(lineNumber, 10);

        const startBeat = Math.max(0, beat - 4);
        const endBeat = Math.min(maxBeat, beat + 4);
        const startLine = parseInt(lines.find(line => parseInt(line.split('\t')[indexMap.beat], 10) >= startBeat).split('\t')[indexMap.lineNumber], 10);
        const endLine = parseInt(lines.toReversed().find(line => parseInt(line.split('\t')[indexMap.beat], 10) < endBeat).split('\t')[indexMap.lineNumber], 10);

        if ((fb === '9 7 4' || fb === '7 4 2')) {
            (result['479'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if ( deg === '5' && fb === '6 4 2') {
            (result['deg5-246'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if (deg === '4' && (fb === '6 4 3' || hint == 'M6 A4 m3')) {
            (result['deg4-down'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if (deg === '3' && (fb === '9 6 3')) {
            (result['deg3-69'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if (deg === '5' && (hint.includes('m6'))) {
            (result['deg5-m6'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if (deg === '5' && (fb === '7 5 4')) {
            (result['deg5-457'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

        if (deg === '4' && (fb.includes('7'))) {
            (result['deg4-7'] ??= []).push({
                id,
                deg,
                lineNumber,
                myankLines: `${startLine}-${endLine}`,
            });
        }

    });
 
});

fs.writeFileSync(analysisFile, yaml.dump(result, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));
