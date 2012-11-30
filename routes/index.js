var url = require('url'),
    fs = require('fs'),
    mysql = require('mysql'),
    config = require('../config');

var TABLE_NC_USER = 'nc_user';
var connection = mysql.createConnection({
  host:config.mysql.host,
  user:config.mysql.username,
  password:config.mysql.password,
  database:config.mysql.dbname
});
connection.connect(function (err) {
  if (err) {
    console.log('连接数据库出错!');
    throw err;
  }
  console.log('数据库已连接!');
});

/*
 * 访问主页
 * */
exports.index_bak = function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.redirect('/chat');
  } else {
    //读取登录页面，要求登录
    var realpath = config.site.baseDir + '/views/' + url.parse('login.html').pathname;
    var txt = fs.readFileSync(realpath);
    res.end(txt);
  }
};

/*
 * 登录Get
 * */
exports.gToChat = function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.render('chat', {name:req.session.name});
  } else {
    res.redirect('/');
  }
};
/*
 * 登录Post
 * */
exports.pToChat = function (req, res) {
  var name = req.body['nick'];
  if (name && name !== '') {
    req.session.name = name;//设置session
    res.render('chat', {name:name});
  } else {
    res.end('nickname cannot null');
  }
};

//===================新界面=================
/*
* 显示主页面
*
* */
exports.main = function(req, res){
  if (req.session.name && req.session.name !== '') {
    res.render('index', {name:req.session.name});
  } else {
    //读取登录页面，要求登录
    res.render('login', {err:null});
  }
}

/*
 * 登录
 * */
exports.login = function (req, res) {
  var name = req.body['username'];
  var passwd = req.body['password'];
  var errmsg = null;
  connection.query('SELECT * FROM nc_user WHERE username = ?', [name], function(err, results) {
    if(err){
      console.log(err);
      throw err;
      //res.render('login', {err:err});
    }
    if(results.length < 1){
      errmsg = '用户不存在!';
    }else{
      var db_passwd = results[0]['password'];
      if(passwd !== db_passwd){
        errmsg = '密码错误!';
      }
    }
    if(errmsg){
      console.log(errmsg);
      res.render('login', {err:errmsg});
    }else{
      //设置session
      req.session.name = name;
      res.render('index', {name:name});
    }
  });
};

