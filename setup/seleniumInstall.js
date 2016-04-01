'use strict';
var path = require('path'),
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
        if (err !== null) {
          error('exec error', err);
          return callback(err);
        }
        callback(null);
      });
  };


};
module.exports = seleniumInstall;
