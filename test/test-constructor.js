/* global module: true, require: true, console: true */
"use strict";

var assert = require('assert'),
  Nemo = require('../index');

describe("@nemoConstructor@ suite", function () {
  var nemo;
  describe("@simple@", function () {

    var nemoData = {
      targetBrowser: "chrome",
      localServer: true,
      seleniumJar: "/usr/local/bin/selenium-server-standalone.jar",
      targetBaseUrl: "https://www.paypal.com",
      passThroughFromJson: true
    };
    it("should launch nemo", function (done) {
      nemo = Nemo({'nemoData': nemoData}, function () {
        assert(nemo.driver);
        assert(nemo.props.passThroughFromJson);
        nemo.driver.quit();
        done();
      });
    });
  });
  describe("@launchBrowser@", function () {

    var nemoData = {
      targetBrowser: "chrome",
      localServer: true,
      seleniumJar: "/usr/local/bin/selenium-server-standalone.jar",
      targetBaseUrl: "https://www.paypal.com",
      passThroughFromJson: true
    };
    before(function (done) {
      nemo = Nemo({'nemoData': nemoData}, done);
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
