/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  nemo,
  Nemo = require('../index');

describe('@constructor@', function () {
  it("should throw an error with @noArguments@", function (done) {
    try {
      nemo = Nemo();
    } catch (err) {
      if (err.name === 'nemoNoCallbackError') {
        done();
        return;
      }
      done(new Error('didnt get back the expected error'));
    }
  });
  it("should throw an error with @noDriverProps@", function (done) {

      nemo = Nemo(function(err) {
        if (err.name === 'nemoBadDriverProps') {
          done();
          return;
        }
        done(new Error('didnt get back the expected error'));
      });

  });

  it("should launch nemo with @noConfigPath@overrideArg@", function (done) {
    delete process.env.nemoBaseDir;
    nemo = Nemo({
      "driver": {
        "browser": "phantomjs"
      }
    }, function () {
      assert(nemo.driver);
      nemo.driver.get('http://www.google.com');
      nemo.driver.quit().then(function () {
        done();
      });

    });
  });


  it("should launch nemo with @envConfigPath@noOverrideArg@", function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');
    nemo = Nemo(function () {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      assert.equal(nemo.data.baseDirectory, path.join(process.cwd(), 'test'));
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });


  it("should launch nemo with @argConfigPath@noOverrideArg@", function (done) {
    var nemoBaseDir = path.join(process.cwd(), 'test');
    nemo = Nemo(nemoBaseDir, function () {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      assert.equal(nemo.data.baseDirectory, path.join(process.cwd(), 'test'));
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it("should launch nemo with @allArgs@", function (done) {
    var nemoBaseDir = path.join(process.cwd(), 'test');
    nemo = Nemo(nemoBaseDir, {
      'data': {
        'argPassthrough': true
      }
    }, function () {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      assert.equal(nemo.data.baseDirectory, path.join(process.cwd(), 'test'));
      assert(nemo.data.argPassthrough);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
});
