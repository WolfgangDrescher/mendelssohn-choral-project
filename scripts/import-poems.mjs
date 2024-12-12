import { ofetch } from 'ofetch';
import { JSDOM } from 'jsdom';
import yaml from 'js-yaml';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = `${__dirname}/../content/poems/`;

execSync(`rm -rf ${path}`);
execSync(`mkdir -p ${path}`);

[
    // Des Knaben Wunderhorn
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1061.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1063.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1077.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1093a.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1124.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1161a.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1226b.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1077.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1235b.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1257.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1306b.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1327.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1329.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh1/wh1374.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2024.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2029.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2037.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2061.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2196.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2229a.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2412.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh2/wh2229a.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh3/wh3056.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh3/wh3061.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/arnim/wh3/wh3071c.html', 'utf-8'],
    // Ludwig Hölty
    ['https://www.projekt-gutenberg.org/arnim/wh3/whkl093d.html', 'utf-8'],
    // Clemens Brentan]o
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap004.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap017.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap033.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap037.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap044.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap056.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap064.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap117.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/brentano/gedichte/chap125.html', 'utf-8'],
    // Annette von Droste-Hülshoff
    ['https://www.projekt-gutenberg.org/droste/1844/chap035.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/droste/1844/chap053.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/droste/1844/chap087.html', 'utf-8'],
    // Joseph von Eichendorf
    ['https://www.projekt-gutenberg.org/eichndrf/gedichte/chap002.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/eichndrf/gedichte/chap021.html', 'utf-8'],
    ['https://www.projekt-gutenberg.org/eichndrf/gedichte/chap027.html', 'utf-8'],
    // Adalbert von Chamisso
    ['http://www.zeno.org/nid/20004646851', 'iso-8859-1'],
    ['http://www.zeno.org/nid/20004647165', 'iso-8859-1'],
    ['http://www.zeno.org/nid/20004647378', 'iso-8859-1'],
    ['http://www.zeno.org/nid/20004647971', 'iso-8859-1'],
].forEach(async ([url, encoding]) => {
    const response = await ofetch(url, {
        // parseResponse: (txt) => txt,
        responseType: 'arrayBuffer',
    });

    const decodedText = new TextDecoder(encoding).decode(response);

    const dom = new JSDOM(decodedText, {
        // encoding: 'iso-8859-1',
        // encoding: 'utf-8',
    });
    const document = dom.window.document;
    let filename = null;
    let poem = {};

    if (url.includes('projekt-gutenberg.org')) {
        poem = {
            year: document.querySelector('meta[name="year"]')?.getAttribute('content'),
            title: document.querySelector('h3')?.textContent.trim().replace(/\.$/, ''),
            author: document.querySelector('meta[name="author"]')?.getAttribute('content') ?? document.querySelectorAll('h5')?.[0].textContent,
            book: document.querySelectorAll('h5')?.[1].textContent,
            url,
            content: []
        };
        const year = parseInt(poem.year, 10);
        poem.year = Number.isNaN(year) ? poem.year : year;
        document.querySelector('table.poem tr td:last-child')?.childNodes.forEach(node => {
            if (node.nodeType === dom.window.Node.TEXT_NODE && !node.textContent.match(/^\s*$/)) {
                if (!poem.content.length) {
                    poem.content.push({
                        type: 'strophe',
                        verses: [],
                    });
                }
                if (!url.includes('wh1329')) {
                    poem.content[poem.content.length - 1].verses.push(node.textContent.trim());
                }
            }
        });
        document.querySelectorAll('table.poem p').forEach(p => {
            const verses = p.textContent.split('\n').map(v => v.trim());
            poem.content.push({
                type: 'strophe',
                verses,
            });
        });

        if (poem.content.length <= 1) {
            document.querySelectorAll('table.poem tr td').forEach(td => {
                if (td.getAttribute('colspan') === '2') {
                    const text = td.textContent.trim().replace(/\.$/, '');
                    poem.content.push({
                        type: 'heading',
                        text,
                    });
                } else {
                    const verses = td.textContent.split('\n').map(v => v.trim()).filter(a => a);
                    if (verses.length) {
                        poem.content.push({
                            type: 'strophe',
                            verses,
                        });
                    }
                }
            });
        }

        if (!poem.content.length) {
            let contentNodesStarted = false;
            let contentNodesEnded = false;
            document.querySelector('body')?.childNodes.forEach(node => {
                if (node.nodeName === 'HR') {
                    if (!contentNodesStarted) {
                        contentNodesStarted = true;
                    } else {
                        contentNodesEnded = true;
                    }
                }
                if (contentNodesStarted && !contentNodesEnded) {
                    if (node.nodeName === 'H4') {
                        poem.content.push({
                            type: 'heading',
                            text: fixEncoding(node.textContent.trim()),
                        });
                    }
                    if (node.nodeName === 'P') {
                        const verses = [];
                        node.childNodes.forEach(childNode => {
                            if (childNode.nodeType === dom.window.Node.TEXT_NODE && !childNode.textContent.match(/^\s*$/)) {
                                verses.push(fixEncoding(childNode.textContent.trim()));
                            }
                        });
                        poem.content.push({
                            type: 'strophe',
                            verses,
                        })
                    }
                }
            });
        }

        poem.title ??= poem.content?.[0].verses[0];
        const filePrefix = poem.book.toLowerCase().includes('wunderhorn') ? 'des-knaben-wunderhorn' : `${poem.author.split(' ').at(-1)}`;
        filename = slugify(`${filePrefix} ${poem.title}`);
        
    }

    if (url.includes('zeno.org')) {
        poem = {
            title: document.querySelector('.zenoCOMain h5').textContent.trim().replace(/\.$/, ''),
            author: document.querySelector('.zenoCOFooterLineRight').textContent.replace(/^(.+):.*/,'$1'),
            book: document.querySelector('.zenoCOFooterLineRight').textContent.replace(/^(.+): (.+?),.*/,'$2'),
            url,
            content: [],
            copyright: 'Quelle: http://www.zeno.org - Henricus - Edition Deutsche Klassik GmbH',
        };
        poem.content.push({
            type: 'strophe',
            verses: [],
        })
        document.querySelector('.zenoCOMain').childNodes.forEach(node => {
            if (node.nodeType === dom.window.Node.TEXT_NODE && !node.textContent.match(/^\s*$/)) {
                throw new Error(`${node.textContent} is not an empty node`);
            }
            if (node.nodeName === 'P') {
                poem.content[poem.content.length - 1].verses.push(node.textContent.replaceAll(/\[\d+\]/g, '').trim());
            }
            if (node.nodeName === 'BR') {
                poem.content.push({
                    type: 'strophe',
                    verses: [],
                })
            }
        });
        poem.content = poem.content.filter(elem => elem.type !== 'strophe' || elem.verses.length)
        const filePrefix = poem.author.split(' ').at(-1);
        filename = slugify(`${filePrefix} ${poem.title}`);
    }
    
    poem.content = poem.content.filter(item => {
        return item.type !== 'strophe' || item.verses.length > 1;
    });

    fs.writeFileSync(`${path}${filename}.yaml`, yaml.dump(poem, {
        indent: 4,
        lineWidth: -1,
        sortKeys: true,
        // flowLevel: 2,
    }));

})

function slugify(str) {
	return str
		.toLowerCase()
		.trim()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function fixEncoding(str) {
    return str;
    const bytes = new Uint8Array([...str].map(char => char.charCodeAt(0)));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}
