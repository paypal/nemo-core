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
  it('should export a Configure method', function () {
    return assert(Nemo.Configure && typeof Nemo.Configure === 'function');
  });
  it('should export a Configure method resolving to a Confit object', function () {
    return Nemo.Configure().then(function (confit) {
      return assert(confit.get);
    });
  });
  it('should use a config object to successfully launch nemo', async function () {
    let config = await Nemo.Configure(__dirname);
    assert(config.get);
    let nemo = await Nemo(config);
    await nemo.driver.get('http://www.google.com');
    await nemo.driver.quit();
    return Promise.resolve();
  });
});
