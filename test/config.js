/* global module: true, require: true, console: true */
'use strict';

const assert = require('assert'),
  path = require('path'),
  Nemo = require('../index');

describe('@config@', () => {
  process.env['NEMO_UNIT_TEST'] = 'true';

  it('should pass confit object as nemo._config', done => {
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
    }, (err, nemo) => {
      assert.equal(err, undefined);
      assert(nemo._config);
      assert.equal(nemo._config.get('data:Roger:Federer:is'), 'GOAT');
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });

  it('should install provided @selenium.version@', done => {
    const ver = '^2.53.3';
    Nemo({
      'driver': {
        'browser': 'phantomjs',
        'selenium.version': ver
      }
    }, (err, nemo) => {
      assert.equal(err, undefined);
      const pac = require('selenium-webdriver/package.json');
      assert.ok(pac.version.includes('2.53'));
      nemo.driver.quit().then(() => {
        done();
      });
    });
  });

  it('should throw an error for invalid @invalid.selenium.version@', done => {
    Nemo({
      'driver': {
        'browser': 'phantomjs',
        'selenium.version': 'foo'
      }
    }, (err, nemo) => {
      assert(err);
      done();
    });
  });
  it('should export a Configure method', () => assert(Nemo.Configure && typeof Nemo.Configure === 'function'));
  it('should export a Configure method resolving to a Confit object', () => Nemo.Configure().then(confit => assert(confit.get)));
});
