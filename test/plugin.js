/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  nemo,
  Nemo = require('../index');


describe('@plugin@', function () {

  it("should @priorityRegister@", function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');

    nemo = Nemo(function () {
      assert.equal(nemo.preDriver.isDriverSetup, false);
      assert.equal(nemo.postDriver.isDriverSetup, true);
      nemo.driver.quit();
      done();
    });
  });
  it('should handle @nonexistPlugin@', function (done) {
    delete process.env.nemoBaseDir;

    nemo = Nemo(path.join(process.cwd(), 'test'), {
      "driver": {
        "browser": "phantomjs"
      },
      'plugins': {
        'noexist': {
          'module': 'path:plugin/sampe'
        }
      }
    }, function (err) {
      if (err && err.name && err.name === 'nemoNoPluginModuleError') {
        done();
        return;
      }
      done(new Error('didnt get the correct exception'));
    });
  });
  it('should handle @failedPluginRegistration@', function (done) {
    delete process.env.nemoBaseDir;

    nemo = Nemo(path.join(process.cwd(), 'test'), {
      "driver": {
        "browser": "phantomjs"
      },
      'plugins': {
        'crappy': {
          'module': 'path:plugin/sample',
          'arguments': ['crap plugin']
        }
      }
    }, function (err) {
      if (err && err.name && err.name === 'nemoPluginSetupError') {
        done();
        return;
      }
      done(new Error('didnt get the correct exception'));
    });
  });
});



