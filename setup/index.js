/* global require,module */
'use strict';
//console.log(process.env)
var fs = require('fs'),
	webdriver = require('selenium-webdriver'),
	SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
	nemoData = {},
	driver;
//console.log("ping");
var Setup = function () {
	//constructor
};
Setup.prototype = {
	doSetup: function (_wd, callback) {
		//look for nemoData env variable, error out if missing
		nemoData =  JSON.parse(process.env.nemoData || {});
		if (nemoData === {} || nemoData.targetBrowser === undefined) {
			callback(new Error('[Nemo::doSetup] The nemoData environment variable is missing or not fully defined!'));
			return;
		}
		nemoData = JSON.parse(process.env.nemoData);
		var caps,
			tgtBrowser = nemoData.targetBrowser,
			customCaps = nemoData.serverCaps,
			serverUrl = nemoData.targetServer,
			serverProps = nemoData.serverProps,
			serverJar = nemoData.seleniumJar,
			errorObject = null;

		function getServer() {

			if (serverProps && (serverUrl.indexOf('127.0.0.1') !== -1 || serverUrl.indexOf('localhost') !== -1)) {
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
			//exception handling
			if (!webdriver.Capabilities[tgtBrowser]) {
				throw new TypeError('You have specified ' + tgtBrowser + ' which is an invalid browser option');
			}
			caps = new webdriver.Capabilities();

			if (customCaps) {
				customCaps = JSON.parse(customCaps);
				Object.keys(customCaps).forEach(function (key) {
					caps.set(key, customCaps[key]);
				});
			}
			caps.merge(webdriver.Capabilities[tgtBrowser]());

			return caps;
		}


		try {
			driver = new _wd.Builder().
				usingServer(getServer()).
				withCapabilities(getCapabilities()).build();
		} catch (err) {
			errorObject = err;
		}
		callback(errorObject, {
			'driver': driver
		});
	}
};
module.exports = Setup;