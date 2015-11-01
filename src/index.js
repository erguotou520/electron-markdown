var app = require('app'),
  main = require('./main')

// 给我们的服务器发送异常报告。
require('crash-reporter').start()

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform != 'darwin') {
    app.quit()
  }
})

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候这个方法就被调用
app.on('ready', function() {
  main.createWindow()
})

// 初始化main线程
main.init()
