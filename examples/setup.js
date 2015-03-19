var Nemo = require("../");
var nemo = Nemo({
  "driver": {
    "browser": "firefox"
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  }
}, function () {
  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.sleep(5000).
    then(function () {
      console.info("Nemo was successful!!");
      nemo.driver.quit();
    });
});