var dialog = require('dialog');
function openFile() {
  return dialog.showOpenDialog({
    filters:[{name: 'Markdown', extensions: ['md']}],
    properties: ['openFile', 'multiSelections']
  })
}

function saveFileAs() {
  return dialog.showSaveDialog({
    filters:[{name: 'Markdown', extensions: ['md']}]
  })
}
module.exports = {
  openFile: openFile,
  saveFileAs: saveFileAs
}
