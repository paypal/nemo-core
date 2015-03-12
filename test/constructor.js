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
  it("should callback an error with @noConfigPath@noOverrideArg@", function (done) {
    delete process.env.nemoBaseDir;
    nemo = Nemo(function (err) {
      if (err) {
        done();
      }
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
      assert.equal(nemo.data.baseUrl, undefined);
      nemo.driver.get('http://www.google.com');
      nemo.driver.quit().then(function () {
        done();
      });

    });
  });

  describe('with @envConfigPath@', function () {
    before(function (done) {
      process.env.nemoBaseDir = path.join(process.cwd(), 'test');
      done();
    });
    it("should launch nemo with @noOverrideArg@", function (done) {

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
  });

  describe('with @argConfigPath@', function () {

    var nemoBaseDir;
    before(function (done) {
      nemoBaseDir = path.join(process.cwd(), 'test')
      done();
    });
    it("should launch nemo with @noOverrideArg@", function (done) {

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
  });
});
