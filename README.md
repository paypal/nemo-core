# Nemo

Nemo provides a simple way to add selenium automation to your NodeJS web projects. Provides plugin architecture to
incorporate custom features to your tests.

Nemo works best with a test runner and task runner. But in this README we will only cover setup and architecture of Nemo
as a standalone entity.

For a holistic guide to using Nemo as an overall automation solution, [please start here](https://github.com/paypal/nemo-docs)


## Getting started

### Pre-requisites

#### Webdriver

[Please see here for more information about setting up a webdriver](https://github.com/paypal/nemo-docs/blob/master/driver-setup.md). Your choice of webdriver will influence some of your settings below.

#### package.json changes

add the following to package.json devDependencies (assuming mocha is already integrated to your project):

```javascript
"nemo": "git://github.com/paypal/nemo.git#master",
```

Then `npm install`

### Running Nemo

In the directory where you've installed Nemo, create a file called "nemoExample.js" with the following content:

```javascript
var Nemo = require("../");

process.env.nemoData = JSON.stringify({
	targetBrowser: "firefox",
	targetServer: "localhost",
	serverProps:  {"port": 4444},
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
```

You can see this file within the nemo examples directory:
https://github.com/paypal/nemo/examples/setup.js

Now, assuming you've set up a driver which matches the above requirements, you can run the following, with the following result:

```bash
$ node examples/setup.js
Nemo was successful!!
```

## Nemo Configuration

Nemo will look for an environment variable named `nemoData`. `nemoData` should be in stringified JSON format. Depending on
the values therein, Nemo will start a variety of webdrivers and test on a variety of targets.

In addition to the Nemo setup using the name/value pairs, the NVPs are also passed along to the nemo object returned after setup,
in the "props" namespace. You also can pass in arbitrary name/values through `nemoData`. Sometimes you might find it useful to have
such data passed in and used in your test scripts. Also, some plugins may require certain name/values to be defined here.

Note the use in the example of the arbitrary NVP "targetBaseUrl" and how it is accessed later on in the script as `nemo.props.targetBaseUrl`

Here are the required variables and their meaning:

### autoBaseDir

Used as a root location for finding 'locator' files in your test suite. Also can be required by other plugins
which need to require modules from your test suite.

### targetBrowser

Browser you wish to automate. Make sure that your chosen webdriver has this browser option available

### targetServer (optional/conditional)

Webdriver server you wish to use. Set as simply "localhost" if you are using a selenium-standalone driver on your local machine.
Leave unset if you are using chrome or phantomjs on your local machine

### serverProps (optional/conditional)

Additional server properties required of the 'targetServer'. If you are using a selenium-standalone driver on your local machine,
you have to minimally specify the port number. Leave unset if you aren't specifying a targetServer.

### seleniumJar (optional/conditional)

Path to your selenium-standalone server Jar file. Leave unset if you aren't using a local selenium-standalone Jar.

## Why Nemo?

Because we NEed MOre automation testing!



