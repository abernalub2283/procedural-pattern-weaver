const fs = require('fs');
const args = process.argv.slice(2);
const lengthInches = parseInt(args[2], 10) || 60;


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

function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function writePattern(center, edge, solution, masterRows, edgeTotal, lengthInches) {
    const edgePerSide = edgeTotal / 2;
    const centerSts = center.stitches * solution.repeats;

    console.log('');
    console.log('--- ' + center.name + ' Scarf ---');
    console.log('Cast on ' + solution.total + ' stitches.');
    console.log('');
    console.log('STITCH GUIDE');
    console.log(center.name + ' (' + center.stitches + ' sts, ' + center.rows + '-row repeat):');
    center.instructions.forEach(function(line) {
        console.log('  ' + line);
    });
    console.log(edge.name + ' (' + edge.stitches + ' sts, ' + edge.rows + '-row repeat):');
    edge.instructions.forEach(function(line) {
        console.log('  ' + line);
    });
    console.log('');
    console.log('MASTER REPEAT (' + masterRows + ' rows) — repeat until scarf measures ' + lengthInches + ' inches:');
    for (let r = 1; r <= masterRows; r++) {
        const centerRow = ((r - 1) % center.rows) + 1;
        const edgeRow = ((r - 1) % edge.rows) + 1;
        console.log('Row ' + r + ': ' + edge.name + ' row ' + edgeRow + ' over ' + edgePerSide + ' sts; ' + center.name + ' row ' + centerRow + ', ' + solution.repeats + 'x over ' + centerSts + ' sts; ' + edge.name + ' row ' + edgeRow + ' over ' + edgePerSide + ' sts.');
    }
    console.log('');
    const rowsPerInch = 6;
    const totalRows = Math.ceil(lengthInches * rowsPerInch / masterRows) * masterRows;
    const yardsPerRow = (centerSts * center.yarnMultiplier + edgeTotal * edge.yarnMultiplier) * 0.04;
    const totalYards = Math.ceil(yardsPerRow * totalRows * 1.1);
    console.log('YARDAGE (estimate): about ' + totalYards + ' yards for a ' + lengthInches + '-inch scarf, including a 10% buffer.');
    console.log('Bind off in pattern. Weave in ends. Block lightly.');
}


console.log('The Weaver presents:');
console.log('Center: ' + center.name + ' (' + center.type + ')');
console.log('Edges: ' + edge.name);
if (!solution) {
    console.log('No cast-on found between ' + minSts + ' and ' + maxSts + ' — try a wider range.');
} else {
    console.log('Work ' + solution.repeats + ' repeats of ' + center.name + '.');
    console.log('Cast on ' + solution.total + ' stitches.');
    const masterRows = lcm(center.rows, edge.rows);
    writePattern(center, edge, solution, masterRows, edgeTotal, lengthInches);

}
