# Nemo

Nemo provides a simple way to add selenium automation to your NodeJS web projects. Provides plugin architecture to
incorporate custom features to your tests.

Nemo works best with a test runner and task runner. But in this README we will only cover setup and architecture of Nemo
as a standalone entity. Please see additional examples plugin READMEs for more information.

[![Build Status](https://magnum.travis-ci.com/paypal/nemo.svg?token=wkfLgEAgy8eZBxUbnTsB&branch=master)](https://magnum.travis-ci.com/paypal/nemo)

## Getting started

### Pre-requisites

You need to install some local webdriver or have access to a remote webdriver.

Running automation tests locally requires a browser (safari, firefox, chrome, internet explorer, phantomjs, etc) and usually some webdriver. You will need to complete one or more of the below installations depending on which browser/s you want to automate.

#### Using phantomjs and ghostdriver

By far the quickest way to get a test to run locally is by installing phantomjs.

Mac folks will find that "brew install phantomjs" works quite well to install phantomjs. Just make sure the installation is somewhere on your $PATH environment variable.

#### Setting up a local selenium webdriver

For browsers, besides Chrome and PhantomJS, you will need the selenium standalone server. Download the latest here:
https://code.google.com/p/selenium/downloads/list

As of this edit, the latest is: selenium-server-standalone-2.39.0.jar

Make sure that you use a value of SELENIUM_JAR that is an absolute path to where you've stored the executable. For teams it is recommended that everyone set up an alias to the JAR file (like /usr/bin/selenium-standalone.jar) such that everyone can share the default value found in the Gruntfile.js config.

There are other "drivers", like Appium or ios-driver, which can be used to automate iOS/Android simulators and devices. That setup is covered elsewhere.

A useful convention for teams would be to add a versionless symbolic link to a directory in your path. E.g.

```bash
$ ln -s /Users/yourname/path/to/selenium-server-standalone-2.39.0.jar /usr/bin/selenium-server-standalone.jar
```

#### Getting chromedriver
For Chrome, you will need the chromedriver binary, which is maintained by the Chromium project. Find the latest here:
http://chromedriver.storage.googleapis.com/index.html

Make sure the chromedriver binary is exposed via your PATH variable. Otherwise Selenium will not be able to locate it.


#### package.json changes

add the following to package.json devDependencies (assuming mocha is already integrated to your project):

```javascript
"nemo": "git://github.paypal.com/NodeTestTools/nemo.git#v0.6-beta",
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

You can see a versioned copy of this file within the nemo examples directory:
https://github.paypal.com/NodeTestTools/nemo/blob/v0.6-beta/examples/setup.js

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
<img src="http://www.bestcoloringpagesforkids.com/wp-content/uploads/2013/07/Nemo-Coloring-Pages-Pictures.gif" height=80 width=70/>


