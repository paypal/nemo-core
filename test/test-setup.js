/* global module: true, require: true, console: true */
"use strict";

var should = require('chai').should(),
	Nemo = require('../index'),
	nemo;

describe("nemo setup", function () {
	var driver;
	var config = require("./config/plugins");
	var _nemo = new Nemo(config);

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
		var su = _nemo.setup({
			"samplePlugin": {
				"sampleoptions": {
					"option1": "value1",
					"option2": "value2"
				}
			},
			"locator": ["myView"],
			"view": ["myView", "myOtherView"]
		});
		//console.log(su)
		su.then(function (result) {
			nemo = result;
			nemo.props.targetBrowser.should.equal("firefox");
			nemo.props.targetServer.should.equal("http://127.0.0.1:4444/wd/hub");
			nemo.props.targetBaseUrl.should.equal("https://www.paypal.com");
			//nemo.noValue.should.equal(true);
			nemo.samplePlugin.sampleoptions.option1.should.equal("value1");
			nemo.autoRegPlugin.should.equal(true);
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
			if (nemo.view.myView && nemo.view.myView.cityOption && nemo.view.myView.cityOption.constructor === Function) {
				done();
			} else {
				done(new Error("didn't get the view method"));
			}
		});
		it("should use the view methods", function(done) {
			nemo.driver.get("http://accessify.com/features/tutorials/accessible-forms/form-examples.htm");
			nemo.view.myView.cityOptionPresent().
				then(function (present) {
					nemo.view.myView.cityOption().click();
				}).
				then(function () {
					driver.sleep(4000);
				}).
				then(function () {
					done();
				});
		});
//		it("should use the view and subview interface methods", function (done) {
//			nemo.driver.get("http://accessify.com/features/tutorials/accessible-forms/form-examples.htm");
//			nemo.view.myView.cityOptionPresent().
//				then(function (present) {
//					nemo.view.myView.cityOption().click();
//				}).
//				then(function () {
//					driver.sleep(4000);
//				}).
//				then(function () {
//					done();
//				});
//		});
//		it("should use the view and subview methods", function (done) {
//			nemo.view.myView.tellLifeStory().
//				then(function () {
//					done();
//				}, function (err) {
//					//console.log("D'oh'eth");
//					done(err);
//				});
//		});
	});
});