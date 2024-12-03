import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../mendelssohn-choral-works/kern/`;
const piecesYamlPath = `${__dirname}/../content/pieces/`;

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

    for (let i = 0; i < lines.length; i += 2) {
        const line = lines[i];
        
        const [, key] = line.match(/\*([A-Ha-h\#\-]+):/);

        const tokens = lines[i + 1].split('\t');
        let beat = tokens[indexMap.beat];
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);
        
        modulations.push({
            key,
            startBeat: beat,
            endBeat: null,
        });
    }

    modulations.forEach((modulation, index) => {
        modulation.endBeat = modulations[index + 1]?.startBeat ?? maxBeat;
    })
    
    const configFile = `${piecesYamlPath}${id}.yaml`;
    const doc = yaml.load(fs.readFileSync(configFile, 'utf8'));
    fs.writeFileSync(configFile, yaml.dump({
        ...doc,
        modulations,
        maxBeat,
    }, {
        indent: 4,
        lineWidth: -1,
        sortKeys: true,
    }));

});
