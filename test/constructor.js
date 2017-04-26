/* global module: true, require: true, console: true */

const assert = require('assert');
const Nemo = require('../index');

describe('@constructor@', function () {
  it('should return a promise with @noArguments@', function (done) {
      Nemo().then(function (nemo) {
        done(new Error('should have failed with nemoBadDriverProps'));
      }).catch(function (err) {
        done();
      })
  });
  it('should return a promise with @noCallback@', function (done) {
    Nemo({
      'driver': {
        'browser': 'phantomjs'
      }
    }).then(function (nemo) {
      done();
    }).catch(function (err) {
      done(err);
    })
  });
  it('should throw an error with @noDriverProps@', function (done) {

    Nemo(function (err) {
      if (err.name === 'nemoBadDriverProps') {
        done();
        return;
      }
      done(new Error('didnt get back the expected error'));
    });

  });

  it('should launch nemo with @noConfigPath@overrideArg@', function (done) {
    delete process.env.nemoBaseDir;
    Nemo({
      'driver': {
        'browser': 'phantomjs'
      }
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
      'data': {
        'argPassthrough': true
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
      'data': {
        'argPassthrough': true
      }
    }, function (err, nemo) {
      assert.equal(nemo, returnedNemo);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it('should resolve when a Confit object is the only parameter', function () {
    return Nemo.Configure({driver: {browser: 'phantomjs'}}).then(function (confit) {
      return Nemo(confit);
    })
      .then(function (nemo) {
        return assert(nemo.driver);
      });
  });
});
