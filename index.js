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
  
  _ = require('lodash'),
  webdriver = require('selenium-webdriver');

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration and optionally nemoData
 *
 */

function Nemo(config) {
  this.nemoData = (config && config.nemoData) ? config.nemoData : undefined,
  this.waterFallArray = [],
  this.preDriverArray = [],
  this.postDriverArray = [],
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
    this.nemoData = (this.nemoData) ? this.nemoData : JSON.parse(process.env.nemoData);
    config = config || {};
    var me = this,
      nemo = {
        'props': this.nemoData,
        'view': {},
        'locator': {},
        'driver': {},
        'wd': {}
      };
    var d = webdriver.promise.defer();
    me.preDriverArray = [datasetup];

    Object.keys(me.plugins).forEach(function(key) {
      var modulePath,
        pluginConfig,
        pluginModule;

      if ((me.plugins[key].register || config[key]) || key === 'view') {
        //register this plugin
        pluginConfig = me.plugins[key];
        modulePath = pluginConfig.module;
        pluginModule = require(modulePath);
        if (me.plugins[key].priority && me.plugins[key].priority < 100) {
          me.preDriverArray.push(pluginModule.setup);
        } else {
          me.postDriverArray.push(pluginModule.setup); 
        }
      }
    });
    me.waterFallArray = me.preDriverArray.concat([driversetup], me.postDriverArray);
    if (config.view || (me.plugins && me.plugins.view)) {
      me.waterFallArray.push(viewsetup);
    }
    if (config.locator) {
      me.waterFallArray.push(locatorsetup);
    }
    async.waterfall(me.waterFallArray, function(err, result) {
      if (err) {
        d.reject(err);
      } else {
        d.fulfill(nemo);
      }
    });
    return d;

    //waterfall functions
    function datasetup(callback) {
      callback(null, config, nemo);
    }
    function driversetup(config, _nemo, callback) {
      //do driver/view/locator/vars setup
      (new Setup()).doSetup(webdriver, _nemo.props, function(err, _nemo) {
        if (err) {
          callback(err);
        } else {
          //set driver
          nemo.driver = _nemo.driver;
          nemo.wd = webdriver;
          callback(null, config, nemo);
        }
      });
    }

    function locatorsetup(config, _nemo, callback) {
      //setup locators
      config.locator.forEach(function(key) {
        nemo.locator[key] = require(nemo.props.autoBaseDir + '/locator/' + key);
      });
      callback(null, config, nemo);
    }

    function viewsetup(config, _nemo, callback) {
      var viewModule = _nemo.view;
      if (!config.view) {
        config.view = [];
      }
      //setup views
      config.view.forEach(function(key) {
        if (me.plugins.view) {
          //process with the view interface
          viewModule.addView(key);
        } else {
          //old views
          //dedupe step
          if (nemo.view[key]) {
            return;
          }
          var viewMod = require(nemo.props.autoBaseDir + '/view/' + key);
          nemo.view[key] = new viewMod(_nemo);
        }

      });
      callback(null, config, nemo);
    }
  }
};

module.exports = Nemo;
