const Nemo = require('../');
const config = {
  'driver': {
    'browser': 'phantomjs'
  },
  'data': {
    'baseUrl': 'http://www.google.com'
  }
};

function recall() {
  console.log('start recall');
  Nemo(config, function (err, nemo) {
    nemo.driver.get(nemo.data.baseUrl);
    nemo.driver.quit().then(function () {
      console.log('and again');
      recall();
    });

  });
}
recall();
