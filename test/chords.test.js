import { expect, test } from 'vitest';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = `${__dirname}/../content/chords.yaml`;
const { chords } = yaml.load(fs.readFileSync(file, 'utf8'));

test('lowest deg', () => {
    // missing bass
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 30).deg).toBe('1');
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 31).deg).toBe('6');
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 32).deg).toBe('5');
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 33).deg).toBe('7');
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 34).deg).toBe('4');
    expect(chords.find(e => e.id === '59-3-abschied-vom-walde' && e.beat === 35).deg).toBe('3');

    // missing tenor and bass
    expect(chords.find(e => e.id === '59-4-die-nachtigall' && e.beat === 0)).toBe(undefined); // unisono
    expect(chords.find(e => e.id === '59-4-die-nachtigall' && e.beat === 0.5).deg).toBe('1');
    expect(chords.find(e => e.id === '59-4-die-nachtigall' && e.beat === 1.5).deg).toBe('5');
    expect(chords.find(e => e.id === '59-4-die-nachtigall' && e.beat === 2).deg).toBe('3');

    // soprano only
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 18.5)).toBe(undefined);
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 19)).toBe(undefined);
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 19.5)).toBe(undefined);
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 20)).toBe(undefined);
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 20.5)).toBe(undefined);
    
    // negative figured bass numbers (voice exchange)
    // cat input.krn | beat -ca | shed -e "s/absb/cdata/X" | fb -mic | extractxx -I text | degx --circ | pbcopy
    expect(chords.find(e => e.id === '100-3-fruehlingslied' && e.beat === 37).deg).toBe('4');
    expect(chords.find(e => e.id === '100-3-fruehlingslied' && e.beat === 39.5).deg).toBe('3');
    expect(chords.find(e => e.id === '41-2-entflieh-mit-mir' && e.beat === 41).deg).toBe('1');
    expect(chords.find(e => e.id === '48-1-fruehlingsahnung' && e.beat === 76.5).deg).toBe('7');
    expect(chords.find(e => e.id === '48-4-lerchengesang' && e.beat === 63.5).deg).toBe('4');
    expect(chords.find(e => e.id === '48-4-lerchengesang' && e.beat === 83).deg).toBe('5');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 27.5).deg).toBe('1');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 28).deg).toBe('7+');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 31).deg).toBe('1');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 139.5).deg).toBe('1');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 140).deg).toBe('7+');
    expect(chords.find(e => e.id === '59-6-jagdlied' && e.beat === 143).deg).toBe('1');
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 28.5).deg).toBe('2');
    expect(chords.find(e => e.id === '88-2-der-glueckliche' && e.beat === 29.5).deg).toBe('2');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 84.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 85.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 86).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 86.25).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 86.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 87.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 88.25).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 88.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 89).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 89.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 90).deg).toBe('1');
    expect(chords.find(e => e.id === '88-3-hirtenlied' && e.beat === 90.5).deg).toBe('1');
    expect(chords.find(e => e.id === '88-4-die-waldvoegelein' && e.beat === 61).deg).toBe('5');
}); 
