const path = require('path');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');
const exec = require('child_process').exec;

log.log = console.log.bind(console);
error.log = console.error.bind(console);

module.exports = function (version) {
  return function installSelenium(callback) {
    //check package.json
    var pkg = require(path.resolve(__dirname, '../package.json'));
    if (pkg.dependencies['selenium-webdriver'] === version) {
      log('selenium version %s already installed', version);
      return callback(null);
    }
    var save = process.env.NEMO_UNIT_TEST ? '' : '--save';
    var cmd = 'npm install ' + save + ' selenium-webdriver@' + version;
    log('npm install cmd', cmd);
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
