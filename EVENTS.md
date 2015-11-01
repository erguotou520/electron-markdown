# Events in development

## main process
### send
* `menu.save`                 save file(from menu)
* `menu.save.as`              save file to(from menu)
* `menu.opened`               when file is opened(from menu)
### on
* `editor.check.opened`
* `editor.opened.file`
* `editor.show.files`

## renderer process
### send
* `editor.check.opened`       check a window is opened(to active it)
* `editor.opened.file`        when the editor opened a file
* `editor.show.files`         when drag some files
### on
* `menu.save`
* `menu.save.as`
* `menu.opened`
