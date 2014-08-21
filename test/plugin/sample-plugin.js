var async = require("async");
module.exports = {
	"setup": function(config, result, callback) {
		//console.log(result.driver);
		var returnObj = result;
		returnObj.samplePlugin = config.samplePlugin;
		returnObj.samplePlugin.isDriverSetup = (returnObj.driver.get !== undefined);
		returnObj.props.fromSamplePlugin = true;
		//array for waterfall methods
		var sampleCalls = [
			function(cbk) {
				setTimeout(function() {
					cbk(null, {
						"fine": "good"
					});
				}, 2000);
			}
		];

		sampleCalls.push(function(res, cbk) {
			cbk(null, {
				"result": "good"
			});
		});


		async.waterfall(sampleCalls, function(err, result) {
			callback(err, config, returnObj);
		});

	}
};