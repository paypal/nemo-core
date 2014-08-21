var Nemo = require("../");

process.env.nemoData = JSON.stringify({
	targetBrowser: "firefox",
	targetServer: "localhost",
	serverProps: {"port": 4444},
	seleniumJar: "/usr/bin/selenium-server-standalone.jar",
	targetBaseUrl: "https://www.paypal.com"
});

(new Nemo()).setup().then(function (nemo) {
	nemo.driver.get(nemo.props.targetBaseUrl);
	nemo.driver.sleep(5000).
		then(function () {
			console.info("Nemo was successful!!");
			nemo.driver.quit();
		});
});