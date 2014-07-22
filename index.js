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
  nemoData = {},
  waterFallArray = [],
  preDriverArray = [],
  postDriverArray = [],
  _ = require('lodash'),
  webdriver = require('selenium-webdriver');

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration
 *
 */

function Nemo(config) {

  this.plugins = {};
  //config is for registering plugins
  if (config && config.plugins) {
    this.plugins = config.plugins;
  }
}

Nemo.prototype = {
  /**
   *
   * Nemo.setup
   *@param {Object} config -
   *  {
   *    'view': ['example-login', 'serviceError']   //optional
   *    ,'locator': ['wallet']                      //optional
   *    ,<plugin config namespace>: <plugin config> //optional, depends on plugin setup
   *  }
   *@returns webdriver.promise - successful fulfillment will return an {Object} as below:
   *  {
   *    'view': {}                           //view instances if specified in config
   *    ,'locator': {}                       //locator instances if specified in config
   *    ,'driver': {}                        //driver instance. ALWAYS
   *    ,'wd': {}                            //static reference to selenium-webdriver. ALWAYS
   *    ,<plugin namespace>: <plugin object> //if plugin registers
   *  }
   */
  setup: function(config) {
    nemoData = JSON.parse(process.env.nemoData);
    config = config || {};
    var that = this,
      returnObj = {
        'props': nemoData,
        'view': {},
        'locator': {},
        'driver': {},
        'wd': {}
      },
      d = webdriver.promise.defer(),
      preDriverArray = [datasetup];

    Object.keys(that.plugins).forEach(function(key) {
      var modulePath,
        pluginConfig,
        pluginModule;

      if ((that.plugins[key].register || config[key]) && key !== 'view') {
        //register this plugin
        pluginConfig = that.plugins[key];
        modulePath = pluginConfig.module;
        pluginModule = require(modulePath);
        if (that.plugins[key].priority && that.plugins[key].priority < 100) {
          preDriverArray.push(pluginModule.setup);
        } else {
          postDriverArray.push(pluginModule.setup); 
        }
      }
    });
    waterFallArray = preDriverArray.concat([driversetup], postDriverArray);
    if (config.view) {
      waterFallArray.push(viewsetup);
    }
    if (config.locator) {
      waterFallArray.push(locatorsetup);
    }
    async.waterfall(waterFallArray, function(err, result) {
      if (err) {
        d.reject(err);
      } else {
        d.fulfill(returnObj);
      }
    });
    return d;

    //waterfall functions
    function datasetup(callback) {
      callback(null, config, returnObj);
    }
    function driversetup(config, result, callback) {
      //do driver/view/locator/vars setup
      (new Setup()).doSetup(webdriver, result.props, function(err, result) {
        if (err) {
          callback(err);
        } else {
          //set driver
          returnObj.driver = result.driver;
          returnObj.wd = webdriver;
          callback(null, config, returnObj);
        }
      });
    }

    function locatorsetup(config, result, callback) {
      //setup locators
      config.locator.forEach(function(key) {
        returnObj.locator[key] = require(returnObj.props.autoBaseDir + '/locator/' + key);
      });
      callback(null, config, returnObj);
    }

    function viewsetup(config, result, callback) {
      var viewConfig = result;
      //setup views
      config.view.forEach(function(key) {
        if (that.plugins.view) {
          //process with the view interface
          returnObj.view[(key.constructor === String) ? key : key.name] = require(that.plugins.view.module).addView(key, result);
        } else {
          var viewMod = require(returnObj.props.autoBaseDir + '/view/' + key);
          returnObj.view[key] = new viewMod(viewConfig);
        }

      });
      callback(null, config, returnObj);
    }
  }
};

module.exports = Nemo;
