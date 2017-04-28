const Nemo = require("../");
const path = require('path');
const basedir = path.resolve(__dirname, 'plugin');
Nemo(basedir, (err, nemo) => {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }
  nemo.driver.getCapabilities().then(caps => {
    const browserName = caps.get && caps.get('browserName') || caps.caps_.browserName;
    console.info("Nemo successfully launched", browserName);
  });
  nemo.driver.get(nemo.data.baseUrl);
  nemo.cookie.deleteAll();
  nemo.cookie.set('foo', 'bar');
  nemo.cookie.showAll();
  nemo.cookie.deleteAll();
  nemo.cookie.showAll();
  nemo.driver.quit();
});