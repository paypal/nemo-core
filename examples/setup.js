var Nemo = require('../');
Nemo({
  'driver': {
    'browser': 'firefox'
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  }
}, function (err, nemo) {
  //always check for errors!
  if (err) {
    console.log('Error during Nemo setup', err);
  }
  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.log('Nemo successfully launched', caps.get('browserName'));
    });
  nemo.driver.quit();
});
