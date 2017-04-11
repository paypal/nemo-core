'use strict';

const wd = require('selenium-webdriver');
const debug = require('debug');
const log = debug('nemo:log');
const error = debug('nemo:error');

module.exports = function () {
    //return a nodejs promise or webdriver promise
    let promiz;
    let fulfill = function (n) {
        prom.fulfill(n);
    };
    let reject = function (err) {
        prom.reject(err);
    };
    promiz = (global.Promise) ? new Promise(function (good, bad) {
        console.log('yeah')
        fulfill = good;
        reject = bad;
    }) : wd.promise.defer().promise;
   return {promise: promiz, fulfill, reject};
}