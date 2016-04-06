'use strict';
var path = require('path'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  fs = require('fs'),
  exec = require('child_process').exec;

var seleniumInstall = function (version) {
  return function (callback) {
    //check package.json
    var pkg = require(path.resolve(__dirname, '../package.json'));
    if (pkg.dependencies['selenium-webdriver'] === version) {
      //already installed
      return callback(null);
    }
    pkg.dependencies['selenium-webdriver'] = version;
    fs.writeFile(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, '  '), function (err) {
      if (err) {
        return error('seleniumInstall: error writing package.json', err);
      }
      exec(cmd, {cwd: path.resolve(__dirname, '..')},
        function (err, stdout, stderr) {
          log('stdout', stdout);
          error('stderr', stderr);
          if (err !== null) {
            error('exec error', err);
            return callback(err);
          }
          callback(null);
        });
    });
    var cmd = 'npm install';


  };


};
module.exports = seleniumInstall;
