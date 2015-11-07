var app = require('app'),
  path = require('path'),
  BrowserWindow = require('browser-window'),
  _window = require('electron-window'),
  ipc = require('ipc'),
  appinfo = require('../package.json'),
  dialog = require('./dialog'),
  openedWindows = {},
  openedPaths = {};

// 给我们的服务器发送异常报告。
require('crash-reporter').start();

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  // if (process.platform != 'darwin') {
    app.quit();
  //}
});

// 打开的窗口的高度和宽度
var windowHeihgt = 600, windowWidth = 1024;

// 创建一个窗口
function createWindow(filePath) {
  var _option = {width: windowWidth, height: windowHeihgt, title: appinfo.name}
  // TOFOX:似乎会取不到当前焦点窗口
  var _focusWindow = BrowserWindow.getFocusedWindow();
  if (_focusWindow) {
    var _bounds = _focusWindow.getBounds();
    _option.x = _bounds.x + 20,
    _option.y = _bounds.y + 20
  }
  if (filePath) {
    _option.title = filePath
  }
  var mdWindow = _window.createWindow(_option);
  mdWindow.showUrl(path.resolve(__dirname, './index.html'), {
    filePath: filePath,
    id: mdWindow.id
  })
  mdWindow.on('closed', function () {
    var sameWinId = null
    for(var id in openedWindows) {
      if (openedWindows[id] === mdWindow) {
        sameWinId = id
        delete openedWindows[id]
        break
      }
    }
    if (sameWinId) {
      for (var path in openedPaths) {
        if (openedPaths[path] === sameWinId) {
          delete openedPaths[path]
          break;
        }
      }
    }
  })
  openedWindows[mdWindow.id] = mdWindow
  return mdWindow
}

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候这个方法就被调用
app.on('ready', function () {
  createWindow()
})

// 判断是否已经打开了某文件
ipc.on('check.opened', function (e, filePath) {
  if (openedPaths[filePath]) {
    // 已经打开过此文件
    openedPaths[filePath].focus()
    e.returnValue = true
  } else {
    e.returnValue = false
  }
})

// 新建一个窗口
ipc.on('open.new', function () {
  createWindow()
})

// 打开文件
ipc.on('open.file', function (e) {
  e.returnValue = dialog.openFile()
})

// 打开了一个本地文件
ipc.on('opened.file.path', function (e, windowId, filePath) {
  openedPaths[filePath] = openedWindows[windowId]
  openedWindows[windowId].setTitle(filePath)
})

// 另存为
ipc.on('save.as', function (e) {
  e.returnValue = dialog.saveFileAs()
})

// 展示多个文件
ipc.on('show.files', function (event, filePaths) {
  for (var i = 0; i < filePaths.length; i++) {
    var win = createWindow(filePaths[i]);
  }
})

// 关闭程序
ipc.on('app.close', function () {
  app.quit();
})
