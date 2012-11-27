var utils = require('connect').utils,
    cookie = require('cookie'),
    config = require('../config');
//=================私人聊天使用session==============
var usersWS = {}; //存放聊天室所有连接的WebSocket列表

/*
 * 聊天处理
 * */
exports.main = function (io, socket) {
  var session = socket.handshake.session;
  var name = session.name;
  usersWS[name] = socket;
  /*
  * 更新在线列表
  * */
  var refresh_online = function () {
    var n = [];
    for (var i in usersWS) {
      n.push(i);
    }
    io.sockets.emit('online list', n);//所有人广播
  };
  refresh_online();

  socket.broadcast.emit('system message', '【' + name + '】回来了，大家赶紧去找TA聊聊~~');

  //公共信息
  socket.on('public message', function (msg, fn) {
    socket.broadcast.emit('public message', name, msg);
    fn(true);
  });
  //私人@信息
  socket.on('private message', function (to, msg, fn) {
    var target = usersWS[to];
    if (target) {
      fn(true);
      target.emit('private message', '【' + name + '】对你说', msg);
    }
    else {
      fn(false);
      socket.emit('message error', to, msg);
    }
  });
  //掉线，断开链接处理
  socket.on('disconnect', function () {
    delete usersWS[name];
    session = null;
    socket.broadcast.emit('system message', '【' + name + '】无声无息地离开了。。。');
    refresh_online();
  });
};

/*
* 验证身份
* */
exports.author = function (req, sessionStore, callback) {
  // 通过客户端的cookie字符串来获取其sessionId
  var oCookie = utils.parseJSONCookies(cookie.parse(decodeURIComponent(req.headers.cookie)));
  var connect_sid = oCookie[config.site.sessionKey];

  if (connect_sid) {
    //var regx = /[:][a-zA-Z0-9\/+]*/;
    //console.log(connect_sid);
    //connect_sid =  String(connect_sid.match(regx)).substring(1);
    //console.log(connect_sid);
    var array = connect_sid.split(".");
    connect_sid = array[0].split(":")[1];
    req.sessionID = connect_sid;
    req.sessionStore = sessionStore;
    sessionStore.get(connect_sid, function (error, session) {
      if (error) {
        // if we cannot grab a session, turn down the connection
        callback(error.message, false);
      }
      else {
        // save the session data and accept the connection
        req.session = session;
        callback(null, true);
      }
    });
  } else {
    callback('no cookie', false);
  }
};