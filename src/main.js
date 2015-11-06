var path = require('path'),
  ipc = require('ipc'),
  BrowserWindow = require('browser-window'),
  _window = require('electron-window'),
  appinfo = require('../package.json'),
  dialog = require('./dialog'),
  openedPaths = {},                             // 已打开的文件路径
  windowHeihgt = 600,                           // 窗口的默认高度
  windowWidth = 1024                            // 窗口的默认宽度

// 初始化
function init() {
  menu = require('./menu')
  // 保存时需要指定存储位置
  ipc.on('file.save.to', function (e) {
    e.returnValue = dialog.saveFileAs()
  })

  // 判断是否已经打开了某文件
  ipc.on('editor.check.opened', function (e, filePath) {
    if (openedPaths[filePath]) {
      // 已经打开过此文件
      openedPaths[filePath].focus()
      e.returnValue = true
    } else {
      e.returnValue = false
    }
  })

  // 打开了一个本地文件
  ipc.on('editor.opened.file', function (e, windowId, filePath) {
    openedPaths[filePath] = _window.windows[windowId]
    _window.windows[windowId].__filePath = filePath
    _window.windows[windowId].setTitle(filePath)
  })

  // 展示多个文件
  ipc.on('editor.show.files', function (event, filePaths) {
    for (var i = 0; i < filePaths.length; i++) {
      createWindow(filePaths[i])
    }
  })
}

// 创建一个窗口
function createWindow(filePath) {
  var _option = {width: windowWidth, height: windowHeihgt, title: appinfo.name}
  // TOFOX:似乎会取不到当前焦点窗口
  var _focusWindow = BrowserWindow.getFocusedWindow()
  if (_focusWindow) {
    var _bounds = _focusWindow.getBounds()
    _option.x = _bounds.x + 20,
    _option.y = _bounds.y + 20
  }
  if (filePath) {
    _option.title = filePath
  }
  var mdWindow = _window.createWindow(_option)
  mdWindow.showUrl(path.resolve(__dirname, './index.html'), {
    filePath: filePath,
    id: mdWindow.id
  })
  mdWindow.on('close', function () {
    var __filePath = _window.windows[mdWindow.id].__filePath
    if (__filePath) {
      // 删除保存的已打开文件列表
      delete openedPaths[__filePath]
    }
  })
  return mdWindow
}

module.exports = {
  init: init,
  createWindow: createWindow
}
