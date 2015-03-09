# Nemo [![Build Status](https://travis-ci.org/paypal/nemo.svg)](https://travis-ci.org/paypal/nemo)

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
"nemo": "^0.3.1",
```

Then `npm install`

### Running Nemo

In the directory where you've installed Nemo, create a file called "nemoExample.js" with the following content:

```javascript
var Nemo = require("../");

/*
process.env.nemoData = JSON.stringify({
	targetBrowser: "firefox",
	targetServer: "localhost",
	localServer: true,
	seleniumJar: "/usr/bin/selenium-server-standalone.jar",
	targetBaseUrl: "https://www.paypal.com"
});
*/

var config = {
	nemoData: {
		targetBrowser: "firefox",
		targetServer: "localhost",
		localServer: true,
		seleniumJar: "/usr/bin/selenium-server-standalone.jar",
		targetBaseUrl: "https://www.paypal.com"
	}
};
//THE ABOVE OR BELOW WILL WORK TO SET nemoData. IN A CONTEST, SETTING VIA Nemo() WILL WIN

var nemo = Nemo(config, function() {
	nemo.driver.get(nemo.props.targetBaseUrl);
	nemo.driver.sleep(5000).
	then(function() {
		console.info("Nemo was successful!!");
		nemo.driver.quit();
	});
});
```

You can see this file within the nemo examples directory:
[https://github.com/paypal/nemo/examples/setup.js](/examples/setup.js)

Note you can set `nemoData` via an environment variable OR by passing it into the Nemo constructor.

Now, assuming you've set up a driver which matches the above requirements, you can run the following, with the following result:

```bash
$ node examples/setup.js
Nemo was successful!!
```

## Nemo Configuration

Then full config object passed to the Nemo constructor `var nemo = Nemo(config, cb);` has these basic components:

```json
{
  "nemoData": { /** properties used by Nemo to setup the driver instance **/ },
  "plugins": { /** plugins to initialize **/},
  "setup": { /** setup properties specific to certain plugins **/ }
}
```

This configuration object is optional, as long as you've got `nemoData` set as an environment variable (see below).

### nemoData
To have basic environment information, set the `nemoData` JSON either as an environment variable, or within the JSON config to the `Nemo` constructor.

Nemo will look for a `nemoData` property in the config argument. As a fallback, it will look for an environment variable named `nemoData`.
`nemoData` should be in stringified JSON format. Depending on the values therein, Nemo will start a variety of webdrivers and test
on a variety of targets.

The full `nemoData` object will be attached to the `nemo` object as `nemo.props`. This means you can pass any information you want, besides the
properties necessary to configure the nemo driver.

_Note the use of the arbitrary "targetBaseUrl" and how it is accessed later on in the script as `nemo.props.targetBaseUrl` in many examples.

Here are the `nemoData` properties recognized by Nemo:

#### autoBaseDir

Used as a root location for finding 'locator' files in your test suite. Also can be required by other plugins
which need to require modules from your test suite.

#### targetBrowser

Browser you wish to automate. Make sure that your chosen webdriver has this browser option available

#### localServer (optional, defaults to false)

Set localServer to true if you want Nemo to attempt to start a standalone binary on your system (like selenium-standalone-server) or use a local browser/driver like Chrome/chromedriver or PhantomJS.


#### targetServer (optional)

Webdriver server URL you wish to use.

If you are using sauce labs, make sure `targetServer` is set to correct url like `"http://yourkey:yoursecret@ondemand.saucelabs.com:80/wd/hub"`

#### serverProps (optional/conditional)

Additional server properties required of the 'targetServer'

You can also set args and jvmArgs to the selenium jar process as follows:

```javascript
'serverProps': {
  'port': 4444,
  'args': ['-firefoxProfileTemplate','/Users/medelman/Desktop/ffprofiles'],
  'jvmArgs': ['-someJvmArg', 'someJvmArgValue']
}
```

#### seleniumJar (optional/conditional)

Path to your selenium-standalone server Jar file. Leave unset if you aren't using a local selenium-standalone Jar.

#### serverCaps (optional)

serverCaps would map to the capabilities here: http://selenium.googlecode.com/git/docs/api/javascript/source/lib/webdriver/capabilities.js.src.html

Some webdrivers (for instance ios-driver, or appium) would have additional capabilities which can be set via this variable. As an example, you can connect to saucelabs by adding this serverCaps:

```javascript
"serverCaps": {
	"username": "medelman",
	"accessKey": "b38e179e-079a-417d-beb8-xyz", //not my real access key
	"name": "Test Suite Name", //sauce labs session name
	"tags": ['tag1','tag2'] //sauce labs tag names
}
```
#### proxyDetails (optional)
If you want to run test by setting proxy in the browser, you can use 'proxyDetails' configuration. Following options are available: direct, manual, pac and system.
Default is 'direct'. For more information refer : https://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_proxy.html

```javascript
"proxyDetails" : {
    method: "manual",
    args: [{"http": "localhost:9001","ftp":"localhost:9001","https":"localhost:9001"}]
}
```

### Plugins

You can author or use plugins to enhance your test suite. Something important to know about plugins is how you register them. Provide JSON like this to the Nemo constructor:

```javascript
{
	"plugins": {
		"samplePlugin": {
			"module": "path:plugin/sample-plugin",
			"arguments: [...]
			"priority": 99
		},
		"view": {
			"module": "nemo-view"
		}
	}
}
```

#### plugin interface

Your plugin should export a setup function with the following interface:

```javascript
module.exports.setup = function myPlugin([arg1, arg2, ..., ]nemo, callback) {
  ...
  //add your plugin to the nemo namespace
  nemo.myPlugin = myPluginFactory([arg1, arg2, ...]);

  //continue
  callback(null, nemo);
};
```

When nemo initializes your plugin, it will call the setup method with any arguments supplied in the config plus the nemo object,
plus the callback function to continue plugin initialization.

#### module

Module must resolve to a require'able module, either via name (in the case it is in your dependency tree) or via path to the file or directory.
As a convenience, you may use the "path" shortstop handler, which will prepend any value with the `process.env.nemoBaseDir` value.

#### arguments


#### priority

A `priority` value of < 100 will register this plugin BEFORE the selenium driver object is created. This means that such a plugin can modify properties of the driver (such as `serverProps`). It also means that any other elements of the Nemo setup will NOT be available to that plugin. Leaving `priority` unset will register the plugin after the driver object is created.




## Logging and debugging

Nemo uses the [debug](https://github.com/visionmedia/debug.git) module for console logging and error output. There are two classes of logging, `nemo:log` and `nemo:error`

If you want to see both classes of output, simply use the appropriate value of the DEBUG environment variable when you run nemo:

```bash
$ DEBUG=nemo:* <nemo command>
```

To see just one:

```bash
$ DEBUG=nemo:error <nemo command>
```


## Why Nemo?

Because we NEed MOre automation testing!

[![NPM](https://nodei.co/npm/nemo.png?downloads=true&stars=true)](https://nodei.co/npm/nemo/)



