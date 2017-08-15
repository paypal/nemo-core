"use strict";

const Nemo = require('../index');
const assert = require('assert');
const path = require('path');

describe("@proxy@ ", () => {

  it("should load problem loading page error", done => {
    process.env.nemoBaseDir = __dirname;
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
    }, (err, nemo) => {
      if (err) {
        return done(err);
      }
      nemo.driver.getCapabilities().then(caps => {
        const proxy = caps.get('proxy');
        assert.equal(proxy.proxyType, 'manual');
        assert.equal(proxy.ftpProxy, 'host:1234');
        assert.equal(proxy.httpProxy, 'host:1234');
        assert.equal(proxy.sslProxy, 'host:1234');
        done();
      });
    });
  });
});