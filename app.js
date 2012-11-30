/**
 * Module dependencies.
 */
var express = require('express'),
  sio = require('socket.io'),
  http = require('http'),
  path = require('path'),
  config = require('./config'),
  index = require('./routes/index'),
  main = require('./routes/main');
  //MemoryStore = require('connect/middleware/session/memory');

var app = express();
app.configure(function () {
  app.set('port', config.site.port || 3000);
  app.set('views', config.site.baseDir + '/views');
  app.set('view engine', config.site.viewEngine || 'jade');
  //app.set("view cache", config.site.cache); //上线开启模板缓存
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.sessionStore = new express.session.MemoryStore();
  app.use(express.session(
    {
      secret:config.site.sessionSecret + Math.random(),
      store:app.sessionStore,
      key: config.site.sessionKey
    }
  ));
  app.use(app.router);
  //app.use(require('less-middleware')({ src:__dirname + '/public' }));
  //静态资源使用Express自带缓存 7天
  app.use(express.static(path.join(config.site.baseDir, 'public'),{maxAge:config.site.cookieAge}));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

//=========================URL=============================
/**
 * url处理~
 * @param {Object} req
 * @param {Object} res
 */
app.get('/', index.showLogin);
app.get('/chat', index.gToChat);
app.post('/chat', index.pToChat);


app.post('/login', index.login);

//=================配置socket.io===================
/**
 * 配置socket.io
 *
 */
var server = http.createServer(app);
var io = sio.listen(server);

/*
* 验证session
* */
io.set('authorization', function(req,callback){
  main.author(req,app.sessionStore,callback);
});

//===================socket链接监听=================
/**
 * 开始socket链接监听
 * @param {Object} socket
 */
io.sockets.on('connection', function(socket){
  main.main(io, socket);
});

/*
* 启动Http监听
* */
server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});