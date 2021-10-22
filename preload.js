// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());

contextBridge.exposeInMainWorld('myAPI', {
  goIndex: () =>{
      ipcRenderer.send('asynchronous-message-change-index');
  },
  storageSet: (user_json, save_flag_function) =>{
    storage.set('user_json', user_json, (error) => { 
      if (error) throw error;
      save_flag_function('修改成功！')
    })
  }
  
});