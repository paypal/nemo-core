/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
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
  Setup = require('./lib/setup'),
  Util = require('./lib/util'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  _ = require('lodash'),
  path = require('path'),
  confit = require('confit'),
  yargs = require('yargs'),
  handlers = require('shortstop-handlers'),
  webdriver = require('selenium-webdriver');

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
  var basedir, configOverride, cb;

  var nemo = {};
  var confitOptions = {};
  //hack because confit doesn't JSON.parse environment variables before merging
  //look into using shorstop handler or pseudo-handler in place of this
  var envdata = Util.envToJson('data');
  var envdriver = Util.envToJson('driver');
  var envplugins = Util.envToJson('plugins');

  //settle arguments
  if (arguments.length === 0) {
    error('Nemo constructor needs at least a callback');
    var noCallbackError = new Error('Nemo constructor needs at least a callback');
    noCallbackError.name = 'nemoNoCallbackError';
    throw noCallbackError;
  }
  else if (arguments.length === 1) {
    log('constructor: callback only');
    cb = arguments[0];
    configOverride = {};
    basedir = process.env.nemoBaseDir || undefined;
  }
  else if (arguments.length === 2) {
    cb = arguments[1];
    if (typeof arguments[0] === 'string') {
      log('constructor: basedir + callback');
      basedir = _basedir;
      configOverride = {};
    } else {
      log('constructor: configOverride + callback');
      configOverride = arguments[0];
      basedir = process.env.nemoBaseDir || undefined;
    }
  }
  else if (arguments.length === 3) {
    basedir = _basedir;
    configOverride = _configOverride;
    cb = _cb;
  }

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
      error('essential driver properties not found in configuration');
      var badDriverProps = new Error('Nemo essential driver properties not found in configuration');
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
      cb();
    });
  });

  return nemo;


}


var setup = function setup(config, cb) {
  var waterFallArray = [],
    preDriverArray = [],
    postDriverArray = [],
    plugins = {},
    pluginError = false;
  var nemo = {
    'data': config.get('data'),
    'driver': {},
    'wd': webdriver,
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
      var noPluginModuleError = new Error('Nemo plugin has invalide module');
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
  waterFallArray = preDriverArray.concat([driversetup(nemo)], postDriverArray);

  async.waterfall(waterFallArray, function waterfall(err, result) {
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
    Setup(driverConfig, function setupCallback(err, _driver) {
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
      var pluginSetupError = new Error('Nemo plugin threw error during setup');
      pluginSetupError.name = 'nemoPluginSetupError';
      callback(pluginSetupError);
    }
  };
};

module.exports = Nemo;
