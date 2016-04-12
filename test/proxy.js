"use strict";

var Nemo = require('../index');
var assert = require('assert');
var path = require('path');

describe("@proxy@ ", function () {

  it("should load problem loading page error", function (done) {
    process.env.nemoBaseDir = path.join(process.cwd(), 'test');
    Nemo({
      "driver": {
        "proxyDetails": {
          method: "manual",
          args: [{"http": "host:1234", "ftp": "host:1234", "https": "host:1234"}]
        },
        "builders": {
          "forBrowser": ['phantomjs']
        }
      }
    }, function (err, nemo) {
      nemo.driver.getCapabilities().then(function (name) {
        var proxy = name.caps_.proxy;
        assert.equal(proxy.proxyType, 'manual');
        assert.equal(proxy.ftpProxy, 'host:1234');
        assert.equal(proxy.httpProxy, 'host:1234');
        assert.equal(proxy.sslProxy, 'host:1234');
        done();

      });

    });
  });
});
