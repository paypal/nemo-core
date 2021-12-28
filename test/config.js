/* global module: true, require: true, console: true */
const assert = require('assert');
const Nemo = require('../index');
const chromeConfig = require('./driverconfig.chrome');

describe('@config@', function () {
  process.env.NEMO_UNIT_TEST = 'true';
  it('should pass confit object as nemo._config', async function () {
    let nemo;
    try {
      nemo = await Nemo({
        driver: chromeConfig,
        data: {
          Roger: {
            Federer: {
              is: 'perhaps the GOAT... but Novak Djokovic is in the running'
            }
          }
        }
      });
    } catch (err) {
      return Promise.reject(err);
    }
    assert(nemo._config);
    assert.equal(nemo._config.get('data:Roger:Federer:is'), 'perhaps the GOAT... but Novak Djokovic is in the running');
    await nemo.driver.quit();
    return Promise.resolve();
      
  });
  it('should install provided @selenium.version@', async function () {
    let conf = {
      driver: Object.assign({}, chromeConfig, {"selenium.version": 'latest'})
    }
    let nemo;
    try {
      nemo = await Nemo(conf);
    } catch (err) {
      return Promise.reject(err);
    }
    //TODO: not doing any specific verification here right now
    await nemo.driver.quit();
    return Promise.resolve();
  });

  it('should throw an error for invalid @invalid.selenium.version@', async function () {
    let conf = {
      driver: Object.assign({}, chromeConfig, {"selenium.version": "1.2.3.4"})
    }
    let nemo;
    try {
      nemo = await Nemo(conf);
    } catch (err) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Didnt get expected failure'));
  });

  it('should export a Configure method', function () {
    return assert(Nemo.Configure && typeof Nemo.Configure === 'function');
  });
  it('should export a Configure method resolving to a Confit object', function () {
    return Nemo.Configure().then(function (confit) {
      return assert(confit.get);
    });
  });
});
