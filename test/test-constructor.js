/* global module: true, require: true, console: true */
"use strict";

var assert = require('assert'),
  path = require('path'),
  nemo,
  Nemo = require('../index');

describe("@nemoConstructor@ suite", function () {
  describe('@noConfig@', function () {
    before(function (done) {
      delete process.env.nemoBaseDir;
      done();
    });

    it("should launch nemo", function (done) {
      nemo = Nemo({
        "driver": {
          "browser": "firefox",
          "local": true,
          "jar": "/usr/local/bin/selenium-server-standalone.jar"
        }
      }, function () {
        assert(nemo.driver);
        nemo.driver.quit();
        done();
      });
    });

    describe("@launchBrowser@", function () {

      before(function (done) {
        nemo = Nemo({
          "driver": {
            "browser": "firefox",
            "local": true,
            "jar": "/usr/local/bin/selenium-server-standalone.jar"
          }
        }, done);
      });
      it('should launch a URL', function (done) {
        nemo.driver.get('http://www.google.com');
        nemo.driver.sleep(2000);
        nemo.driver.quit().then(function () {
          done();
        });
      });
    });
  });
  describe('@config@', function () {
    before(function (done) {
      process.env.nemoBaseDir = path.join(process.cwd(), 'test');
      done();
    });
    describe("@simple@", function () {

      it("should launch nemo", function (done) {
        nemo = Nemo(function () {
          assert(nemo.driver);
          assert(nemo.data.passThroughFromJson);
          assert.equal(nemo.data.baseDirectory, path.join(process.cwd(), 'test'));
          nemo.driver.quit();
          done();
        });
      });
    });
    describe("@launchBrowser@", function () {

      before(function (done) {
        nemo = Nemo(done);
      });
      it('should launch a URL', function (done) {
        nemo.driver.get('http://www.google.com');
        nemo.driver.sleep(2000);
        nemo.driver.quit().then(function () {
          done();
        });
      });
    });
  });


});
