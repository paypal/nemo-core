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

    nemo = Nemo({
      "driver": {
        "browser": "phantomjs"
      },
      'plugins': {
        'noexist': {
          'module': 'path:plugin/sample'
        }
      }
    }, function (err) {
      if (err.name === 'nemoNoPluginModuleError') {
        done();
        return;
      }
      done();
    });
  });

});



