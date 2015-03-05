/* global module: true, require: true, console: true */
"use strict";

var assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');

describe("@nemoConstructor@ suite", function () {
  var nemo;
  before(function(done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');
    done();
  });
  describe("@simple@", function () {

    it("should launch nemo", function (done) {
      nemo = Nemo(function () {
        assert(nemo.driver);
        assert(nemo.data.passThroughFromJson);
        assert(nemo.data.baseDirectory);
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
