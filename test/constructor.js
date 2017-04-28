/* global module: true, require: true, console: true */
'use strict';

const assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');

describe('@constructor@', () => {
  it("should return a promise with @noArguments@", done => {
    Nemo().then(nemo => {
      done(new Error('should have failed with nemoBadDriverProps'));
    }).catch(err => {
      done();
    })
  });

  it("should return a promise with @noCallback@", done => {
    Nemo({
      "driver": {
        "browser": "phantomjs"
      }
    }).then(nemo => {
      done();
    }).catch(err => {
      done(err);
    })
  });

  it("should throw an error with @noDriverProps@", done => {

    Nemo(err => {
      if (err.name === 'nemoBadDriverProps') {
        done();
        return;
      }
      done(new Error('didnt get back the expected error'));
    });

  });

  it("should launch nemo with @noConfigPath@overrideArg@", done => {
    delete process.env.nemoBaseDir;
    Nemo({
      "driver": {
        "browser": "phantomjs"
      }
    }, (err, nemo) => {
      assert(nemo.driver);
      nemo.driver.get('http://www.google.com');
      nemo.driver.quit().then(() => {
        done();
      });

    });
  });

  it("should launch nemo with @envConfigPath@noOverrideArg@", done => {
    process.env.nemoBaseDir = __dirname;
    Nemo((err, nemo) => {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });

  it("should launch nemo with @argConfigPath@noOverrideArg@", done => {
    const nemoBaseDir = __dirname;

    Nemo(nemoBaseDir, (err, nemo) => {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });

  it("should launch nemo with @allArgs@", done => {
    const nemoBaseDir = __dirname;
    Nemo(nemoBaseDir, {
      'data': {
        'argPassthrough': true
      }
    }, (err, nemo) => {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      assert(nemo.data.argPassthrough);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });

  it("should return the resolved nemo object when the callback is called", done => {
    const nemoBaseDir = __dirname;
    const returnedNemo = Nemo(nemoBaseDir, {
      'data': {
        'argPassthrough': true
      }
    }, (err, nemo) => {
      assert.equal(nemo, returnedNemo);
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });
  it('should resolve when a Confit object is the only parameter', () => Nemo.Configure({driver: {browser: 'phantomjs'}}).then(confit => Nemo(confit))
    .then(nemo => assert(nemo.driver)));
});