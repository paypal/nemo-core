var async = require("async");
module.exports = {
	"setup": function(config, result, callback) {
		//console.log(config);
		var returnObj = result;
		returnObj.autoRegPlugin = true;
		//array for waterfall methods
		var sampleCalls = [
			function(cbk) {
				setTimeout(function() {
					cbk(null, {
						"fine": "good"
					})
				}, 2000)
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