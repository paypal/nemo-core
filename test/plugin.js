/* global module: true, require: true, console: true */
'use strict';

const assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');


describe('@plugin@', () => {
  it("should @priorityRegister@", done => {
    process.env.nemoBaseDir = path.resolve(__dirname);

    Nemo((err, nemo) => {
      assert.equal(nemo.preDriver.isDriverSetup, false);
      assert.equal(nemo.postDriver.isDriverSetup, true);
      nemo.driver.quit();
      done();
    });
  });

  it('should handle @nonexistPlugin@', done => {
    delete process.env.nemoBaseDir;
    Nemo(__dirname, {
      "driver": {
        "browser": "phantomjs"
      },
      'plugins': {
        'noexist': {
          'module': 'ModuleThatDoesNotExist'
        }
      }
    }, err => {
      if (err) {
        done();
        return;
      }
      done(new Error('didnt get the correct exception'));
    });
  });

  it('should handle @failedPluginRegistration@', done => {
    delete process.env.nemoBaseDir;

    Nemo(__dirname, {
      "driver": {
        "browser": "phantomjs"
      },
      'plugins': {
        'crappy': {
          'module': 'path:plugin/sample',
          'arguments': ['crap plugin']
        }
      }
    }, err => {

      if (err && err.name && err.name === 'nemoPluginSetupError') {
        return done();
      }
      else if (err) {
        done(err);
      }
    });
  });
});