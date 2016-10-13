'use strict';
var path = require('path'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  fs = require('fs'),
  exec = require('child_process').exec;

var seleniumInstall = function (version) {
  return function installSelenium(callback) {

    var seleniumVersion = require('selenium-webdriver/package.json').version;
    if (seleniumVersion === version) {
      log('selenium version %s already installed', version);
      return callback(null);
    }

    var save = (process.env.NEMO_UNIT_TEST) ? '' : ' --save';
    var cmd = 'npm install' + save + ' selenium-webdriver@' + version;
    log('install selenium version %s', version);
    log(cmd);

    exec(cmd, {cwd: path.resolve(__dirname, '..')},
      function (err, stdout, stderr) {
        if (stdout) {
          log('seleniumInstall: stdout', stdout);
        }
        if (stderr) {
          error('seleniumInstall: stderr', stderr);
        }
        if (err !== null) {
          error('exec error', err);
          return callback(err);
        }
        callback(null);

      });
  };
};
module.exports = seleniumInstall;
