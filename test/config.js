/* global module: true, require: true, console: true */
'use strict';

var assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');

describe('@config@', function () {

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
      assert.equal(nemo._config.get('data:Roger:Federer:is'), 'GOAT');
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });
  it('should install provided @selenium.version@', function (done) {
    var ver = '2.48.2';
    nemo = Nemo({
      'driver': {
        'browser': 'phantomjs',
        'selenium.version': ver
      }
    }, function (err) {
      assert.equal(err, undefined);
      var pac = require('selenium-webdriver/package.json');
      assert.equal(pac.version, ver);
      nemo.driver.quit().then(function () {
        done();
      });
    });
  });

  it('should throw an error for invalid @invalid.selenium.version@', function (done) {
    nemo = Nemo({
      'driver': {
        'browser': 'phantomjs',
        'selenium.version': 'foo'
      }
    }, function (err) {
      assert(err);
      done();
    });
  });
});
