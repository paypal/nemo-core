'use strict';

const wd = require('selenium-webdriver');
const debug = require('debug');
const log = debug('nemo:log');
const error = debug('nemo:error');

module.exports = function () {
  //return a nodejs promise or webdriver promise
  let promiz;
  const wdPromiz = wd.promise.defer();
  let fulfill = n => {
    wdPromiz.fulfill(n);
  };
  let reject = err => {
    wdPromiz.reject(err);
  };
  promiz = (global.Promise) ? new Promise((good, bad) => {
      fulfill = good;
      reject = bad;
    }) : wdPromiz.promise;
  return {promise: promiz, fulfill, reject};
};