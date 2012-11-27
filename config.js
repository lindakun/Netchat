/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-11-27
 * Time: 上午10:17
 * To change this template use File | Settings | File Templates.
 */
module.exports = {
  site:{
    //baseUrl: the URL that mongo express will be located at
    //Remember to add the forward slash at the end!
    baseUrl:'http://localhost:3000/',
    port:3000,
    baseDir:__dirname,
    viewEngine:'jade',
    cache:true,
    cookieSecret:'cookiesecret',
    sessionSecret:'foo',
    sessionKey:'ssid',
    cookieAge:7*24*60*60*1000
  },
  options:{
    //documentsPerPage: how many documents you want to see at once in collection view
    documentsPerPage:10,
    //editorTheme: Name of the theme you want to use for displaying documents
    //See http://codemirror.net/demo/theme.html for all examples
    editorTheme:"rubyblue",
    //The options below aren't being used yet
    //cmdType: the type of command line you want mongo express to run
    //values: eval, subprocess
    //  eval - uses db.eval. commands block, so only use this if you have to
    //  subprocess - spawns a mongo command line as a subprocess and pipes output to mongo express
    cmdType:'eval',
    //subprocessTimeout: number of seconds of non-interaction before a subprocess is shut down
    subprocessTimeout:300
  }
};