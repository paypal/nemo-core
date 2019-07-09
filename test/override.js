/* global module: true, require: true, console: true */

const assert = require('assert');
const Nemo = require('../index');
const firefox = require('selenium-webdriver/firefox');

describe('@override@', function () {

  it('@fromEnv@ over config.json data', function (done) {
    process.env.nemoBaseDir = __dirname;
    process.env.data = JSON.stringify({
      baseUrl: 'http://www.ebay.com'
    });
    Nemo(function (err, nemo) {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });
  it('@fromArg@ over config.json data', function (done) {
    process.env.nemoBaseDir = __dirname;

    Nemo({
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, function (err, nemo) {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      nemo.driver.quit();
      done();
    });
  });
  it('@builders@ overrides tgtBrowser abstraction', function (done) {
    process.env.nemoBaseDir = __dirname;
    const binary = new firefox.Binary();
    binary.addArguments("--headless");

    Nemo({
      driver: {
        builders: {
          forBrowser: ['firefox'],
          setFirefoxOptions: [new firefox.Options().setBinary(binary)]
        }
      },
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, function (err, nemo) {
      nemo.driver.getCapabilities().then(function (caps) {
        assert.notEqual(caps.get('browserName'), 'chrome');
        nemo.driver.quit();
        done();
      });
    });
  });
  it('@driverFunction@ overrides other driver abstractions', function (done) {
    process.env.nemoBaseDir = __dirname;

    Nemo({
      driver: function () {
        const { Builder } = require('selenium-webdriver');
        const binary = new firefox.Binary();
        binary.addArguments("--headless");
        return new Builder().forBrowser('firefox').setFirefoxOptions(new firefox.Options().setBinary(binary)).build()
      },
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, function (err, nemo) {
      nemo.driver.getCapabilities().then(function (caps) {
        assert.notEqual(caps.get('browserName'), 'chrome');
        nemo.driver.quit();
        done();
      });
    });
  });

});
