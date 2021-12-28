/* global module: true, require: true, console: true */
const assert = require('assert');
const path = require('path');
const Nemo = require('../index');
const chromeConfig = require('./driverconfig.chrome');


describe('@plugin@', function () {

  it('should @priorityRegister@', async function () {
    process.env.nemoBaseDir = path.resolve(__dirname);
    let nemo;
    try {
      nemo = await Nemo();
      assert.equal(nemo.preDriver.isDriverSetup, false);
      assert.equal(nemo.postDriver.isDriverSetup, true);
      await nemo.driver.quit();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  });
  it('should handle @nonexistPlugin@', async function () {
    delete process.env.nemoBaseDir;
    let nemo;
    try {
      nemo = await Nemo(__dirname, {
        driver: chromeConfig,
        plugins: {
          noexist: {
            module: 'ModuleThatDoesNotExist'
          }
        }
      });
    } catch (err) {
      if (err) {
        return Promise.resolve()
      }
      else if (err) {
        return Promise.reject(err);
      }
    }
  });
  it('should handle @failedPluginRegistration@', async function () {
    delete process.env.nemoBaseDir;
    let nemo;
    try {
      nemo = await Nemo(__dirname, {
        driver: chromeConfig,
        plugins: {
          crappy: {
            module: 'path:plugin/sample',
            arguments: ['crap plugin']
          }
        }
      });
    } catch (err) {
      if (err && err.name && err.name === 'nemoPluginSetupError') {
        return Promise.resolve()
      }
      else if (err) {
        return Promise.reject(err);
      }
    }
    
  });
});
