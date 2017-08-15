window.onload = function () {
  var chat = new Chat()
  chat._Init()
}
//定义一个Chat类用于开发整个程序
var Chat = function () { 
  this.socket = null
}

var emojiwrapper = document.getElementById('emoji-wrapper')
var input = document.getElementById('input')
var colorStyle = document.getElementById('color')
var userlist=document.getElementById('userList')

/**
 * 向chat原型添加业务方法:
 * _Init()
 * _InitialEmoji()
 * _DisplayNewMsg(user, msg, color)
 * _DisplayImage(user, imgData, color)
 * _ShowEmoji(msg)
 */
Chat.prototype = {
  _Init: () => {
    var that = this
    this.socket = io.connect()
    this.socket.on('connect', function () {   //连接成功后显示昵称输入框
      document.getElementById('info').textContent = "get yourself username... :)" //显示昵称被占用提示
      document.getElementById('nick-wrapper').style.display = 'block'
      document.getElementById('username').focus()
    })
    /**
     * 设置昵称
     */
    document.getElementById('login-btn').addEventListener('click', function () {
      var username = document.getElementById('username').value;
      var legal = true,
          pattern = new RegExp("[<>`/?!%']|~")
      if (username.trim() != '') {
        if (pattern.test(username)) {
          username = ""
          alert("昵称不能包含特殊字符:[<>`/?!%']|~~'")
          return false
        }
        else that.socket.emit('login', username)  //不为空，发起一个login事件并将输入的昵称发送到服务器
      }
      else {
        alert('昵称不能为空')
        document.getElementById('username').focus() //否则输入框获得焦点
      }
        
    }, false)
    document.getElementById('username').addEventListener('keyup', function (e) { 
      if (e.keyCode == 13) { 
        var username = document.getElementById('username').value
        if (username.trim().length != 0) { 
          that.socket.emit('login',username)  //这里的that是包含socket
        }
      }
    }, false)
    this.socket.on('usernameExist', function () {     //判断昵称是否重复
      document.getElementById('info').textContent="The username is taken, please choose anthor"
    })
    /**
     * 登陆
     */
    this.socket.on('loginSuccess', function () { 
      document.title = 'Chat |' + document.getElementById('username').value
      document.getElementById('cover-wrapper').style.display = 'none' //隐藏遮罩层
      document.getElementById('input').focus()
    })

    /**
     * 用户列表的更新
     */
    this.socket.on('userList', function (users) {
      userlist.textContent=''
      console.log(userlist.textContent)
      users.forEach(function (element) { 
        var newUser = document.createElement('li')
        newUser.textContent=element
        userlist.appendChild(newUser)
      })
    })
    
    /**
     * 系统消息显示(包括在线人数和用户退出聊天)
     */
    this.socket.on('system', function (username,usercount,type) { 
      var msg = username + (type == 'login' ? ' 加入聊天室' : ' 离开聊天室')
      Chat.prototype._DisplayNewMsg('系统消息 ', msg, 'red')
      document.getElementById('status').textContent = usercount + ' 位用户在线'
    })

    /**
     * 用户发送消息
     */
    document.getElementById('send-btn').addEventListener('click', function () {
      var msg = input.value,
          color=colorStyle.value
      if (msg.trim() != 0) { 
        that.socket.emit('sendMsg', msg, color) //把消息发送到服务器
        Chat.prototype._DisplayNewMsg('我', msg, color)  //把自己的消息显示在自己的窗口中
      }
      else alert('输入框不能为空...')
      input.value = ""
    })
    this.socket.on('newMsg', function (user,msg,color) { //消息监听
      Chat.prototype._DisplayNewMsg(user,msg,color)
    })

    /**
     * 发送图片
     */
    document.getElementById('sendImage').addEventListener('change', function () {
      var files = this.files,
          file = files[0],
          color=colorStyle.value
      if (!/\/(?:jpeg|jpg|png|gif)/i.test(file.type)) return
      var reader = new FileReader()
      if (!reader) { 
        Chat.prototype._DisplayNewMsg('系统消息 ','您的浏览器不支持图片发送功能...','blue')
      }
        this.value = ''
      reader.onload = function (img) {
        that.socket.emit('postImg', img.target.result,color)
        Chat.prototype._DisplayImage('我', img.target.result, color)
      }
      reader.readAsDataURL(file)
    },false)
    this.socket.on('newImg', function (user,msg,color) { 
      Chat.prototype._DisplayImage(user,msg,color)
    })

    /**
     * emoji
     */
    Chat.prototype._InitialEmoji()
    document.getElementById('emoji').addEventListener('click', function (e) { 
      emojiwrapper.style.display = 'block'
      e.stopPropagation()
    }, false)
    document.body.addEventListener('click', function (e) { 
      if (e.target != emojiwrapper) emojiwrapper.style.display='none'
    })
    emojiwrapper.addEventListener('click', function (e) { 
      var target = e.target
      if (target.nodeName.toLowerCase() == 'img') {
        input.focus()
        input.value = input.value + '[emoji:' + target.title + ']'
       }
    }, false)
    
    document.getElementById('clear-btn').addEventListener('click', function () { 
      document.getElementById('recv-area').textContent = ""
    })

  },

  _InitialEmoji: () => {  //初始化好所有的表情
    var  docFragment = document.createDocumentFragment()
    for (let i = 69; i > 0; i--) { 
      var emojiItem = document.createElement('img')
      emojiItem.src = '../../assets/emoji/' + i + '.gif'
      emojiItem.title = i
      docFragment.appendChild(emojiItem)
    }    
    emojiwrapper.appendChild(docFragment)
  },

  _DisplayNewMsg: (user, msg, color) => { 
    var systemMsg = document.getElementById('recv-area')
    var newMsg = document.createElement('p')
    var msg= Chat.prototype._ShowEmoji(msg)
    newMsg.style.color = color || '#000'
    newMsg.innerHTML = user + ' (' + new Date().toTimeString().substr(0, 8) + ') : '+ msg
    systemMsg.appendChild(newMsg)
    systemMsg.scrollTop = systemMsg.scrollHeight
  },

  _DisplayImage: (user, imgData, color) => { 
    var userMsg = document.getElementById('recv-area'),
        newMsg = document.createElement('p')
    newMsg.style.color = color || '#000'
    newMsg.innerHTML = user + ' (' + new Date().toTimeString().substr(0, 8) + ') : '+ '<a href="' + imgData + '" target="_blank"><img src="'+imgData+'"></a>'
    userMsg.appendChild(newMsg)
    userMsg.scrollTop = userMsg.scrollHeight
  },

  _ShowEmoji: (msg) => { 
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = emojiwrapper.children.length
    while (match = reg.exec(msg)) { 
      emojiIndex = match[0].slice(7, -1)
      if (emojiIndex > totalEmojiNum) {
        result = result.replace(match[0], '[X]')
      }
      else { 
        result=result.replace(match[0],'<img class="emoji" src="../../assets/emoji/' + emojiIndex + '.gif" />')
      }
    }
    return result
  },

  _DisplayUserList: (username) => { 
      var newUser = document.createElement('li')
      newUser.textContent=username
      userlist.appendChild(newUser)
  }
 
}