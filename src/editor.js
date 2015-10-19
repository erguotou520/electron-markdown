var fs = require('fs'),
  shell = require('shell'),
  ipc = require('ipc'),
  marked = require( 'marked'),
  $markdown = document.getElementById('markdown'),
  $html = document.getElementById('html'),
  filePath = ''

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

// 打开.md文件
function showFile(file_path) {
  fs.readFile(file_path, 'utf-8', function(err, data) {
    if (err) {alert('读取文件失败');return}
    $markdown.innerHTML = data
    $html.innerHTML = marked(data)
    filePath = file_path
  })
}

// 打开多个.md文件
function showMultiFile(file_paths) {
  if (file_paths.length > 0) {
    // 判断当前内容是否为空，如果为空，在当前窗口打开文件，如果不是，新开窗口
    if (!$markdown.value) {
      showFile(file_paths[0])
      file_paths.shift()
    }
    if (file_paths.length > 0) {
      ipc.send('open.files', file_paths)
    }
  }
}

// 获得焦点
$markdown.focus()

module.exports = {
  showFile: showFile,
  showMultiFile: showMultiFile
}
