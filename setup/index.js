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
      if (nemoData === {} || nemoData.targetBrowser === undefined) {
        callback(new Error('[Nemo::doSetup] The nemoData environment variable is missing or not fully defined! Please read about nemoData configuration here: https://github.com/paypal/nemo/blob/master/README.md#nemo-configuration'));
        return;
      }
      var caps,
        tgtBrowser = nemoData.targetBrowser,
        customCaps = nemoData.serverCaps,
        serverUrl = nemoData.targetServer,
        serverProps = nemoData.serverProps,
        serverJar = nemoData.seleniumJar,
        proxyDetails = nemoData.proxyDetails,
        errorObject = null;

      function getServer() {
        log('attempt getServer');
        if (serverProps && (serverUrl.indexOf('127.0.0.1') !== -1 || serverUrl.indexOf('localhost') !== -1)) {
          log('attempt server startup');
          //chrome and phantomjs are supported natively. i.e. no webdriver required. chromedriver or phantomjs executables must be in PATH though
          if (tgtBrowser !== 'chrome' && tgtBrowser !== 'phantomjs') {
            //make sure there is a jar file
            var jarExists = fs.existsSync(serverJar);
            if (!jarExists) {
              throw new Error('You must specify a valid SELENIUM_JAR value. The value must point to a driver executable in your file system.');
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
          error('You have specified ' + tgtBrowser + ' which is an invalid webdriver.Capabilities browser option');

        } else {
          caps = webdriver.Capabilities[tgtBrowser]();
        }
        if (customCaps) {
          Object.keys(customCaps).forEach(function customCapsKeys(key) {
            caps.set(key, customCaps[key]);
          });
        }

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
