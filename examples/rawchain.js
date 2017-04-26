const webdriver = require('selenium-webdriver');
const async = require('async');


function driversetup(nemo) {
  var d = webdriver.promise.defer();
  async.waterfall([function setup(cb) {
    nemo.driver = new webdriver
      .Builder()
      .forBrowser('phantomjs')
      .build();
    cb(null, nemo);
  }], function (err, result) {
    d.fulfill(result);
  });
  return d;
}

function Nemo(cb) {
  var nemo = {'foo': true};
  driversetup(nemo).then(function(_nemo) {
    nemo.driver = _nemo.driver;
    cb();
  });
  return nemo;
}

function recall() {
  console.log('start recall');
  var nemo = Nemo(function() {
    nemo.driver.getCapabilities();
    nemo.driver.quit().then(function () {
      console.log('and again');
      recall();
    });
  });

}
recall();
