var dialog = require('dialog');
function openFiles() {
  return dialog.showOpenDialog({
    filters:[{name: 'Markdown', extensions: ['md']}],
    properties: ['openFile', 'multiSelections']
  })
}

function getSavePath() {
  return dialog.showSaveDialog({
    filters:[{name: 'Markdown', extensions: ['md']}]
  })
}
module.exports = {
  openFiles: openFiles,
  getSavePath: getSavePath
}
