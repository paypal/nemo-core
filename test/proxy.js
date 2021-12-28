const Nemo = require('../index');
const assert = require('assert');
const chromeConfig = require('./driverconfig.chrome');

describe('@proxy@ ', function () {
  it('should load problem loading page error', async function () {
    process.env.nemoBaseDir = __dirname;
    let nemo = await Nemo({
      driver: {
        proxyDetails: {
          method: 'manual',
          args: [{'http': 'host:1234', 'ftp': 'host:1234', 'https': 'host:1234'}]
        },
        builders: chromeConfig.builders
      }
    });
    let caps = await nemo.driver.getCapabilities();
    let proxy = caps.get('proxy');
    assert.equal(proxy.proxyType, 'manual');
    assert.equal(proxy.ftpProxy, 'host:1234');
    assert.equal(proxy.httpProxy, 'host:1234');
    assert.equal(proxy.sslProxy, 'host:1234');
    await nemo.driver.quit();
    return Promise.resolve();
  });
});
