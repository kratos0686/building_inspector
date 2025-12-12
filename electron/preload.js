const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  getAutoInstallOnQuit: () => ipcRenderer.invoke('updater:get-auto-install'),
  setAutoInstallOnQuit: (enabled) => ipcRenderer.send('updater:set-auto-install', !!enabled),
  getTesterMode: () => ipcRenderer.invoke('updater:get-tester-mode'),
  setTesterMode: (enabled) => ipcRenderer.send('updater:set-tester-mode', !!enabled),
  switchTesterModeNow: (enabled) => ipcRenderer.send('updater:switch-now', !!enabled),
  switchTesterModeNowConfirm: (enabled) => ipcRenderer.send('updater:switch-now-confirm', !!enabled)
});
