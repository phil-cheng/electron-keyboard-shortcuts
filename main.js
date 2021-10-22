// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, globalShortcut, ipcMain} = require('electron')
const path = require('path')
const lockScreen = require('./lockScreen.node');

// 存储位置
const storage = require('electron-json-storage');
storage.setDataPath(path.join(__dirname, 'conf'));

let defaultIndexUrl = "http://www.baidu.com";

function createWindow () {
  // 隐藏头部菜单栏
  Menu.setApplicationMenu(null);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // 无边框窗口，隐藏顶部栏（最小、最大、关闭）栏
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
    fullscreen: true, // 全屏展示
    //show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载完页面再显示
  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.show()
  // })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  storage.get("user_json",function(error, data){
    if(error) throw error;
    if(data && data.indexUrl){
      mainWindow.loadURL(data.indexUrl);
    }else{
      mainWindow.loadURL(defaultIndexUrl);
    }
  })

  // 全局热键(关闭快捷键)
  // 退出
  globalShortcut.register('Ctrl + Alt + Shift + Z', () => {
    lockScreen.unlock();
    if (process.platform !== 'darwin') app.quit();
  })
  // 打开调试窗口
  globalShortcut.register('Ctrl + Shift + I', () => {
    console.log("i got it");
    mainWindow.webContents.openDevTools();
  })
  // 修改访问地址
  globalShortcut.register('Ctrl + Shift + P', () => {
    console.log("i got it");
     mainWindow.loadFile("index.html");
  })

  // 锁屏
  setTimeout(()=>{
    lockScreen.lock();
  },1000);

  // 霸占窗口
  setInterval(() => {
    if (!mainWindow.isFocused()) {
      mainWindow.focus();
    }
  }, 500);


// 绑定首页切换通知
ipcMain.on('asynchronous-message-change-index', (event, arg) => {
  storage.get('user_json',function(error, data){
    if(error) { 
      mainWindow.loadURL(defaultIndexUrl); 
    }
    if(data && data.indexUrl){
      mainWindow.loadURL(data.indexUrl);
    }
  })
})
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  lockScreen.unlock();
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit',function(){
  //注销全局快捷键
  globalShortcut.unregisterAll();
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
