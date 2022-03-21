const Plugin = require('./plugin');
const wd = require('selenium-webdriver');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');
const Driver = require('./driver');

log.log = console.log.bind(console);
error.log = console.error.bind(console);


let setup = async function setup(config) {
  let nemo = {
    'data': config.get('data'),
    'driver': {},
    '_config': config
  };
  let registerFns;
  try {
    registerFns = await Plugin.registration(nemo, config.get('plugins'));
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
    for (let i = 0; i < registerFns.length; i++) {
      await new Promise((resolve, reject) => {
        registerFns[i]((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    }
  } catch (err) {
    if (nemo && nemo.driver && nemo.driver.quit) {
      await nemo.driver.quit();
    }
    throw err;
  }
  return Promise.resolve(nemo)
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




module.exports = async function (config) {
  if (config.get('driver') === undefined) {
    var errorMessage = 'Nemo essential driver properties not found in configuration';
    error(errorMessage);
    var badDriverProps = new Error(errorMessage);
    badDriverProps.name = 'nemoBadDriverProps';
    return Promise.reject(badDriverProps);
  } else {
    let nemo;
    try {
      nemo = await setup(config);
    } catch (err) {
      error(err);
      return Promise.reject(err);
    }
    return Promise.resolve(nemo);
  }
};