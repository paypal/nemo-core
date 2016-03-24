'use strict';
var npmi = require('npmi'),
  path = require('path'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  exec = require('child_process').exec;

var seleniumInstall = function (version) {
  return function (callback) {
    var options = {
      name: 'selenium-webdriver',
      version: version,       // expected version [default: 'latest']
      path: '.',
      forceInstall: false,
      npmLoad: {
        loglevel: 'silent'
      }
    };
    var cmd = 'npm install ' + options.name + '@' + options.version;
    log('install cmd is', cmd);
    exec(cmd,
      function (err, stdout, stderr) {
        log('stdout', stdout);
        error('stderr', stderr);
        callback(null);
        if (err !== null) {
          error('exec error', err);
          callback(err);
        }
      });
    //npmi(options, function (err) {
    //  if (err) {
    //    if (err.code === npmi.LOAD_ERR) {
    //      error('npm load error');
    //    }
    //    else if (err.code === npmi.INSTALL_ERR) {
    //      error('npm install error');
    //    }
    //    callback(err);
    //  }
    //  // installed
    //  log(options.name + '@' + options.version + ' installed successfully in ' + path.resolve(options.path));
    //  callback(null);
    //});

  };


};
module.exports = seleniumInstall;