var fs = require('fs'),
  shell = require('shell'),
  marked = require( 'marked'),
  ipc = require('ipc'),
  $markdown = document.getElementById('markdown'),
  $html = document.getElementById('html'),
  filePath = ''
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
$markdown.addEventListener('keyup', function () {
  $html.innerHTML = marked($markdown.value)
})
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
$markdown.ondragover = function () {
  return false
}
$markdown.ondragleave = $markdown.ondragend = function () {
  return false
}
$markdown.ondrop = function (e) {
  e.preventDefault()
  var file = e.dataTransfer.files[0]
  fs.readFile(file.path, 'utf-8', function(err, data) {
    if (err) {alert('读取文件失败');return}
    $markdown.innerHTML = data
    $html.innerHTML = marked(data)
    filePath = file.path
  })
  return false
}
ipc.on('markdown.open.files', function (event, files) {
  console.log(files)
})