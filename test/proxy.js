const Nemo = require('../index');
const assert = require('assert');
const chromeConfig = require('./driverconfig.chrome');

describe('@proxy@', function () {
  it('should resolve proxy settings into capabilities', async function () {
    process.env.nemoBaseDir = __dirname;
    let nemo = await Nemo({
      driver: function () {return chromeConfig.getConfig().setProxy({proxyType: 'manual', 'httpProxy': 'host:1234', 'ftpProxy': 'host:1234', 'sslProxy': 'host:1234'}).build()}
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
