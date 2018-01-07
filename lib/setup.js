const Plugin = require('./plugin');
const wd = require('selenium-webdriver');
const Promiz = require('./promise');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');
const async = require('async');
const Driver = require('./driver');

log.log = console.log.bind(console);
error.log = console.error.bind(console);


let setup = function setup(config, cb) {
  let nemo = {
    'data': config.get('data'),
    'driver': {},
    '_config': config
  };
  Plugin.registration(nemo, config.get('plugins'))
    .then(function (registerFns) {
      //add driver setup
      registerFns.push({fn: driversetup(nemo), priority: 100});
      registerFns = registerFns.sort(Plugin.compare).map(function (obj) {
        return obj.fn;
      });
      registerFns.unshift(function setWebdriver(callback) {
        nemo.wd = wd;
        callback(null);
      });
      if (config.get('driver:selenium.version')) {
        //install before driver setup
        log('Requested install of selenium version %s', config.get('driver:selenium.version'));
        var seleniumInstall = require('./install');
        registerFns.unshift(seleniumInstall(config.get('driver:selenium.version')));
      }
      async.waterfall(registerFns, function waterfall(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, nemo);
        }
      });
    })
    .catch(function (err) {
      error(err);
      cb(err);
    });
};

var driversetup = function (_nemo) {
  return function driversetup(callback) {
    var driverConfig = _nemo._config.get('driver');
    //do driver/view/locator/vars setup
    (Driver()).setup(driverConfig, function setupCallback(err, _driver) {
      if (err) {
        callback(err);
        return;
      }
      //set driver
      _nemo.driver = _driver;
      callback(null);

    });
  };
};




module.exports = function (config) {
  let promiz = Promiz();
  if (config.get('driver') === undefined) {
    var errorMessage = 'Nemo essential driver properties not found in configuration';
    error(errorMessage);
    var badDriverProps = new Error(errorMessage);
    badDriverProps.name = 'nemoBadDriverProps';
    process.nextTick(function () {
      promiz.reject(badDriverProps);
    });
  } else {
    setup(config, function (err, nemo) {
      log('got called back');
      if (err !== null) {
        promiz.reject(err);
        return;
      }
      promiz.fulfill(nemo);
    });
  }

  return promiz.promise;
};