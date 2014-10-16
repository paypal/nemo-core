var Nemo = require("../");

/*
process.env.nemoData = JSON.stringify({
	targetBrowser: "firefox",
	targetServer: "localhost",
	serverProps: {"port": 4444},
	seleniumJar: "/usr/bin/selenium-server-standalone.jar",
	targetBaseUrl: "https://www.paypal.com"
});
*/

var config = {
	nemoData: {
		targetBrowser: "firefox",
		targetServer: "localhost",
		serverProps: {
			"port": 4444
		},
		seleniumJar: "/usr/bin/selenium-server-standalone.jar",
		targetBaseUrl: "https://www.paypal.com"
	}
};
//THE ABOVE OR BELOW WILL WORK TO SET nemoData. IN A CONTEST, SETTING VIA Nemo() WILL WIN

(new Nemo(config)).setup().then(function(nemo) {
	nemo.driver.get(nemo.props.targetBaseUrl);
	nemo.driver.sleep(5000).
	then(function() {
		console.info("Nemo was successful!!");
		nemo.driver.quit();
	});
});