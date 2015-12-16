'use strict';
var npmi = require('npmi'),
  path = require('path'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error');

var seleniumInstall = function (version) {
 return function(callback) {
   var options = {
     name: 'selenium-webdriver',
     version: version,       // expected version [default: 'latest']
     path: '.',
     forceInstall: false,
     npmLoad: {
       loglevel: 'silent'
     }
   };
   npmi(options, function (err, result) {
     if (err) {
       if (err.code === npmi.LOAD_ERR)    error('npm load error');
       else if (err.code === npmi.INSTALL_ERR) error('npm install error');
       callback(err);
     }
     // installed
     log(options.name + '@' + options.version + ' installed successfully in ' + path.resolve(options.path));
     callback(null);
   });
 }


};
module.exports = seleniumInstall;