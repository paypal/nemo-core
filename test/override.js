/* global module: true, require: true, console: true */
'use strict';

const assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');


describe('@override@', () => {
  it("@fromEnv@ over config.json data", done => {
    process.env.nemoBaseDir = __dirname;
    process.env.data = JSON.stringify({
      baseUrl: 'http://www.ebay.com'
    });
    Nemo((err, nemo) => {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });

  it("@fromArg@ over config.json data", done => {
    process.env.nemoBaseDir = __dirname;

    Nemo({
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, (err, nemo) => {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });

  it("@builders@ overrides tgtBrowser abstraction", done => {
    process.env.nemoBaseDir = __dirname;

    Nemo({
      driver: {
        browser: 'firefox'
      },
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, (err, nemo) => {
      nemo.driver.getCapabilities().then(caps => {
        assert.notEqual(caps.browserName, 'firefox');
        nemo.driver.quit();
        done();
      });
    });
  });
});
