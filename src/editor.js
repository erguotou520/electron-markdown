var fs = require('fs'),
  shell = require('shell'),
  ipc = require('ipc'),
  marked = require( 'marked'),
  fileWatcher = require('filewatcher')(),
  $markdown = document.getElementById('markdown'),
  $html = document.getElementById('html'),
  windowId = null,
  hiddenPath = null,
  isSaved = false

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
    var files = e.dataTransfer.files
    var filePaths = []
    for (var i = 0; i < files.length; i++) {
      filePaths.push(files[i].path)
    }
    showFiles(filePaths)
    return false
  }
  // 文件改动监听
  fileWatcher.on('change', function (file, stat) {
    if (!stat) {
      console.log('deleted: %s', file)
      // 文件删除后设置保存的文件路径为空
      hiddenPath = null
    } else {
      showFile(file)
      isSaved = true
    }
  })
  // 获得焦点
  $markdown.focus()
  // 是否传入文件路径
  if (window.__args__.filePath) {
    showFile(window.__args__.filePath)
  }
  // 保存窗口的id
  windowId = window.__args__.id
}

// 判断需要打开的文件是否已经打开，返回需要新窗口打开的路径集合
function getUnopenedList(filePaths) {
  var removeList = []
  for (var i = 0; i < filePaths.length; i++) {
    if (ipc.sendSync('check.opened', filePaths[i])) {
      removeList.push(i)
    }
  }
  for (var i = 0; i < removeList.length; i++) {
    filePaths.splice(removeList[i], 1)
  }
  return filePaths
}

// 展示.md文件
function showFile(filePath) {
  fs.readFile(filePath, 'utf-8', function(err, data) {
    if (err) {alert('读取文件失败');return}
    $markdown.value = data
    $html.innerHTML = marked(data)
    // 保存旧路径
    var oldPath = hiddenPath
    hiddenPath = filePath
    ipc.send('opened.file.path', windowId, filePath)
    if (oldPath) {
      // 如果有之前的文件就去除监听（似乎当前文件打开策略不会出现这种情况）
      fileWatcher.remove(oldPath)
    }
    fileWatcher.add(filePath)
  })
}

// 展示多个.md文件
function showFiles(filePaths) {
  if (getUnopenedList(filePaths).length > 0) {
    // 判断当前内容是否为空，如果为空，在当前窗口打开文件，如果不是，新开窗口
    if (!$markdown.value) {
      showFile(filePaths.shift())
    }
    if (filePaths.length > 0) {
      ipc.send('show.files', filePaths)
    }
  }
}

// 打开1个或多个.md文件
function openFile() {
  var opened = ipc.sendSync('open.file')
  showFiles(opened)
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
  openFile: openFile,
  saveFile: saveFile,
  saveFileAs: saveFileAs
}
