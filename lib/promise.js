'use strict';

var wd = require('selenium-webdriver');
var debug = require('debug');
var log = debug('nemo:log');
var error = debug('nemo:error');

module.exports = function () {
  //return a nodejs promise or webdriver promise
  var promiz;
  var wdPromiz = wd.promise.defer();
  var fulfill = function (n) {
    wdPromiz.fulfill(n);
  };
  var reject = function (err) {
    wdPromiz.reject(err);
  };
  promiz = (global.Promise) ? new Promise(function (good, bad) {
    fulfill = good;
    reject = bad;
  }) : wdPromiz.promise;
  return {promise: promiz, fulfill, reject};
};
