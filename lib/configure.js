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

module.exports = function (basedir, configOverride) {
  basedir = basedir || process.env.nemoBaseDir || undefined;
  var prom = Promiz();

  //hack because confit doesn't JSON.parse environment variables before merging
  //look into using shorstop handler or pseudo-handler in place of this
  var envdata = envToJSON('data');
  var envdriver = envToJSON('driver');
  var envplugins = envToJSON('plugins');
  var confitOptions = {
    protocols: {
      path: handlers.path(basedir, {}),
      env: handlers.env({}),
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
  log('confit overrides: \ndata: %s,\ndriver: %s\nplugins: %s', envdata.json, envdriver.json, envplugins.json);
  //merge any environment JSON into configOverride
  _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);
  confitOptions = {
    protocols: {
      path: handlers.path(basedir, {}),
      env: handlers.env({}),
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
  log('confit overrides: \ndata: %s,\ndriver: %s\nplugins: %s', envdata.json, envdriver.json, envplugins.json);
  //merge any environment JSON into configOverride
  _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);
  confit(confitOptions).addOverride(configOverride).create(function (err, config) {
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
