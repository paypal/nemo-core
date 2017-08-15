const Nemo = require("../");
const config = {
  "driver": {
    "browser": "phantomjs"
  },
  'data': {
    'baseUrl': 'http://www.google.com'
  }
};

function recall() {
  console.log('start recall');
  Nemo(config, (err, nemo) => {
    nemo.driver.get(nemo.data.baseUrl);
    nemo.driver.quit().then(() => {
      console.log('and again');
      recall();
    });

  });
}
recall();