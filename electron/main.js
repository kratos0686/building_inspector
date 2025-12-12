const { app, BrowserWindow, shell, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let win; let checkingUpdates=false;
function createWindow(){
  win = new BrowserWindow({
    width:1200, height:800, backgroundColor:'#0f172a',
    webPreferences:{ contextIsolation:true, nodeIntegration:false, sandbox:true, devTools:false, preload:path.join(__dirname,'preload.js') }
  });
  win.loadFile(path.join(__dirname,'..','index.html'));
  win.webContents.setWindowOpenHandler(({url})=>{ shell.openExternal(url); return {action:'deny'}; });
}

function buildAppMenu(){
  const helpSubmenu=[
    { label:'Check for Updates…', id:'checkForUpdates', click:()=>manualCheckForUpdates(), enabled:!checkingUpdates },
    { type:'separator' },
    { label:'View Release Notes', click:()=> shell.openExternal('https://github.com/kratos0686/building-inspectors-releases/releases/latest') }
  ];
  const template=[
    { label:'File', submenu:[ {role: process.platform==='darwin'?'close':'quit'} ] },
    { label:'View', submenu:[ {role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'} ] },
    { label:'Help', role:'help', submenu:helpSubmenu }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
function setCheckMenuEnabled(enabled){ const menu=Menu.getApplicationMenu(); const item=menu?.getMenuItemById('checkForUpdates'); if(item) item.enabled=enabled; }
async function manualCheckForUpdates(){ if(checkingUpdates) return; checkingUpdates=true; setCheckMenuEnabled(false); try{ await autoUpdater.checkForUpdates(); }catch(e){ console.error(e); }}

app.whenReady().then(async()=>{
  // SPLASH first
  const { createSplash } = require('./splash');
  const splash = createSplash();
  buildAppMenu();

  // Updater config
  const prefs = getPrefs();
  const testerMode = !!prefs.testerMode;
  autoUpdater.channel = testerMode ? 'beta' : 'latest';
  autoUpdater.allowPrerelease = testerMode;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = (prefs.installOnQuit ?? true);

  try{ const log=require('electron-log'); autoUpdater.logger=log; autoUpdater.logger.transports.file.level='info'; }catch(e){}

  autoUpdater.on('checking-for-update', ()=>{ checkingUpdates=true; setCheckMenuEnabled(false); });
  autoUpdater.on('update-not-available', ()=>{ checkingUpdates=false; setCheckMenuEnabled(true); if(win){ dialog.showMessageBox(win,{type:'info',title:'No Updates',message:`You are running the latest version on the "${autoUpdater.channel}" channel.`}); }});
  autoUpdater.on('error', (err)=>{ checkingUpdates=false; setCheckMenuEnabled(true); console.error('Updater error:', err); if(win){ dialog.showMessageBox(win,{type:'error',title:'Update Error',message:'Error checking for updates.',detail:String(err)}); } });
  autoUpdater.on('update-available', async(info)=>{ checkingUpdates=false; setCheckMenuEnabled(true); const res=await dialog.showMessageBox(win,{ type:'info', buttons:['Download','Cancel'], defaultId:0, cancelId:1, title:'Update Available', message:`Version ${info.version} is available on "${autoUpdater.channel}".` }); if(res.response===0){ autoUpdater.downloadUpdate().catch(console.error); }});
  autoUpdater.on('update-downloaded', async(info)=>{ const res=await dialog.showMessageBox(win,{ type:'question', buttons:['Install & Restart','Later'], defaultId:0, cancelId:1, title:'Update Ready', message:`Version ${info.version} downloaded.`, detail: (autoUpdater.autoInstallOnAppQuit)?'Install now or automatically on quit':'Install now or later via Help → Check for Updates.' }); if(res.response===0){ autoUpdater.quitAndInstall(); }});

  // Show main after short delay
  setTimeout(()=>{ try{ if (splash && !splash.isDestroyed()) splash.destroy(); }catch(e){} createWindow(); }, 1300);

  // IPC bridges
  ipcMain.handle('updater:get-auto-install', ()=> !!autoUpdater.autoInstallOnAppQuit );
  ipcMain.on('updater:set-auto-install', (_evt, enabled)=>{ const flag=!!enabled; autoUpdater.autoInstallOnAppQuit=flag; const cur=getPrefs(); cur.installOnQuit=flag; setPrefs(cur); });
  ipcMain.handle('updater:get-tester-mode', ()=> !!getPrefs().testerMode );
  ipcMain.on('updater:set-tester-mode', async (_evt, enabled)=>{ const flag=!!enabled; const cur=getPrefs(); cur.testerMode=flag; setPrefs(cur); const res=await dialog.showMessageBox(win,{ type:'question', buttons:['Restart Now','Later'], defaultId:0, cancelId:1, title:'Restart Required', message: flag ? 'Tester Mode enabled → beta channel.' : 'Tester Mode disabled → stable channel.' }); if(res.response===0){ app.relaunch(); app.exit(0);} });
  ipcMain.on('updater:switch-now', (_evt, enabled)=>{ const cur=getPrefs(); cur.testerMode=!!enabled; setPrefs(cur); app.relaunch(); app.exit(0); });
  ipcMain.on('updater:switch-now-confirm', async (_evt, enabled)=>{ const flag=!!enabled; const res=await dialog.showMessageBox(win,{ type:'question', buttons:['Apply & Restart','Cancel'], defaultId:0, cancelId:1, title:'Apply & Restart', message: flag ? 'Switch to beta channel now?' : 'Switch to stable channel now?', detail:'The app will relaunch immediately.' }); if(res.response===0){ const cur=getPrefs(); cur.testerMode=flag; setPrefs(cur); app.relaunch(); app.exit(0);} });
});

// Prefs storage
const prefPath = path.join(app.getPath('userData'), 'prefs.json');
function getPrefs(){ try{ return JSON.parse(fs.readFileSync(prefPath,'utf8')); }catch{ return {}; } }
function setPrefs(p){ fs.writeFileSync(prefPath, JSON.stringify(p,null,2),'utf8'); }

app.on('window-all-closed', ()=>{ if(process.platform!=='darwin') app.quit(); });
