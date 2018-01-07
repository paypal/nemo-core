const debug = require('debug');
const log = debug('nemo-core:log');
const confit = require('confit');
const _ = require('lodash');
const path = require('path');
const Promiz = require('./promise');
const handlers = require('shortstop-handlers');
const yargs = require('yargs');
const error = debug('nemo-core:error');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

module.exports = function Configure(_basedir, _configOverride, _handlersOverride) {
  log('_basedir %s, _configOverride %o', _basedir, _configOverride);
  let basedir, configOverride, handlersOverride;
  //settle arguments
  basedir = arguments.length && typeof arguments[0] === 'string' ? arguments[0] : process.env.nemoBaseDir || undefined;
  configOverride = !basedir && arguments.length && typeof arguments[0] === 'object' ? arguments[0] : undefined;
  configOverride = !configOverride && arguments.length && arguments[1] && typeof arguments[1] === 'object' ? arguments[1] : configOverride;
  configOverride = !configOverride ? {} : configOverride;
  handlersOverride = arguments.length && typeof arguments[0] === 'boolean' ? arguments[0] : undefined;
  handlersOverride = !handlersOverride && arguments.length && typeof arguments[1] === 'boolean' ? arguments[1] : handlersOverride;
  handlersOverride = !handlersOverride && arguments.length && typeof arguments[2] === 'boolean' ? arguments[2] : handlersOverride;

  log('basedir %s, configOverride %o, handlersOverride %s', basedir, configOverride, handlersOverride);

  let prom = Promiz();

  //hack because confit doesn't JSON.parse environment variables before merging
  //look into using shorstop handler or pseudo-handler in place of this
  let envdata = envToJSON('data');
  let envdriver = envToJSON('driver');
  let envplugins = envToJSON('plugins');

  let confitOptions = {
    protocols: {
      path: handlers.path(basedir),
      env: handlers.env(),
      file: handlers.file(basedir),
      base64: handlers.base64(),
      require: handlers.require(basedir),
      exec: handlers.exec(basedir),
      glob: handlers.glob(basedir),
      argv: function argHandler(val) {
        let argv = yargs.argv;
        return argv[val] || '';
      }
    }
  };
  if (handlersOverride) {
    confitOptions = {
      protocols: {
        _path: handlers.path(basedir),
        _env: handlers.env(),
        _file: handlers.file(basedir),
        _base64: handlers.base64(),
        _require: handlers.require(basedir),
        _exec: handlers.exec(basedir),
        _glob: handlers.glob(basedir),
        _argv: function argHandler(val) {
          let argv = yargs.argv;
          return argv[val] || '';
        }
      }
    };
  }
  if (basedir) {
    confitOptions.basedir = path.join(basedir, 'config');
  }
  log('confit options', confitOptions);
  log('confit overrides: \ndata: %o,\ndriver: %o\nplugins: %o', envdata.json, envdriver.json, envplugins.json);
  //merge any environment JSON into configOverride
  _.merge(configOverride, envdata.json, envdriver.json, envplugins.json);
  log('configOverride %o', configOverride);

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

let envToJSON = function (prop) {
  let returnJSON = {};
  let originalValue = process.env[prop];
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

