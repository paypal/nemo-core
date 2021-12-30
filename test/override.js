/* global module: true, require: true, console: true */

const assert = require('assert');
const Nemo = require('../index');
const {Capabilities, Builder} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
describe('@override@', function () {

  it('@fromEnv@ over config.json data', function (done) {
    process.env.nemoBaseDir = __dirname;
    process.env.data = JSON.stringify({
      baseUrl: 'http://www.ebay.com'
    });
    Nemo(async function (err, nemo) {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      await nemo.driver.quit();
      done();
    });
  });
  it('@fromArg@ over config.json data', function (done) {
    process.env.nemoBaseDir = __dirname;

    Nemo({
      data: {
        baseUrl: 'http://www.ebay.com'
      }
    }, async function (err, nemo) {
      if (err) {
        return done(err);
      }
      assert.equal(nemo.data.baseUrl, 'http://www.ebay.com');
      await nemo.driver.quit();
      done();
    });
  });
  it('@builders@ overrides tgtBrowser abstraction', async function () {
    process.env.nemoBaseDir = __dirname;
    debugger;
    let nemo;
    try {
      nemo = await Nemo({
        driver: {
          builders: {
            forBrowser: ['firefox'],
            setFirefoxOptions: [(new firefox.Options()).setBinary(firefox.Channel.RELEASE)]
          }
        },
        data: {
          baseUrl: 'http://www.ebay.com'
        }
      });
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
    let caps = await nemo.driver.getCapabilities()
    assert.notEqual(caps.get('browserName'), 'chrome');
    await nemo.driver.quit();
    return Promise.resolve();
  });
  it('@driverFunction@ overrides other driver abstractions', async function () {
    process.env.nemoBaseDir = __dirname;
    let nemo;
    try {
      nemo = await Nemo({
        driver: function () {
          return new Builder().forBrowser('firefox').setFirefoxOptions((new firefox.Options()).setBinary(firefox.Channel.RELEASE).headless()).build()
        },
        data: {
          baseUrl: 'http://www.ebay.com'
        }
      });
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
    let caps = await nemo.driver.getCapabilities();
    assert.notEqual(caps.get('browserName'), 'chrome');
    await nemo.driver.quit();
    return Promise.resolve();

  });

});
