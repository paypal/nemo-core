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
'use strict';
const async = require('async');
const Setup = require('./setup');
const debug = require('debug');
const log = debug('nemo:log');
const error = debug('nemo:error');
const _ = require('lodash');
const path = require('path');
const confit = require('confit');
const yargs = require('yargs');
const handlers = require('shortstop-handlers');
let webdriver;

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
    let basedir, configOverride, cb;

    const nemo = {};
    let confitOptions = {};
    //hack because confit doesn't JSON.parse environment variables before merging
    //look into using shorstop handler or pseudo-handler in place of this
    const envdata = envToJSON('data');
    const envdriver = envToJSON('driver');
    const envplugins = envToJSON('plugins');

    //settle arguments
    if (arguments.length === 0) {
        const errorMessage = 'Nemo constructor needs at least a callback';
        error(errorMessage);
        const noCallbackError = new Error(errorMessage);
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
                const argv = yargs.argv;
                return argv[val] || '';
            }
        }
    };
    if (basedir) {
        confitOptions.basedir = path.join(basedir, 'config');
    }
    log('confit options', confitOptions);
    log('confit overrides: \ndata: %s,\ndriver: %s\nplugins: %s', envdata.json, envdriver.json, envplugins.json);
    //merge any environment JSON into configOverride
    _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);

    confit(confitOptions).addOverride(configOverride).create((err, config) => {
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
            const errorMessage = 'Nemo essential driver properties not found in configuration';
            error(errorMessage);
            const badDriverProps = new Error(errorMessage);
            badDriverProps.name = 'nemoBadDriverProps';
            cb(badDriverProps);
            return;
        }
        setup(config, (err, _nemo) => {
            if (err !== null) {
                cb(err);
                return;
            }
            _.merge(nemo, _nemo);
            cb(null, nemo);
        });
    });

    return nemo;
}


var setup = function setup(config, cb) {
    let waterfallArray = [];
    const preDriverArray = [];
    const postDriverArray = [];
    let plugins = {};
    let pluginError = false;
    const nemo = {
        'data': config.get('data'),
        'driver': {},
        '_config': config
    };
    //config is for registering plugins
    if (config && config.get('plugins')) {
        plugins = config.get('plugins');
    }


    Object.keys(plugins).forEach(function pluginsKeys(key) {
        let modulePath,
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
            const noPluginModuleError = new Error(`Nemo plugin has invalid module ${modulePath}. ${err}`);
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
    preDriverArray.unshift(function setWebdriver(callback) {
        nemo.wd = require('selenium-webdriver');
        callback(null);
    });
    if (config.get('driver:selenium.version')) {
        //install before driver setup
        log('Requested install of selenium version %s', config.get('driver:selenium.version'));
        const seleniumInstall = require('./setup/seleniumInstall');
        preDriverArray.unshift(seleniumInstall(config.get('driver:selenium.version')));
    }
    waterfallArray = preDriverArray.concat([driversetup(nemo)], postDriverArray);
    log('waterfallArray', waterfallArray);
    async.waterfall(waterfallArray, function waterfall(err) {
        if (err) {
            cb(err);
        } else {
            cb(null, nemo);
        }
    });
};

var driversetup = _nemo => function driversetup(callback) {
    const driverConfig = _nemo._config.get('driver');
    //do driver/view/locator/vars setup
    (Setup()).doSetup(driverConfig, function setupCallback(err, _driver) {
        if (err) {
            callback(err);
            return;
        }
        //set driver
        _nemo.driver = _driver;
        callback(null);

    });
};


var pluginReg = (_nemo, pluginArgs, pluginModule) => function pluginReg(callback) {

    pluginArgs.push(_nemo);
    pluginArgs.push(callback);
    try {
        pluginModule.setup.apply(this, pluginArgs);
    } catch (err) {
        //dang, someone wrote a crap plugin
        error(err);
        const pluginSetupError = new Error(`Nemo plugin threw error during setup. ${err}`);
        pluginSetupError.name = 'nemoPluginSetupError';
        callback(pluginSetupError);
    }
};

var envToJSON = prop => {
    const returnJSON = {};
    const originalValue = process.env[prop];
    if (originalValue === undefined) {
        return {
            'json': {},
            'reset'() {
            }
        };
    }
    try {
        returnJSON[prop] = JSON.parse(process.env[prop]);
        delete process.env[prop];
    } catch (err) {
        //noop
    }
    return {
        'json': returnJSON,
        'reset'() {
            process.env[prop] = originalValue;
        }
    };
};
module.exports = Nemo;