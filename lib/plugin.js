'use strict';
const debug = require('debug');
const log = debug('nemo:log');
const error = debug('nemo:error');
const Promiz = require('./promise');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

module.exports.compare = function (a, b) {
    let ap;
    let bp;
    ap = (!Number.isNaN(a.priority)) ? a.priority : Number.MIN_VALUE;
    bp = (!Number.isNaN(b.priority)) ? b.priority : Number.MIN_VALUE;
    ap = (ap === -1) ? Number.MAX_VALUE : ap;
    bp = (bp === -1) ? Number.MAX_VALUE : bp;
    return ap - bp;
};

module.exports.registration = function (nemo, plugins) {
    log('plugin.registration start');
    const promiz = Promiz();
    let pluginError;
    const registerFns = [];
    const pluginErrored = Object.keys(plugins || {}).find(function pluginsKeys(key) {
        const pluginConfig = plugins[key];
        const pluginArgs = pluginConfig.arguments || [];
        const modulePath = pluginConfig.module;
        let pluginModule;

        //register this plugin
        log(`register plugin ${key}`);
        try {
            pluginModule = require(modulePath);
        } catch (err) {
            pluginError = err;
            //returning true means we bail out of building registerFns
            return true;
        }
        if (pluginConfig.priority && pluginConfig.priority === 100 || Number.isNaN(pluginConfig.priority)) {
            pluginError = new Error(`Plugin priority not set properly for ${key}`);
            return true;
        }

        registerFns.push({
            fn: pluginReg(nemo, pluginArgs, pluginModule),
            key,
            priority: pluginConfig.priority || -1
        });
        return false;
    });

    if (pluginErrored) {
        error(pluginError);
        promiz.reject(pluginError);

    } else {
        log(`plugin.registration fulfill with ${registerFns.length} plugins.`);
        promiz.fulfill(registerFns);
    }
    return promiz.promise;
};

const pluginReg = (_nemo, pluginArgs, pluginModule) => function pluginReg(callback) {

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