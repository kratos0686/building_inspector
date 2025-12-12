const { BrowserWindow } = require('electron');
const path = require('path');
function createSplash(){
  const splash = new BrowserWindow({ width: 960, height: 540, frame: false, resizable: false, show: true, backgroundColor:'#111827' });
  splash.loadFile(path.join(__dirname, '..', 'splash.html'));
  return splash;
}
module.exports = { createSplash };
