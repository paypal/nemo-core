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
/* global require,module */

const fs = require('fs');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

function Driver() {
  log('new Setup instance created');

  return {
    setup: function doSetup(driverProps, callback) {
      log('entering doSetup');

      let webdriver = require('selenium-webdriver'),
        SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
        proxy = require('selenium-webdriver/proxy'),
        caps,
        driver,
        tgtBrowser = driverProps.browser,
        localServer = driverProps.local || false,
        customCaps = driverProps.serverCaps,
        serverUrl = driverProps.server,
        serverProps = driverProps.serverProps || {},
        serverJar = driverProps.jar,
        builders = driverProps.builders,
        proxyDetails = driverProps.proxyDetails,
        errorObject = null;

      function getServer() {
        log('attempt getServer');
        //are we running the tests on the local machine?
        if (localServer === true) {
          log('test locally');
          if (tgtBrowser !== 'chrome' && tgtBrowser !== 'phantomjs' && tgtBrowser !== 'firefox') {
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

      function getProxy() {
        if (proxyDetails) {
          log('proxyDetails', proxyDetails);
          if (proxyDetails.method && proxy[proxyDetails.method]) {
            return proxy[proxyDetails.method].apply(proxy, proxyDetails.args);
          } else {
            throw new Error('nemo: proxy configuration is incomplete or does not match the selenium-webdriver/proxy API');
          }

        } else {
          return proxy.direct();
        }
      }

      if (typeof driverProps == 'function') {
        driver = driverProps();
      } else {
        try {
          var builder = new webdriver.Builder();
          if (builders !== undefined) {
            Object.keys(builders).forEach(function (bldr) {
              builder = builder[bldr].apply(builder, builders[bldr]);
            });
          }
          if (serverUrl !== undefined && !(builders && builders.usingServer)) {
            builder = builder.usingServer(getServer());
          }
          if (tgtBrowser !== undefined && !(builders && builders.forBrowser)) {
            builder = builder.withCapabilities(getCapabilities());
          }
          if (proxyDetails !== undefined) {
            builder = builder.setProxy(getProxy());
          }
          log('builder FINAL', builder);
          driver = builder.build();
        } catch (err) {
          error('Encountered an error during driver setup: %s', err);
          errorObject = err;
          callback(errorObject);
          return;
        }
      }

      driver.getSession().then(function () {
        callback(null, driver);
      }).catch(function (err) {
        error('Encountered an error during driver getSession: %s', err);
        callback(err);
      });
    }
  };
}

module.exports = Driver;
