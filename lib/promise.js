const wd = require('selenium-webdriver');

module.exports = function () {
    //return a nodejs promise or webdriver promise
    let fulfill, reject;
    let promise = new Promise((_resolve, _reject) => {
        fulfill = _resolve;
        reject = _reject;
    });
    return {promise, fulfill, reject};
};
