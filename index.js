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
  Setup = require('./setup'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  _ = require('lodash'),
  path = require('path'),
  confit = require('confit'),
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
  var basedir, configOverride, cb;
  //settle arguments
  if (arguments.length === 0) {
    error('Nemo constructor needs at least a callback');
    var noCallbackError = new Error('Nemo constructor needs at least a callback');
    noCallbackError.name = 'nemoNoCallbackError';
    throw noCallbackError;
    return;
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
  log('new Nemo instance created');

  var nemo = {
    'data': {},
    'view': {},
    'locator': {},
    'driver': {},
    'wd': webdriver,
    '_config': null
  };


  var confitOptions = {
    protocols: {
      path: handlers.path(basedir, {}),
      env: handlers.env({})
    }
  };

  if (basedir) {
    confitOptions.basedir = path.join(basedir, 'config');
  }
  log('confit options', confitOptions);

  //hack because confit doesn't JSON.parse environment variables before merging
  //can remove if this PR is accepted:
  var envdata = {};
  var envdriver = {};
  var envplugins = {};
  try {
    envdata = {'data': JSON.parse(process.env.data)};
    delete process.env.data;
  } catch (err) {
    //noop
  }
  try {
    envdriver = {'driver': JSON.parse(process.env.driver)};
    delete process.env.driver;
  } catch (err) {
    //noop
  }
  try {
    envplugins = {'plugins': JSON.parse(process.env.plugins)};
    delete process.env.plugins;
  } catch (err) {
    //noop
  }
  //}
  _.merge(configOverride, envdata, envdriver, envplugins);

  confit(confitOptions).addOverride(configOverride).create(function (err, config) {
    //check for vital information
    if (config.get('driver') === undefined) {
      error('essential driver properties not found in configuration');
      cb(new Error('[nemo] essential driver properties not found in configuration'));
      return;
    }
    setup(config).then(function (_nemo) {
      _.merge(nemo, _nemo);
      cb();
    });
  });

  return nemo;


}

/**
 *
 * setup
 * @param {Object} config -
 *  {
   *     "driver": { ... properties used by Nemo to setup the driver instance ... },
   *     "plugins": { ... plugins to initialize ...},
   *     "data": { ... arbitrary data to pass through to nemo instance ... }
   *   }
 * @returns webdriver.promise - successful fulfillment will return an {Object} as below:
 *  {
   *    ,'driver': {}                        //driver instance. ALWAYS
   *    ,'wd': {}                            //static reference to selenium-webdriver. ALWAYS
   *    ,'data': {}                            //passed through JSON from 'data' section of configuration
   *    ,'[plugin namespace]': '[plugin object]' //if plugin registers
   *  }
 */
function setup(config) {
  var waterFallArray = [],
    preDriverArray = [],
    postDriverArray = [],
    plugins = {};
  //config is for registering plugins
  if (config && config.get('plugins')) {
    plugins = config.get('plugins');
  }
  var driverConfig = config.get('driver');
  config = config || {};
  var me = this,
    nemo = {
      'data': config.get('data'),
      'view': {},
      'locator': {},
      'driver': null,
      'wd': webdriver
    };
  var d = webdriver.promise.defer();
  preDriverArray = [datasetup];

  Object.keys(plugins).forEach(function pluginsKeys(key) {
    var modulePath,
      pluginConfig,
      pluginArgs,
      pluginModule;

    function pluginReg(nemo, callback) {
      pluginArgs.push(nemo);
      pluginArgs.push(callback);
      pluginModule.setup.apply(this, pluginArgs);
    }

    //if ((plugins[key].register || config[key]) || key === 'view') {
    log('register plugin %s', key);
    //register this plugin
    pluginConfig = plugins[key];
    pluginArgs = plugins[key].arguments || [];
    modulePath = pluginConfig.module;
    log('modulePath %s', modulePath);
    pluginModule = require(modulePath);
    if (plugins[key].priority && plugins[key].priority < 100) {
      preDriverArray.push(pluginReg);
    } else {
      postDriverArray.push(pluginReg);
    }
    //}
  });
  waterFallArray = preDriverArray.concat([driversetup], postDriverArray);

  async.waterfall(waterFallArray, function waterfall(err, result) {
    if (err) {
      d.reject(err);
    } else {
      d.fulfill(nemo);
    }
  });
  return d;

  //waterfall functions
  function datasetup(callback) {
    callback(null, nemo);
  }

  function driversetup(_nemo, callback) {
    //do driver/view/locator/vars setup
    (Setup()).doSetup(webdriver, driverConfig, function setupCallback(err, __nemo) {
      if (err) {
        callback(err);
      } else {
        //set driver
        _nemo.driver = __nemo.driver;
        callback(null, _nemo);
      }
    });
  }

}

module.exports = Nemo;
