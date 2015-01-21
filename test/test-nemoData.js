/* global module: true, require: true, console: true */
"use strict";

var should = require('chai').should(),
  Nemo = require('../index');

describe("@nemoData@ suite", function () {
  var nemo;
  describe("@environmentVariable@", function () {
    before(function (done) {
      process.env.nemoData = JSON.stringify({
        targetBrowser: "firefox",
        localServer: true,
        seleniumJar: "/usr/local/bin/selenium-server-standalone.jar",
        targetBaseUrl: "https://www.paypal.com",
        passThroughFromEnv: true
      });
      done();
    });
    after(function (done) {
      nemo.driver.quit().then(function () {
        setTimeout(function() {done();}, 100);
      });
    });
    it("should launch a local server and have the passThroughFromEnv variable", function (done) {
      (new Nemo()).setup({}).then(function (_nemo) {
        nemo = _nemo;
        nemo.driver.get(nemo.props.targetBaseUrl).then(function () {
          if (nemo.props.passThroughFromEnv === true) {
            done();
          } else {
            done(new Error("some problem with passthrough variable"));
          }
        }, function (err) {
          done(err);
        });
      });
    });
  });
  describe("@jsonVariable@", function () {
    after(function (done) {
      nemo.driver.quit().then(function () {
        setTimeout(function() {done();}, 100);
      });
    });
    var nemoData = {
      targetBrowser: "firefox",
      localServer: true,
      seleniumJar: "/usr/local/bin/selenium-server-standalone.jar",
      targetBaseUrl: "https://www.paypal.com",
      passThroughFromJson: true
    };
    var nemo;
    it("should launch a local server and have the passThroughFromEnv variable", function (done) {
      (new Nemo({nemoData: nemoData})).setup({}).then(function (_nemo) {
        nemo = _nemo;
        nemo.driver.get(nemo.props.targetBaseUrl).then(function () {
          if (nemo.props.passThroughFromJson === true && nemo.props.passThroughFromEnv === undefined) {
            done();
          } else {
            done(new Error("some problem with passthrough variable"));
          }
        }, function (err) {
          done(err);
        });
      });
    });
  });
  describe("@launchFirefox@", function () {
    before(function (done) {
      process.env.nemoData = JSON.stringify({
        targetBrowser: "firefox",
        targetBaseUrl: "https://www.paypal.com"
      });
      done();
    });
    after(function (done) {
      nemo.driver.quit().then(function () {
        setTimeout(function() {done();}, 10);
      });
    });
    it("should work without localServer, seleniumJar props", function (done) {
      (new Nemo()).setup({}).then(function (_nemo) {

        nemo = _nemo;
        console.log(nemo.props.targetBaseUrl);
        nemo.driver.get(nemo.props.targetBaseUrl).then(function () {
          done();
        }, function (err) {
          done(err);
        });
      });
    });
  });
});
