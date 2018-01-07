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

const Promiz = require('./lib/promise');
const Configure = require('./lib/configure');
const Setup = require('./lib/setup');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');
const _ = require('lodash');
const path = require('path');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration and optionally nemoData
 *
 */

module.exports = function Nemo(_basedir, _configOverride, _cb) {
  log('Nemo constructor begin');
  //argument vars
  var basedir, configOverride, cb, promiz;
  var nemo = {};

  //check for confit object as single parameter
  if (arguments.length === 1 && arguments[0].get) {
    return Setup(arguments[0]);
  }

  //settle arguments
  cb = (arguments.length && typeof arguments[arguments.length - 1] === 'function') ? arguments[arguments.length - 1] : undefined;
  basedir = (arguments.length && typeof arguments[0] === 'string') ? arguments[0] : undefined;
  configOverride = (!basedir && arguments.length && typeof arguments[0] === 'object') ? arguments[0] : undefined;
  configOverride = (!configOverride && arguments.length && arguments[1] && typeof arguments[1] === 'object') ? arguments[1] : configOverride;
  basedir = basedir || process.env.nemoBaseDir || undefined;
  configOverride = configOverride || {};
  if (!cb) {
    log('returning promise');
    promiz = Promiz();
    cb = function (err, n) {
      if (err) {
        return promiz.reject(err);
      }
      promiz.fulfill(n);
    };
  }
  log('basedir', basedir);
  log('configOverride', configOverride);
  Configure(basedir, configOverride)
    .then(function (config) {
      log('Configure complete');
      return Setup(config);
    })
    .then(function (_nemo) {
      log('Setup complete');
      _.merge(nemo, _nemo);
      return cb(null, nemo);
    })
    .catch(cb);
  return promiz && promiz.promise || nemo;
};

module.exports.Configure = Configure;