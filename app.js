/**
 * Module dependencies.
 */
var express = require('express'),
  sio = require('socket.io'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  url = require('url'),
  utils = require('connect').utils,
  cookie = require('cookie');
  //MemoryStore = require('connect/middleware/session/memory');

var app = express();
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.sessionStore = new express.session.MemoryStore();
  app.use(express.session(
    {
      secret:'foo' + Math.random(),
      store:app.sessionStore,
      key:'ssid'
    }
  ));
  app.use(app.router);
  //app.use(require('less-middleware')({ src:__dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

//=================私人聊天使用session==============
var usersWS = {}; //私人聊天用的websocket
/*storeMemory = new MemoryStore({
  reapInterval:60000 * 10
});*/

//=========================URL=============================
/**
 * url处理~
 * @param {Object} req
 * @param {Object} res
 */
app.get('/', function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.redirect('/chat');
  } else {
    //读取登录页面，要求登录
    var realpath = __dirname + '/views/' + url.parse('login.html').pathname;
    var txt = fs.readFileSync(realpath);
    res.end(txt);
  }
});
app.get('/chat', function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.render('chat', {name:req.session.name});
  } else {
    res.redirect('/');
  }
})
app.post('/chat', function (req, res) {
  var name = req.body['nick'];
  if (name && name !== '') {
    req.session.name = name;//设置session
    res.render('chat', {name:name});
  } else {
    res.end('nickname cannot null');
  }

});

//=================配置socket.io===================
/**
 * 配置socket.io
 *
 */
var server = http.createServer(app);
var io = sio.listen(server);

//设置session
io.set('authorization', function (req, callback) {
  // 通过客户端的cookie字符串来获取其sessionId
  var oCookie = utils.parseJSONCookies(cookie.parse(decodeURIComponent(req.headers.cookie)));
  var connect_sid = oCookie['ssid'];

  if (connect_sid) {
    //var regx = /[:][a-zA-Z0-9\/+]*/;
    //console.log(connect_sid);
    //connect_sid =  String(connect_sid.match(regx)).substring(1);
    //console.log(connect_sid);
    var array = connect_sid.split(".");
    connect_sid = array[0].split(":")[1];
    req.sessionID = connect_sid;
    req.sessionStore = app.sessionStore;
    app.sessionStore.get(connect_sid, function (error, session) {
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
});

//===================socket链接监听=================
/**
 * 开始socket链接监听
 * @param {Object} socket
 */
io.sockets.on('connection', function (socket) {
  var session = socket.handshake.session;//session
  var name = session.name;
  usersWS[name] = socket;
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

});

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});