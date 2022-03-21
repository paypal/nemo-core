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

const Configure = require('./lib/configure');
const Setup = require('./lib/setup');
const debug = require('debug');
const log = debug('nemo-core:log');
const error = debug('nemo-core:error');

log.log = console.log.bind(console);
error.log = console.error.bind(console);

/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration and optionally nemoData
 *
 */

module.exports = async function Nemo(_basedir, _configOverride, _cb) {
  log('Nemo constructor begin');
  //argument vars
  var basedir, configOverride, cb;
  var nemo = {};

  //promise
  let resolve, reject;
  let prom;
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
    prom = new Promise((yay, boo) => {
      resolve = yay;
      reject = boo;
    });
    cb = function (err, n) {
      if (err) {
        return reject(err);
      }
      return resolve(n);
    };
  } 
  log('basedir', basedir);
  log('configOverride', configOverride);
  try {
    let config = await Configure(basedir, configOverride);
    let _nemo = await Setup(config);
    log('Setup complete');
    nemo = Object.assign({}, nemo, _nemo);
    cb(null, nemo);
  } catch(err) {
    error(`error in Nemo constructor ${err}`)
    cb(err);
  }
  
  return prom || nemo;
};

module.exports.Configure = Configure;