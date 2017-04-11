'use strict';

let debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  Promiz = require('./promise');

module.exports.registration = function (plugins) {
  let promiz = Promiz(),
    registerFns = [];
  let pluginErrored = Object.keys(plugins || {}).find(function pluginsKeys(key) {
    let pluginConfig = plugins[key],
      pluginArgs = pluginConfig.arguments || [],
      modulePath = pluginConfig.module,
      pluginModule,
      pluginError;

    //register this plugin
    log('register plugin %s with path %s', key, modulePath);
    try {
      pluginModule = require(modulePath);
    } catch (err) {
      error(err);
      let noPluginModuleError = new Error('Nemo plugin has invalid module ' + modulePath + '. ' + err);
      noPluginModuleError.name = 'nemoNoPluginModuleError';
      pluginError = noPluginModuleError;
      //returning true means we bail out of building registerFns
      return true;
    }
    registerFns.push({
      fn: pluginReg(nemo, pluginArgs, pluginModule),
      priority: pluginConfig.priority || -1
    });
    return false;
  });

  if (pluginErrored) {
    promiz.reject(pluginErrored);

  } else {
    promiz.fulfill(registerFns);
  }
  return promiz.promise;
};

let pluginReg = function (_nemo, pluginArgs, pluginModule) {
  return function pluginReg(callback) {

    pluginArgs.push(_nemo);
    pluginArgs.push(callback);
    try {
      pluginModule.setup.apply(this, pluginArgs);
    } catch (err) {
      //dang, someone wrote a crap plugin
      error(err);
      let pluginSetupError = new Error('Nemo plugin threw error during setup. ' + err);
      pluginSetupError.name = 'nemoPluginSetupError';
      callback(pluginSetupError);
    }
  };
};