/* global module: true, require: true, console: true */

const assert = require('assert');
const Nemo = require('../index');
const chromeConfig = require('./driverconfig.chrome');

describe('@constructor@', function () {
  it('should return a promise with @noArguments@', async function () {
      let nemo;
      try {
        nemo = await Nemo();
      } catch (err) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('should have failed with nemoBadDriverProps'));
  });
  it('should return a promise with @noCallback@', async function () {
    let nemo;
    try {
      nemo = await Nemo({
        'driver': chromeConfig
      });
      await nemo.driver.quit();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
    
  });
  it('should throw an error with @noDriverProps@', async function () {
    let nemo;
    try {
      nemo = await Nemo();
    } catch (err) {
      if (err.name === 'nemoBadDriverProps') {
        return Promise.resolve();
      }
    }
    return Promise.reject(new Error('should have thrown nemoBadDriverProps'))
  });

  it('should launch nemo with @noConfigPath@overrideArg@', function (done) {
    delete process.env.nemoBaseDir;
    let nemo;
    try {
      
    } catch (err) {
      
    }
    Nemo({
      driver: chromeConfig
    }, function (err, nemo) {
      assert(nemo.driver);
      nemo.driver.get('http://www.google.com');
      nemo.driver.quit().then(function () {
        done();
      });

    });
  });


  it('should launch nemo with @envConfigPath@noOverrideArg@', function (done) {
    process.env.nemoBaseDir = __dirname;
    Nemo(function (err, nemo) {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });


  it('should launch nemo with @argConfigPath@noOverrideArg@', function (done) {
    var nemoBaseDir = __dirname;

    Nemo(nemoBaseDir, function (err, nemo) {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it('should launch nemo with @allArgs@', function (done) {
    var nemoBaseDir = __dirname;
    Nemo(nemoBaseDir, {
      data: {
        argPassthrough: true
      }
    }, function (err, nemo) {
      assert(nemo.driver);
      assert(nemo.data.passThroughFromJson);
      assert(nemo.data.argPassthrough);
      nemo.driver.get(nemo.data.baseUrl);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it('should return the resolved nemo object when the callback is called', function (done) {
    var nemoBaseDir = __dirname;
    var returnedNemo = Nemo(nemoBaseDir, {
      data: {
        argPassthrough: true
      }
    }, function (err, nemo) {
      assert.equal(nemo, returnedNemo);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it('should resolve when a Confit object is the only parameter', async function () {
    let confit = await Nemo.Configure({driver: {browser: 'phantomjs'}});
    let nemo = await Nemo(confit);
    assert(nemo.driver);
    await nemo.driver.quit();
    return Promise.resolve();
  });
});
