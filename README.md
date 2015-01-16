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
"nemo": "^0.3.0.alpha",
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

(new Nemo(config)).setup().then(function(nemo) {
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

Nemo will look for a JSON object in the constructor config argument. As a fallback, it will look for an environment variable named `nemoData`. `nemoData` should be in stringified JSON format. Depending on
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

### localServer (optional, defaults to false)

Set localServer to true if you want Nemo to attempt to start a standalone binary on your system (like selenium-standalone-server) or use a local browser/driver like Chrome/chromedriver or PhantomJS.


### targetServer (optional)

Webdriver server URL you wish to use.

If you are using sauce labs, make sure `targetServer` is set to correct url like `"http://yourkey:yoursecret@ondemand.saucelabs.com:80/wd/hub"`

### serverProps (optional/conditional)

Additional server properties required of the 'targetServer'

You can also set args and jvmArgs to the selenium jar process as follows:

```javascript
'serverProps': {
  'port': 4444,
  'args': ['-firefoxProfileTemplate','/Users/medelman/Desktop/ffprofiles'],
  'jvmArgs': ['-someJvmArg', 'someJvmArgValue']
}
```

### seleniumJar (optional/conditional)

Path to your selenium-standalone server Jar file. Leave unset if you aren't using a local selenium-standalone Jar.

### serverCaps (optional)

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

## Plugins

You can author or use plugins to enhance your test suite. Something important to know about plugins is how you register them. Provide JSON like this to the Nemo constructor:

```javascript
{
	"plugins": {
		"samplePlugin": {
			"module": "./test/plugin/sample-plugin",
			"priority": 99
		},
		"drivex": {
			"module": "nemo-drivex",
			"register": true
		},
		"autoRegPlugin": {
			"module": "./test/plugin/autoreg-plugin",
			"register": true
		},
		"locatex": {
			"module": "nemo-locatex",
			"register": true
		},
		"view": {
			"module": "nemo-view"
		}
	}
}
```

### priority

A `priority` value of < 100 will register this plugin BEFORE the selenium driver object is created. This means that such a plugin can modify properties of the driver (such as `serverProps`). It also means that any other elements of the Nemo setup will NOT be available to that plugin. Leaving `priority` unset will register the plugin after the driver object is created.

### register

Setting `register: true` will cause this plugin to register whether or not you supply any accompanying configuration in the Nemo.setup config object.

### More on plugins

More on plugin authoring can be found here: https://github.com/paypal/nemo-docs/blob/master/plugins.md

File issues for new plugin creation here: https://github.com/paypal/nemo-plugin-registry/issues

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

## API

### Nemo constructor

```javascript
/**
 * Represents a Nemo instance
 * @constructor
 * @param {Object} config - Object which contains any plugin registration and optionally the nemoData object
 *
 */
```

### Nemo.setup

```javascript
/**
*
* Nemo.setup
*@param {Object} config -
*  {
*    'view': ['example-login', 'serviceError']   //optional
*    ,'locator': ['wallet']                      //optional
*    ,<plugin config namespace>: <plugin config> //optional, depends on plugin setup
*  }
*@returns webdriver.promise - successful fulfillment will return an {Object} as below:
*  {
*    'view': {}                           //view instances if specified in config
*    ,'locator': {}                       //locator instances if specified in config
*    ,'driver': {}                        //driver instance. ALWAYS
*    ,'wd': {}                            //static reference to selenium-webdriver. ALWAYS
*    ,<plugin namespace>: <plugin object> //if plugin registers
*  }
*/
```
## Breaking down the setup method

When you call 'setup' on a Nemo instance, what happens? The answer is important if you plan to write your own plugins or place Nemo in a new context outside of the examples already provided. Here is a plain English description of what happens:

1. caller calls Nemo.setup(obj), obj being optional for when you are passing in plugins and/or plugin config
2. Nemo.setup unpacks the nemoData environment variable, converts it to a JSON object
3. Nemo.setup creates a return object (returnObj), and assigns the nemoData JSON data to the returnObj.props namespace
2. Nemo.setup creates an array (waterFallArray) of setup functions, with the first one being 'driversetup'
   * driversetup will instantiate the selenium-webdriver session, and add it to 'result' as result.driver
   * driversetup will also add the selenium-webdriver module as result.wd (so other components can access the module)
3. Nemo.setup loops through the 'obj.plugins' object, if passed in, and adds each plugin's 'setup' method to waterFallArray
   * each plugin (besides a 'view' plugin) must have a 'setup' method with signature (config, result, callback)
   * the 'setup' method may add an object to the 'result' namespace
   * the 'setup' method must call the callback function with config and result
4. Nemo.setup adds 'viewsetup' to the waterFallArray, if obj.view was passed in
   * viewsetup will add result.view.<current view name> object for each string element in the obj.view array
   * if a 'view' plugin was specified, then Nemo will defer to that plugins 'addView' method
   * if no 'view' plugin was specified, then Nemo will look for modules in the targetBaseDir/view/ directory
5. Nemo.setup adds 'locatorsetup' to the waterFallArray, if obj.locator was passed in
   * locatorsetup will add result.locator.<current locator name> for each string element in the obj.locator array
6. Nemo.setup executes the waterFallArray methods using async.waterfall
7. Nemo.setup returns a selenium-webdriver promise to the caller
7. Each waterFallArray method, including the plugin setup methods, has the signature (config, result, callback)
8. Each waterFallArray method can add to the 'result' object, and must pass along the config and result object in the callback
9. The final callback in async.waterfall fulfills the promise from step 7, passing along the final 'result' object


## Why Nemo?

Because we NEed MOre automation testing!

[![NPM](https://nodei.co/npm/nemo.png?downloads=true&stars=true)](https://nodei.co/npm/nemo/)



