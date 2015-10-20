var fs = require('fs'),
  shell = require('shell'),
  ipc = require('ipc'),
  marked = require( 'marked'),
  $markdown = document.getElementById('markdown'),
  $html = document.getElementById('html'),
  hiddenPath = null

// 初始化操作
function init() {
  // 设置markdown解析器
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  })
  // 监听输入
  $markdown.addEventListener('keyup', function () {
    $html.innerHTML = marked($markdown.value)
  })
  // 监听a标签
  document.body.addEventListener('click', function (e) {
    var node = e.target
    if (node.nodeName.toLowerCase() === 'a') {
      var href = node.getAttribute('href')
      if (href && !shell.openExternal(href)) {
        alert('不是一个合法的地址')
      }
      e.preventDefault()
    }
  })
  // 监听拖拽文件
  $markdown.ondragover = function () {
    return false
  }
  $markdown.ondragleave = $markdown.ondragend = function () {
    return false
  }
  $markdown.ondrop = function (e) {
    e.preventDefault()
    var file = e.dataTransfer.files[0]
    showFile(file.path)
    return false
  }
  // 获得焦点
  $markdown.focus()
  // 是否传入文件路径
  if (window.__args__.filePath) {
    showFile(window.__args__.filePath)
  }
}

// 打开.md文件
function showFile(filePath) {
  fs.readFile(filePath, 'utf-8', function(err, data) {
    if (err) {alert('读取文件失败');return}
    $markdown.innerHTML = data
    $html.innerHTML = marked(data)
    filePath = filePath
    hiddenPath = filePath
  })
}

// 打开1个或多个.md文件
function openFile() {
  var opened = ipc.sendSync('open.file')
  if (opened.length > 0) {
    // 判断当前内容是否为空，如果为空，在当前窗口打开文件，如果不是，新开窗口
    if (!$markdown.value) {
      showFile(opened[0])
      filePaths.shift()
    }
    if (opened.length > 0) {
      ipc.send('show.files', opened)
    }
  }
}

// 保存文件到某位置
function saveFileTo(newFilePath, content) {
  fs.writeFile(newFilePath, content, function (err) {
    if (err) {alert(err);return}
    hiddenPath = newFilePath
  });
}

// 另存为
function saveFileAs() {
  saveFileTo(ipc.sendSync('save.as'), $markdown.value)
}

// 保存文件
function saveFile() {
  if (hiddenPath) {
    // 保存到打开的文件位置
    saveFileTo(hiddenPath, $markdown.value)
  } else {
    saveFileAs()
  }
}

// todo:再次获得焦点时之前打开的文件是否存在？是否被修改

module.exports = {
  init: init,
  showFile: showFile,
  openFile: openFile,
  saveFileAs: saveFileAs,
  saveFile: saveFile
}
