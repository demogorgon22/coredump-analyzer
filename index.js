const fileWorker = require('./fileWorker');
const gui = require('./gui');
console.log('Launching TUI....');
const backtraces = fileWorker.getCoreData();
gui.init(backtraces);
