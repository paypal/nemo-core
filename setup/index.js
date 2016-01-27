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
'use strict';
var fs = require('fs'),
  webdriver = require('selenium-webdriver'),
  SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
  proxy = require('selenium-webdriver/proxy'),
  debug = require('debug'),
  log = debug('nemo:log'),
  error = debug('nemo:error');

error.log = console.error.bind(console);

Setup.executionCount = 0;

function Setup() {
  log('new Setup instance created');
  return {
    doSetup: function doSetup(driverProps, callback) {
      log('entering doSetup');

      var caps,
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

      // if tgtBrowser is defined, a new capabilities object will be created from it.  If it is not defined, then this
      // will append the custom capabilities to the existing capabilities from the builder.
      function getCapabilities(builder) {
        caps = builder.capabilities_;
        //specified valid webdriver browser key?
        if (tgtBrowser !== undefined) {
          if (!webdriver.Capabilities[tgtBrowser]) {
            log('You have specified targetBrowser: ' + tgtBrowser + ' which is not a built-in webdriver.Capabilities browser option');

          } else {
            // tgtBrowser has been defined.  Don't use the builders capabilities
            caps = webdriver.Capabilities[tgtBrowser]();
          }
        }

        //add users custom capabilities
        if (customCaps) {
          Object.keys(customCaps).forEach(function customCapsKeys(key) {
            caps.set(key, customCaps[key]);
          });
        }

        //add project information to the capabilities
        addProjectInformation(caps);

        log('Capabilities', caps);
        return caps;
      }

      function addProjectInformation(caps) {
        try {
          if (!caps.has('framework')) {
            caps.set('framework', 'nemo');
          }
          var projectDirectory = process.env.nemoBaseDir || process.cwd();
          var pkginfomodule = require('pkginfo')(module);
          var pkginfo = pkginfomodule.read(module, projectDirectory).package;
          if (pkginfo !== undefined && pkginfo.name !== undefined) {
            // set teamname if user hasn't overridden it
            if (!caps.has('teamname')) {
              caps.set('teamname', pkginfo.name);
            }
          }
          if (pkginfo !== undefined && pkginfo.description !== undefined) {
            if (!caps.has('description')) {
              caps.set('description', pkginfo.description);
            }
          }
          // since we cannot get the mocha file name or description at this point, lets create a testname based on the pkginfo
          if (!caps.has('name')) {
            var testname = projectDirectory + '-' + caps.get('teamname') + '-' + Setup.executionCount;
            caps.set('name', testname);
          }
        }
        catch (e) {
          error.log('Unable to obtain package information about the current execution due to exception:\n' + e);
        }
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

      try {
        Setup.executionCount++;
        var builder = new webdriver.Builder();
        if (builders !== undefined) {
          Object.keys(builders).forEach(function (bldr) {
            builder = builder[bldr].apply(builder, builders[bldr]);
          });
        }

        if (serverUrl !== undefined) {
          builder = builder.usingServer(getServer());
        }

        // add capabilities to the builder
        builder = builder.withCapabilities(getCapabilities(builder));

        if (proxyDetails !== undefined) {
          builder = builder.setProxy(getProxy());
        }

        log('builder FINAL', builder);
        driver = builder.build();
      } catch (err) {
        error('Encountered an error during driver setup: %', err);
        errorObject = err;
        callback(errorObject);
        return;
      }
      driver.getSession().then(function () {
        callback(null, driver);
      }).thenCatch(function (err) {
        error('Encountered an error during driver getSession: %', err);
        callback(err);
      });

    }
  };
}
module.exports = Setup;
