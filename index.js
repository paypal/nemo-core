'use strict';

var async = require('async'),
	Setup = require('./setup'),
	nemoData = {},
	_ = require('lodash'),
	webdriver = require('selenium-webdriver');

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration
 *
 */

function Nemo(config) {

	//console.log('Nemo constructor config: ', config);
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
	 *    {
	 *		'view': ['example-login', 'serviceError'],	//optional
	 *		'locator': ['wallet'],						//optional
	 *	}
	 *@returns webdriver.promise - successful fulfillment will return an {Object} as below:
	 *    {
	 *		'view': {},		//view instances if specified in config
	 *		'locator': {},	//locator instances if specified in config
	 *		'driver': {},	//driver instance. ALWAYS
	 *		'wd': {},		//static reference to selenium-webdriver. ALWAYS
	 *	}
	 */
	setup: function (config) {
		nemoData = JSON.parse(process.env.nemoData);
		config = config || {};
		var that = this,
			returnObj = {
				'view': {},
				'locator': {},
				'driver': {},
				'wd': {}
			},
			d = webdriver.promise.defer(),
			waterFallArray = [driversetup];

		Object.keys(that.plugins).forEach(function (key) {
			var modulePath,
				pluginConfig,
				pluginModule;

			if (that.plugins[key].register || config[key] && key !== 'view') {
				//register this plugin
				pluginConfig = that.plugins[key];
				modulePath = pluginConfig.module;
				pluginModule = require(modulePath);
				waterFallArray.push(pluginModule.setup);
			}
		});
		if (config.view) {
			waterFallArray.push(viewsetup);
		}
		if (config.locator) {
			waterFallArray.push(locatorsetup);
		}
		async.waterfall(waterFallArray, function (err, result) {
			//console.log('waterfall result: ', result);
			if (err) {
				d.reject(err);
			} else {
				d.fulfill(returnObj);
			}
		});
		return d;

		//waterfall functions

		function driversetup(callback) {
			var toCamelCase = function (match, group1) {
				return group1.toUpperCase();
			};
			//do driver/view/locator/vars setup
			(new Setup()).doSetup(webdriver, function (err, result) {
				if (err) {
					callback(err);
				} else {
					//set driver
					returnObj.driver = result.driver;
					returnObj.wd = webdriver;
					returnObj.props = nemoData;
					callback(null, config, returnObj);
				}
			});
		}

		function locatorsetup(config, result, callback) {
			//setup locators
			config.locator.forEach(function (key) {
				returnObj.locator[key] = require(returnObj.props.autoBaseDir + '/locator/' + key);
			});
			callback(null, config, returnObj);
		}

		function viewsetup(config, result, callback) {
			var viewConfig = result;
			//setup views
			config.view.forEach(function (key) {
				//console.log('key is: ' + key)
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