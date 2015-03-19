var Nemo = require("../");
var path = require('path');
var basedir = path.resolve(__dirname, 'plugin');
var nemo = Nemo(basedir, function (err) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo successfully launched", caps.caps_.browserName);
    });
  nemo.driver.get(nemo.data.baseUrl);
  nemo.cookie.deleteAll();
  nemo.cookie.set('foo', 'bar');
  nemo.cookie.getAll().then(function (cookies) {
    console.log('cookies', cookies);
    console.log('=======================');
  });
  nemo.cookie.deleteAll();
  nemo.cookie.getAll().then(function (cookies) {
    console.log('cookies', cookies);
  });
  nemo.driver.quit();
});