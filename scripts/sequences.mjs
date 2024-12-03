import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourceFile = `${__dirname}/../content/sequences-data.yaml`;
const targetFile = `${__dirname}/../content/sequences.yaml`;
const kernDir = `${__dirname}/../mendelssohn-choral-works/kern/`;

const sequences = [];

const data = yaml.load(fs.readFileSync(sourceFile, 'utf8'));

Object.entries(data).forEach(([id, value]) => {

    console.log(id);
    
    const beatMap = {};

    const stdout = execSync(`cat ${kernDir}${id}.krn | lnnr | beat -cp | extractxx -s 1,$ | ridx -LGTMId`).toString();
    stdout.split('\n').forEach(line => {
        const tokens = line.split('\t');
        const beat = parseFloat(tokens[0]);
        const lineNumber = parseInt(tokens[1], 10);
        beatMap[beat] = lineNumber;
    });

    console.log(beatMap);

    (value ?? []).forEach((item) => {
        sequences.push({
            id,
            startLine: beatMap[item.startBeat],
            endLine: beatMap[item.endBeat],
            ...item,
        });
    });
 
});

fs.writeFileSync(targetFile, yaml.dump({sequences}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
    flowLevel: 3,
}));
