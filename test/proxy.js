const Nemo = require('../index');
const assert = require('assert');

describe('@proxy@ ', function () {

  it('should load problem loading page error', function (done) {
    process.env.nemoBaseDir = __dirname;
    Nemo({
      'driver': {
        'proxyDetails': {
          method: 'manual',
          args: [{'http': 'host:1234', 'ftp': 'host:1234', 'https': 'host:1234'}]
        },
        'builders': {
          'forBrowser': ['phantomjs']
        }
      }
    }, function (err, nemo) {
      if (err) {
        return done(err);
      }
      nemo.driver.getCapabilities().then(function (caps) {
        var proxy = caps.get('proxy');
        assert.equal(proxy.proxyType, 'manual');
        assert.equal(proxy.ftpProxy, 'host:1234');
        assert.equal(proxy.httpProxy, 'host:1234');
        assert.equal(proxy.sslProxy, 'host:1234');
        done();

      });

    });
  });
});
