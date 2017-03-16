/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 PayPal                                                  │
 │                                                                             │
 │                                                                             │
 │   Licensed under the Apache License, Version 2.0 (the "License"); you may   │
 │   not use this file except in compliance with the License. You may obtain   │
 │   a copy of the License at http://www.apache.org/licenses/LICENSE-2.0       │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
'use strict';

var async = require('async'),
  Setup = require('./setup'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  _ = require('lodash'),
  path = require('path'),
  confit = require('confit'),
  yargs = require('yargs'),
    wd = require('selenium-webdriver'),
  handlers = require('shortstop-handlers'),

  webdriver;

error.log = console.error.bind(console);

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration and optionally nemoData
 *
 */

function Nemo(_basedir, _configOverride, _cb) {
  log('new Nemo instance created');
  //argument vars
  var basedir, configOverride, cb, prom;

  var nemo = {};
  var confitOptions = {};
  //hack because confit doesn't JSON.parse environment variables before merging
  //look into using shorstop handler or pseudo-handler in place of this
  var envdata = envToJSON('data');
  var envdriver = envToJSON('driver');
  var envplugins = envToJSON('plugins');

  //settle arguments
  cb = (arguments.length && typeof arguments[arguments.length - 1] === 'function') ? arguments[arguments.length - 1] : undefined;
  basedir = (arguments.length && typeof arguments[0] === 'string') ? arguments[0] : undefined;
  configOverride = (!basedir && arguments.length && typeof arguments[0] === 'object') ? arguments[0] : undefined;
  configOverride = (!configOverride && arguments.length && arguments[1] && typeof arguments[1] === 'object') ? arguments[1] : configOverride;
  basedir = basedir || process.env.nemoBaseDir || undefined;
  configOverride = configOverride || {};
  if (!cb) {
    log('returning promise');
    prom = wd.promise.defer();
    cb = function (err, n) {
      if (err) {
        return prom.reject(err);
      }
      prom.fulfill(n);
    }
  }
  log('promise?', !!prom);
  log('basedir', basedir);
  log('configOverride', configOverride);


  confitOptions = {
    protocols: {
      path: handlers.path(basedir, {}),
      env: handlers.env({}),
      argv: function argHandler(val) {
        var argv = yargs.argv;
        return argv[val] || '';
      }
    }
  };
  if (basedir) {
    confitOptions.basedir = path.join(basedir, 'config');
  }
  log('confit options', confitOptions);
  log('confit overrides: \ndata: %s,\ndriver: %s\nplugins: %s', envdata.json, envdriver.json, envplugins.json);
  //merge any environment JSON into configOverride
  _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);

  confit(confitOptions).addOverride(configOverride).create(function (err, config) {
    if (err) {
      error('Error encountered during confit.create');
      return cb(err);
    }
    //reset env variables
    envdata.reset();
    envdriver.reset();
    envplugins.reset();
    //check for vital information
    if (config.get('driver') === undefined) {
      var errorMessage = 'Nemo essential driver properties not found in configuration';
      error(errorMessage);
      var badDriverProps = new Error(errorMessage);
      badDriverProps.name = 'nemoBadDriverProps';
      cb(badDriverProps);
      return;
    }
    setup(config, function (err, _nemo) {
      if (err !== null) {
        cb(err);
        return;
      }
      _.merge(nemo, _nemo);
      cb(null, nemo);
    });
  });

  return prom && prom.promise || nemo;


}


var setup = function setup(config, cb) {
  var waterfallArray = [],
    preDriverArray = [],
    postDriverArray = [],
    plugins = {},
    pluginError = false;
  var nemo = {
    'data': config.get('data'),
    'driver': {},
    '_config': config
  };
  //config is for registering plugins
  if (config && config.get('plugins')) {
    plugins = config.get('plugins');
  }


  Object.keys(plugins).forEach(function pluginsKeys(key) {
    var modulePath,
      pluginConfig,
      pluginArgs,
      pluginModule;

    log('register plugin %s', key);
    //register this plugin
    pluginConfig = plugins[key];
    pluginArgs = plugins[key].arguments || [];
    modulePath = pluginConfig.module;
    log('modulePath %s', modulePath);
    try {
      pluginModule = require(modulePath);
    } catch (err) {
      error(err);
      var noPluginModuleError = new Error('Nemo plugin has invalid module ' + modulePath + '. ' + err);
      noPluginModuleError.name = 'nemoNoPluginModuleError';
      cb(noPluginModuleError);
      pluginError = true;
      return;
    }

    if (plugins[key].priority && plugins[key].priority < 100) {
      preDriverArray.push(pluginReg(nemo, pluginArgs, pluginModule));
    } else {
      postDriverArray.push(pluginReg(nemo, pluginArgs, pluginModule));
    }
  });
  if (pluginError) {
    return;
  }
  preDriverArray.unshift(function setWebdriver(callback) {
    nemo.wd = wd;
    callback(null);
  });
  if (config.get('driver:selenium.version')) {
    //install before driver setup
    log('Requested install of selenium version %s', config.get('driver:selenium.version'));
    var seleniumInstall = require('./setup/seleniumInstall');
    preDriverArray.unshift(seleniumInstall(config.get('driver:selenium.version')));
  }
  waterfallArray = preDriverArray.concat([driversetup(nemo)], postDriverArray);
  log('waterfallArray', waterfallArray);
  async.waterfall(waterfallArray, function waterfall(err) {
    if (err) {
      cb(err);
    } else {
      cb(null, nemo);
    }
  });

};

var driversetup = function (_nemo) {
  return function driversetup(callback) {
    var driverConfig = _nemo._config.get('driver');
    //do driver/view/locator/vars setup
    (Setup()).doSetup(driverConfig, function setupCallback(err, _driver) {
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


var pluginReg = function (_nemo, pluginArgs, pluginModule) {
  return function pluginReg(callback) {

    pluginArgs.push(_nemo);
    pluginArgs.push(callback);
    try {
      pluginModule.setup.apply(this, pluginArgs);
    } catch (err) {
      //dang, someone wrote a crap plugin
      error(err);
      var pluginSetupError = new Error('Nemo plugin threw error during setup. ' + err);
      pluginSetupError.name = 'nemoPluginSetupError';
      callback(pluginSetupError);
    }
  };
};

var envToJSON = function (prop) {
  var returnJSON = {};
  var originalValue = process.env[prop];
  if (originalValue === undefined) {
    return {
      'json': {},
      'reset': function () {
      }
    };
  }
  try {
    returnJSON[prop] = JSON.parse(process.env[prop]);
    delete process.env[prop];
  } catch (err) {
    //noop
  }
  return {
    'json': returnJSON,
    'reset': function () {
      process.env[prop] = originalValue;
    }
  };
};
module.exports = Nemo;
