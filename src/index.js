var app = require('app'),
  path = require('path'),
  BrowserWindow = require('browser-window'),
  _window = require('electron-window'),
  ipc = require('ipc'),
  file = require('./file');

// 给我们的服务器发送异常报告。
require('crash-reporter').start();

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// 打开的窗口的高度和宽度
var windowHeihgt = 600, windowWidth = 1024;

// 创建一个窗口
function createWindow(filePath) {
  var _option = {width: windowWidth, height: windowHeihgt}
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
    filePath: filePath
  });
  return mdWindow;
}

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候这个方法就被调用
app.on('ready', function () {
  createWindow()
});

// 新建一个窗口
ipc.on('open.new', function () {
  createWindow()
})

// 打开文件
ipc.on('open.file', function (e) {
  e.returnValue = file.openFile()
})

// 另存为
ipc.on('save.as', function (e) {
  e.returnValue = file.saveFileAs()
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
