var app = require('app');  // 控制应用生命周期的模块。
var BrowserWindow = require('browser-window');  // 创建原生浏览器窗口的模块
var ipc = require('ipc');

// 给我们的服务器发送异常报告。
require('crash-reporter').start();

// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;
// 打开的窗口列表
var openedWindows = {};

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// 打开的窗口的高度和宽度
var windowHeihgt = 600, windowWidth = 900;

// 创建一个窗口
function createWindow(file_path) {
  var _option = {width: windowWidth, height: windowHeihgt};
  if (file_path) {
    // TOFIX:title
    _option.title = file_path;
  }
  var mdWindow = new BrowserWindow(_option);
  openedWindows[mdWindow.id] = mdWindow;
  mdWindow.loadUrl('file://' + __dirname + '/index.html');
  mdWindow.on('closed', function(e) {
    delete openedWindows[mdWindow.id];
    mdWindow = null;
  })
  return mdWindow;
}

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function () {
  createWindow()
});

// 打开多个文件
ipc.on('open.files', function (event, file_paths) {
  for (var i = 0; i < file_paths.length; i++) {
    var win = createWindow();
    win.show();
    // TOFIX: open file selected
    win.webContents.send('opened.file', file_paths[i]);
  }
})

// 关闭程序
ipc.on('app.close', function () {
  app.quit();
})
