'use strict';

var debug = require('debug'),
  log = debug('nemo:log'),
  confit = require('confit'),
  _ = require('lodash'),
  path = require('path'),
  Promiz = require('./promise'),
  handlers = require('shortstop-handlers'),
  yargs = require('yargs'),
  error = debug('nemo:error');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

module.exports = function Configure(_basedir, _configOverride) {
  log('_basedir %s, _configOverride %o', _basedir, _configOverride);
  var basedir, configOverride;
  //settle arguments
  basedir = (arguments.length && typeof arguments[0] === 'string') ? arguments[0] : process.env.nemoBaseDir || undefined;
  configOverride = (!basedir && arguments.length && typeof arguments[0] === 'object') ? arguments[0] : undefined;
  configOverride = (!configOverride && arguments.length && arguments[1] && typeof arguments[1] === 'object') ? arguments[1] : configOverride;
  configOverride = (!configOverride) ? {} : configOverride;

  log('basedir %s, configOverride %o', basedir, configOverride);

  var prom = Promiz();

  //hack because confit doesn't JSON.parse environment variables before merging
  //look into using shorstop handler or pseudo-handler in place of this
  var envdata = envToJSON('data');
  var envdriver = envToJSON('driver');
  var envplugins = envToJSON('plugins');
  var confitOptions = {
    protocols: {
      path: handlers.path(basedir),
      env: handlers.env(),
      file: handlers.file(basedir),
      base64: handlers.base64(),
      require: handlers.require(basedir),
      exec: handlers.exec(basedir),
      glob: handlers.glob(basedir),
      argv: function argHandler(val) {
        var argv = yargs.argv;
        return argv[val] || '';
      }
    }
  };
  if (basedir) {
    confitOptions.basedir = path.join(basedir, 'config');
  }
  log('confit options', confitOptions);
  log('confit overrides: \ndata: %o,\ndriver: %o\nplugins: %o', envdata.json, envdriver.json, envplugins.json);
  //merge any environment JSON into configOverride
  _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);
  log('configOverride %o', configOverride);

  confit(confitOptions).addOverride(configOverride).create(function (err, config) {
    log('config.get(driver): %o', config.get('driver'));
    //reset env variables
    envdata.reset();
    envdriver.reset();
    envplugins.reset();
    if (err) {
      return prom.reject(err);
    }
    prom.fulfill(config);
  });
  return prom.promise;
};

var envToJSON = function (prop) {
  var returnJSON = {};
  var originalValue = process.env[prop];
  if (originalValue === undefined) {
    return {
      'json': {},
      'reset': function () {
      }
    };
  }
  try {
    returnJSON[prop] = JSON.parse(process.env[prop]);
    delete process.env[prop];
  } catch (err) {
    //noop
    error(err);
  }
  return {
    'json': returnJSON,
    'reset': function () {
      process.env[prop] = originalValue;
    }
  };
};
