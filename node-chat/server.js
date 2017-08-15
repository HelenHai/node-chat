var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

var users = []    //保存所有在线用户昵称

app.use('/', express.static(__dirname + '/pages'))
server.listen(3000, function () { 
  console.log('服务器已成功启动')
})

//socket 部分
io.sockets.on('connection', function (socket) { 
  //新用户上线
  socket.on('login', function (username) { 
    console.log('成功建立连接...')
    if (users.indexOf(username) > -1) {
      socket.emit('usernameExist' )
    }
    else { 
      socket.username = username
      users.push(username)
      socket.emit('loginSuccess')
      //向所有连接到服务器的客户端发送当前用户登录昵称
      io.sockets.emit('system', username, users.length, 'login')
      io.sockets.emit('userList', users)
    } 
  })
  //用户离开
  socket.on('disconnect', function () {
    if (socket.username != null) { 
      users.splice(users.indexOf(socket.username), 1)
      socket.broadcast.emit('system', socket.username, users.length, 'logout')
      // socket.broadcast.emit('userList', users)
    }
  })
  //新消息
  socket.on('sendMsg', function (msg,color) { 
    console.log('发送新消息...')
    socket.broadcast.emit('newMsg',socket.username,msg,color)
  })
  //图片接受
  socket.on('postImg', function (imgData) { 
    console.log('服务器已经接受到图片信息...')
    socket.broadcast.emit('newImg',socket.username,imgData,socket.color)
  })
}) 