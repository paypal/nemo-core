var Nemo = require("../");

//passing __dirname as the first argument tells confit to
//look in __dirname + '/config' for config files
Nemo(__dirname, function (err, nemo) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }

  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().then(function (caps) {
    var browserName = caps.get && caps.get('browserName') || caps.caps_.browserName;
    console.info("Nemo successfully launched", browserName);
  });
  nemo.driver.quit();
});
