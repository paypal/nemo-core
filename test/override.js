/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  nemo,
  Nemo = require('../index');


describe('@override@', function () {

    it("from env over config.json data", function (done) {
      process.env.nemoBaseDir = path.join(process.cwd(), 'test');
      process.env.data = JSON.stringify({
        baseUrl: 'http://www.ebay.com'
      });
      nemo = Nemo(function () {
        assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
        nemo.driver.quit();
        done();
      });
    });

});



