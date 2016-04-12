/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');


describe('@override@', function () {

  it("@fromEnv@ over config.json data", function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');
    process.env.data = JSON.stringify({
      baseUrl: 'http://www.ebay.com'
    });
    Nemo(function (err, nemo) {
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });
  it("@fromArg@ over config.json data", function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');

    Nemo({
      data: {
        baseUrl: 'http://www.ebay.com'
      }
  }, function (err, nemo) {
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });
});
