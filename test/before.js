before(function(done) {
  process.env.nemoData = JSON.stringify({
    "autoBaseDir": process.cwd() + "/test",
    "targetBrowser": "phantomjs",
    //"targetServer": "http://127.0.0.1:4444/wd/hub",
    "targetBaseUrl": "https://www.paypal.com",
    //"seleniumJar": "/usr/bin/selenium-server-standalone.jar",
    //"serverProps":  {"port": 4444},
    "locale": "FR"
  });
  done();
});
