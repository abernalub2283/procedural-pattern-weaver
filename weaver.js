const fs = require('fs');
const args = process.argv.slice(2);

function loadStitches() {
    const text = fs.readFileSync('stitches.json', 'utf8');
    return JSON.parse(text);
}

function pickRandom(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function pickByType(stitches, types) {
    const matches = stitches.filter(function(s) {
        return types.indexOf(s.type) !== -1;
    });
    return pickRandom(matches);
}

function solveCastOn(center, edgeTotal, minSts, maxSts) {
    for (let n = 1; n <= 10; n++) {
        const total = center.stitches * n + center.offset + edgeTotal;
        if (total >= minSts && total <= maxSts) {
            return { repeats: n, total: total };
        }
    }
    return null;
}

const stitches = loadStitches();
const minSts = parseInt(args[0], 10) || 32;
const maxSts = parseInt(args[1], 10) || 48;

const center = pickByType(stitches, ['cable', 'lace']);
const edge = pickByType(stitches, ['texture']);
const edgeTotal = edge.stitches * 4;

const solution = solveCastOn(center, edgeTotal, minSts, maxSts);

console.log('The Weaver presents:');
console.log('Center: ' + center.name + ' (' + center.type + ')');
console.log('Edges: ' + edge.name);
if (!solution) {
    console.log('No cast-on found between ' + minSts + ' and ' + maxSts + ' — try a wider range.');
} else {
    console.log('Work ' + solution.repeats + ' repeats of ' + center.name + '.');
    console.log('Cast on ' + solution.total + ' stitches.');
}
