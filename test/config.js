/* global module: true, require: true, console: true */
const assert = require('assert');
const Nemo = require('../index');

describe('@config@', function () {
  process.env.NEMO_UNIT_TEST = 'true';
  it('should pass confit object as nemo._config', function (done) {
    Nemo({
      'driver': {
        'browser': 'phantomjs'
      },
      'data': {
        'Roger': {
          'Federer': {
            'is': 'GOAT'
          }
        }
      }
    }, function (err, nemo) {
      assert.equal(err, undefined);
      assert(nemo._config);
      // console.log('hi there')
      assert.equal(nemo._config.get('data:Roger:Federer:is'), 'GOAT');
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  // it('should install provided @selenium.version@', function (done) {
  //   var ver = '^2.53.1';
  //   Nemo({
  //     'driver': {
  //       'browser': 'phantomjs',
  //       'selenium.version': ver
  //     }
  //   }, function (err, nemo) {
  //     assert.equal(err, undefined);
  //     var pac = require('selenium-webdriver/package.json');
  //     assert.ok(pac.version.indexOf('2.53') !== -1);
  //     nemo.driver.quit().then(function () {
  //       done();
  //     });
  //   });
  // });

  it('should throw an error for invalid @invalid.selenium.version@', function (done) {
    Nemo({
      'driver': {
        'browser': 'phantomjs',
        'selenium.version': 'foo'
      }
    }, function (err, nemo) {
      assert(err);
      done();
    });
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
