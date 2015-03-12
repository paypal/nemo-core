/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  nemo,
  Nemo = require('../index');


describe('@override@', function () {
  before(function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');
    done();
  });
  describe("when @envVarData@ is set", function () {
    before(function (done) {
      process.env.data = JSON.stringify({
        baseUrl: 'http://www.ebay.com'
      });
      done();
    });
    it("should override config.json data", function (done) {
      console.log(process.env.nemoBaseDir);
      nemo = Nemo(function () {
        assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
        nemo.driver.quit();
        done();
      });
    });
  });

});



