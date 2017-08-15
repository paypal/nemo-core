const webdriver = require('selenium-webdriver');
const async = require('async');


function driversetup(nemo) {
  const d = webdriver.promise.defer();
  async.waterfall([function setup(cb) {
    nemo.driver = new webdriver
      .Builder()
      .forBrowser('phantomjs')
      .build();
    cb(null, nemo);
  }], (err, result) => {
    d.fulfill(result);
  });
  return d;
}

function Nemo(cb) {
  const nemo = {'foo': true};
  driversetup(nemo).then(_nemo => {
    nemo.driver = _nemo.driver;
    cb();
  });
  return nemo;
}

function recall() {
  console.log('start recall');
  const nemo = Nemo(() => {
    nemo.driver.getCapabilities();
    nemo.driver.quit().then(() => {
      console.log('and again');
      recall();
    });
  });

}
recall();
