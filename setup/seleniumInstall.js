'use strict';
var path = require('path'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  fs = require('fs'),
  exec = require('child_process').exec;

var seleniumInstall = function (version) {
  return function installSelenium(callback) {
    //check package.json
    var pkg = require(path.resolve(__dirname, '../package.json'));
    if (pkg.dependencies['selenium-webdriver'] === version) {
      log('selenium version %s already installed', version);
      return callback(null);
    }

    var cmd = 'npm install selenium-webdriver@' + version;
    log('npm install cmd', cmd);
    exec(cmd, {cwd: path.resolve(__dirname, '..')},
      function (err, stdout, stderr) {
        if (stdout) console.log('stdout', stdout);
        if (stderr) console.error('stderr', stderr);
        if (err !== null) {
          error('exec error', err);
          return callback(err);
        }
        pkg.dependencies['selenium-webdriver'] = version;

        //below is for local testing where we don't want to overwrite package.json
        //fs.writeFile = function (what, ever, dude) {
        //  dude(null);
        //};
        fs.writeFile(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, '  '), function (err) {
          if (err) {
            return callback(err);
          }
          process.nextTick(function () {callback(null);});
        });

      });
  };


};
module.exports = seleniumInstall;
