'use strict';

const Plugin = require('./plugin'),
  wd = require('selenium-webdriver'),
  Promiz = require('./promise'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  async = require('async'),
  Driver = require('./driver');

log.log = console.log.bind(console);
error.log = console.error.bind(console);


const setup = function setup(config, cb) {
  const nemo = {
    'data': config.get('data'),
    'driver': {},
    '_config': config
  };
  Plugin.registration(nemo, config.get('plugins'))
    .then(registerFns => {
      //add driver setup
      registerFns.push({fn: driversetup(nemo), priority: 100});
      registerFns = registerFns.sort(Plugin.compare).map(obj => obj.fn);
      registerFns.unshift(function setWebdriver(callback) {
        nemo.wd = wd;
        callback(null);
      });
      if (config.get('driver:selenium.version')) {
        //install before driver setup
        log('Requested install of selenium version %s', config.get('driver:selenium.version'));
        const seleniumInstall = require('./install');
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
    .catch(err => {
      error(err);
      cb(err);
    });
};

const driversetup = _nemo => function driversetup(callback) {
  const driverConfig = _nemo._config.get('driver');
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



module.exports = function (config) {
  const promiz = Promiz();
  if (config.get('driver') === undefined) {
    const errorMessage = 'Nemo essential driver properties not found in configuration';
    error(errorMessage);
    const badDriverProps = new Error(errorMessage);
    badDriverProps.name = 'nemoBadDriverProps';
    process.nextTick(() => {
      promiz.reject(badDriverProps);
    });
  } else {
    setup(config, (err, nemo) => {
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