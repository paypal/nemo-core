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
});
