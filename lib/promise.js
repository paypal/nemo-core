const wd = require('selenium-webdriver');

module.exports = function () {
    //return a nodejs promise or webdriver promise
    let promiz;
    let wdPromiz = wd.promise.defer();
    let fulfill = function (n) {
        wdPromiz.fulfill(n);
    };
    let reject = function (err) {
        wdPromiz.reject(err);
    };
    promiz = global.Promise ? new Promise(function (good, bad) {
        fulfill = good;
        reject = bad;
    }) : wdPromiz.promise;
   return {promise: promiz, fulfill, reject};
};
