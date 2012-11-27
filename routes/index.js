var url = require('url'),
    fs = require('fs'),
    config = require('../config');
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

/*
 * 显示登录
 * */
exports.showLogin = function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.redirect('/chat');
  } else {
    //读取登录页面，要求登录
    res.render('login',{err:null});
  }
};

/*
 * 显示登录
 * */
exports.toLogin = function (req, res) {
  if (req.session.name && req.session.name !== '') {
    //需要判断下是否已经登录
    res.redirect('/chat');
  } else {
    //读取登录页面，要求登录
    res.render('login',{err:null});
  }
};