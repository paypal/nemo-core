var async = require("async");
module.exports = {
	"setup": function(config, result, callback) {
		//console.log(config);
		var returnObj = result;
		//returnObj.autoRegPlugin = {};
		//returnObj.autoRegPlugin.isDriverSetup = (returnObj.driver.get !== undefined);

		console.log('from browser-plugin');


		//async.waterfall(sampleCalls, function(err, result) {
			callback(null, config, returnObj);
		//});

	}
};