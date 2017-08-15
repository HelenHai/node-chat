# express+socket.io 实现在线即时聊天

## 目录结构
|---node_modules<br>
|---pages<br>
|---|----assets       //项目资源<br>
|---|----index.html   //入口主页面<br>
|---socket.io<br>
|---index.html<br>
|---package.json<br>
|---server.js         //服务端配置<br>


## 运行方式
```js
node server.js
```
## 实现功能
1. 发送文字
2. 发送表情、图片
3. 设置字体颜色
4. 清除记录
5. 显示在线用户列表（挖坑...方便实现独聊）

[注]：
关于发送表情和图片：表情可以和文字组合发送，图片采用FileReader方式上传。由于图片经过压缩后看不清，可以通过点击查看图片的方式来查看原图

## 关于安全性
1. 用户昵称采用了正则过滤的方式
2. 消息的发送由于采取了innerHTML的方式，所以安全性低。至于为什么没有采用textContent是由于需要通过 img 发送图片，所以没有使用textContent。(**安全性正在优化中**)

