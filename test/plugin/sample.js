var async = require("async");
module.exports = {
	"setup": function(whoami, nemo, callback) {

    if (arguments.length === 2) {
      callback = nemo;
      nemo = whoami;
      whoami = 'sample';
    }
		nemo[whoami] = {};
		nemo[whoami].isDriverSetup = (!!nemo.driver);
    callback(null, nemo);

	}
};