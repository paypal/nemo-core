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
/* global require,module */
'use strict';
var fs = require('fs'),
  webdriver = require('selenium-webdriver'),
  SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
  proxy = require('selenium-webdriver/proxy'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error'),
  nemoData = {},
  driver;

error.log = console.error.bind(console);

function Setup() {
  log('new Setup instance created');
  return {
    doSetup: function doSetup(_wd, nemoData, callback) {
      log('entering doSetup');
      if (nemoData === {}) {
        callback(new Error('[Nemo::doSetup] The nemoData environment variable is missing or not fully defined!'));
        return;
      }
      var caps,
        tgtBrowser = nemoData.targetBrowser || '',
        localServer = nemoData.localServer || false,
        customCaps = nemoData.serverCaps,
        serverUrl = nemoData.targetServer,
        serverProps = nemoData.serverProps || {},
        serverJar = nemoData.seleniumJar,
        proxyDetails = nemoData.proxyDetails,
        errorObject = null;

      function getServer() {
        log('attempt getServer');
        //are we running the tests on the local machine?
        if (localServer === true) {
          log('test locally');
          if (tgtBrowser !== 'chrome' && tgtBrowser !== 'phantomjs') {
            //make sure there is a jar file
            var jarExists = fs.existsSync(serverJar);
            if (!jarExists) {
              error('You must specify a valid SELENIUM_JAR value. The value must point to a driver executable in your file system.');
            }
            if (serverProps.port === undefined) {
              serverProps.port = 4444;
            }
            var server = new SeleniumServer(serverJar, serverProps);
            server.start();
            serverUrl = server.address();
          } else {
            serverUrl = null;
          }
        }
        return serverUrl;
      }

      function getCapabilities() {
        //specified valid webdriver browser key?
        if (!webdriver.Capabilities[tgtBrowser]) {
          log('You have specified targetBrowser: ' + tgtBrowser + ' which is not a built-in webdriver.Capabilities browser option');
          caps = new webdriver.Capabilities();

        } else {
          caps = webdriver.Capabilities[tgtBrowser]();
        }
        if (customCaps) {
          Object.keys(customCaps).forEach(function customCapsKeys(key) {
            caps.set(key, customCaps[key]);
          });
        }
        log('Capabilities', caps);
        return caps;
      }

      function getProxy(){
        if (proxyDetails) {
          if (proxyDetails.method && proxy[proxyDetails.method]){
            return proxy[proxyDetails.method].apply(proxy, proxyDetails.args);  
          }else{
            throw new Error('nemo: proxy configuration is incomplete or does not match the selenium-webdriver/proxy API');
          }
          
        } else {
          return proxy.direct();
        }
      }

      try {

        driver = new _wd.Builder().
          usingServer(getServer()).
          withCapabilities(getCapabilities()).setProxy(getProxy()).build();
      } catch (err) {
        error('Encountered an error during driver setup: %', err);
        errorObject = err;
      }
      callback(errorObject, {
        'driver': driver
      });
    }
  };
}
module.exports = Setup;
