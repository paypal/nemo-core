/* global module: true, require: true, console: true */
"use strict";

var should = require('chai').should(),
  Nemo = require('../index');

describe("nemo functionality", function () {
  var driver;
  var nemo;
  var config = require("./config/plugins");
  config.nemoData = {
    "autoBaseDir": process.cwd() + "/test",
    "targetBrowser": "phantomjs",
    "targetBaseUrl": "http://localhost:8000",
    "locale": "FR"
  };
  var _nemo = Nemo(config);

  after(function (done) {
    driver.quit().then(function () {
      done();
    });
  });
  it("should create a new instance", function (done) {
    _nemo.should.not.equal(undefined);
    done();
  });
  it("should return back camelcase properties from titlecase ARGV options and also init any plugins", function (done) {
    //console.log(_nemo.setup);
    _nemo.setup({
      "samplePlugin": {
        "sampleoptions": {
          "option1": "value1",
          "option2": "value2"
        }
      },
      "locator": ["myView"],
      "view": ["myView", "myOtherView"]
    }).then(function (result) {
      nemo = result;
      nemo.props.targetBrowser.should.equal("phantomjs");
      nemo.props.targetBaseUrl.should.equal("http://localhost:8000");
      nemo.samplePlugin.sampleoptions.option1.should.equal("value1");
      driver = nemo.driver;
      done();
    }, function (err) {
      done(err);
    });
  });
  it("should navigate to the TARGET_BASE_URL set via command line", function (done) {
    driver.get(nemo.props.targetBaseUrl).
      then(function () {
        done();
      }, function (err) {
        done(err);
      });
  });
  it("should register plugin with priority < 100 prior to driver setup", function () {
    nemo.samplePlugin.isDriverSetup.should.equal(false);
    return true;
  });
  it("should take props values from plugin registration", function () {
    nemo.props.fromSamplePlugin.should.equal(true);
    return true;
  });
  it("should register plugin with no priority after driver setup", function () {
    nemo.autoRegPlugin.isDriverSetup.should.equal(true);
    return true;
  });
  describe("nemo.locator", function () {
    it("should have pulled in the myView locator", function (done) {
      if (!nemo.locator.myView) {
        done(new Error("didn't get the locator"));
      } else {
        done();
      }
    });
    it("should get the FR locator when locale is FR", function (done) {
      if (nemo.props.locale === "FR" && nemo.locatex("myView.cityOption").locator === "select[name='ddlTown'] option[value='Burkino Faso']") {
        done();
      } else {
        done(new Error("didn't get an FR flavored locator"));
      }
    });
    it("should get the default locator when locale is FR and no FR locator", function (done) {
      if (nemo.props.locale === "FR" && nemo.locatex("myView.noFRyesDefault").locator === "defaultId") {
        done();
      } else {
        done(new Error("didn't get an default flavored locator"));
      }
    });
    it("should get the single locator when no locale-specific or default locator", function (done) {
      if (nemo.props.locale === "FR" && nemo.locatex("myView.noFRnoDefault").locator === "onlyId") {
        done();
      } else {
        done(new Error("didn't get a non-flavored locator"));
      }
    });
  });
  describe("nemo.view", function () {
    it("should have the view methods available", function (done) {
      if (nemo.view.myView && nemo.view.myView.fname && nemo.view.myView.fname.constructor === Function) {
        done();
      } else {
        done(new Error("didn't get the view method"));
      }
    });
    it("should use the view methods", function (done) {
      //nemo.driver.get("https://edit.yahoo.com/registration");
      nemo.driver.get("http://localhost:8000");
      nemo.view.myView.fnameWait(3000).
        then(function (present) {
          if (present) {
            nemo.view.myView.fname().sendKeys("asdf");
          } else {
            console.log('fname not present');
          }
        }).
        then(function () {
          driver.sleep(4000);
        }).
        then(function () {
          done();
        });
    });

  });
});
