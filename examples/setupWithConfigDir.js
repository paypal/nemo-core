var Nemo = require("../");

//passing __dirname as the first argument tells confit to
//look in __dirname + '/config' for config files
var nemo = Nemo(__dirname, function (err) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }

  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo successfully launched", caps.caps_.browserName);
    });
  nemo.driver.quit();
});