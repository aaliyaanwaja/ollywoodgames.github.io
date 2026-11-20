// Loads the simulation core and every level pack into Node.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'one-man-team', 'js');
global.OMT_LEVELS = [];
const packs = fs.readdirSync(path.join(dir, 'levels')).filter(f => /^pack\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));
packs.forEach(f => { const n0 = global.OMT_LEVELS.length; require(path.join(dir, 'levels', f)); for (let i = n0; i < global.OMT_LEVELS.length; i++) global.OMT_LEVELS[i]._pack = parseInt(f.slice(4)); });
const { FB } = require(path.join(dir, 'sim.js'));
let SCRIPTS = [];
packs.forEach(f => { const p = path.join(__dirname, 'scripts', f); if (fs.existsSync(p)) SCRIPTS = SCRIPTS.concat(require(p)); else console.log('!! no bot scripts for ' + f); });
module.exports = { FB, SCRIPTS, packs };
