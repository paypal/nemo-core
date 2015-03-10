# Nemo [![Build Status](https://travis-ci.org/paypal/nemo.svg)](https://travis-ci.org/paypal/nemo)

Nemo provides a simple way to add selenium automation to your NodeJS web projects. With a powerful configuration ability provided by [krakenjs/confit](https://github.com/krakenjs/confit), and plugin
architecture, Nemo is flexible enough to handle any browser/device automation need.

Nemo is built to easily plug into any task runner and test runner. But in this README we will only cover setup and architecture of Nemo
as a standalone entity.

For a holistic guide to using Nemo as an overall automation solution, [please start here](https://github.com/paypal/nemo-docs)


## Getting started

### Pre-requisites

#### Webdriver

[Please see here for more information about setting up a webdriver](https://github.com/paypal/nemo-docs/blob/master/driver-setup.md). Your choice of webdriver will influence some of your settings below.

#### package.json changes

add the following to package.json devDependencies (assuming mocha is already integrated to your project):

```javascript
"nemo": "^1.0.0",
```

Then `npm install`

### Running Nemo

In the directory where you've installed Nemo, create a file called "nemoExample.js" with the following content:

```javascript
var Nemo = require('nemo');
var nemo = Nemo({
  'driver': {
    'browser': 'firefox',
    'local': true,
    'jar': '/usr/local/bin/selenium-server-standalone.jar'
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  }
}, function () {
  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.sleep(5000).
    then(function () {
      console.info('Nemo was successful!!');
      nemo.driver.quit();
    });
});
```

You can see this file within the nemo examples directory:
[https://github.com/paypal/nemo/examples/setup.js](/examples/setup.js)

Now, assuming you've set up a driver which matches the above requirements, you can run the following, with the following result:

```bash
$ node examples/setup.js
Nemo was successful!!
```
## Nemo Constructor

The interface into Nemo is simple. The constructor is:
`var nemo = Nemo([config, ]callback);`

You can provide configuration (defined below) into the constructor, or via the confit based configuration feature. The constructor will immediately
return an empty object. After the internal setup routine, the object will be resoled as the `nemo` namespace. Use the callback to be notified
of full `nemo` resolution.

A typical pattern would be to use `mocha` as a test runner, resolve `nemo` in the context of the mocha `before` function, and use
the mocha `done` function as the callback:

```javascript
var nemo;
describe('my nemo suite', function() {
  before(function(done) {
    nemo = Nemo(config, done);
  });
  it('will launch browsers!', function(done) {
    nemo.driver.get('https://www.paypal.com');
    nemo.driver.quit().then(function() {
       done();
    });
  });
});

```

## Nemo Configuration

```javascript
{
  "driver": { /** properties used by Nemo to setup the driver instance **/ },
  "plugins": { /** plugins to initialize **/},
  "data": { /** arbitrary data to pass through to nemo instance **/ }
}
```

This configuration object is optional, as long as you've got `nemoData` set as an environment variable (see below).

### driver

Here are the `driver` properties recognized by Nemo:

#### browser

Browser you wish to automate. Make sure that your chosen webdriver has this browser option available

#### local (optional, defaults to false)

Set local to true if you want Nemo to attempt to start a standalone binary on your system (like selenium-standalone-server) or use a local browser/driver like Chrome/chromedriver or PhantomJS.


#### server (optional)

Webdriver server URL you wish to use.

If you are using sauce labs, make sure `server` is set to correct url like `"http://yourkey:yoursecret@ondemand.saucelabs.com:80/wd/hub"`

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

#### jar (optional/conditional)

Path to your webdriver server Jar file. Leave unset if you aren't using a local selenium-standalone Jar (or similar).

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

### plugins

Plugins are registered with JSON like the following (will vary based on your plugins)

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

#### module

Module must resolve to a require'able module, either via name (in the case it is in your dependency tree) or via path to the file or directory.
As a convenience, you may use the "path" shortstop handler, which will prepend any value with the `process.env.nemoBaseDir` value, or the
`process.cwd()` valuer if the environment variable is not set.

#### arguments (optional, depending on plugin)

Array, to which the `nemo` namespace and a callback function will be `Array.push`'d, and then applied (using `Function.apply`) to the plugin's setup function.

#### priority

A `priority` value of < 100 will register this plugin BEFORE the selenium driver object is created. This means that such a plugin can modify properties of the driver (such as `serverProps`). It also means that any other elements of the Nemo setup will NOT be available to that plugin. Leaving `priority` unset will register the plugin after the driver object is created.

## Nemo namespace

The resolved `nemo` namespace has the following properties

### driver

The live `selenium-webdriver` API. See WebDriver API Doc: http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebDriver.html

### wd

This is a reference to the `selenium-webdriver` module: http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver.html

### data

Pass through of any data included in the `data` property of the configuration

### _config

This is the confit configuration object. Documented here: https://github.com/krakenjs/confit#config-api

### plugin namespace(s)

Plugins are responsible for registering their own namespace under nemo. The convention is that the plugin should register the same namespace
as is specified in the plugin configuration. E.g.

## External configuration

While you can fully configure nemo via the `config` argument in the constructor, you will get better flexibility by using the confit enabled configuration
ability.

In order to do this, you must:
* set the `process.env.nemoBaseDir` environment variable to the base directory of your UI tests: e.g. `.../myApp/tests`
* have a config directory under that: e.g. `.../myApp/tests/config`
* have a config.json file in that directory, following the format of the Nemo constructor config (doc'd above)
* have any `NODE_ENV` specific overrides in a config file named as the `NODE_ENV` (development, staging)
  * please see the confit README for full documentation on confit override behavior based on `NODE_ENV`

### Available shortstop handlers

Shortstop handlers are data processors that key off of directives in the JSON data. Ones that are enabled in nemo are:

#### path

use path to prepend the `nemoBaseDir` (or `process.cwd()`) to a value. E.g. if `nemoBaseDir` is `.../myApp/tests` then
a config value of `'path:plugin/myPlugin'` will resolve to `.../myApp/tests/plugin/myPlugin`

#### env

use env to reference environment variables. E.g. a config value of `'env:PATH'` will resolve to `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:...`

#### config

Use config to reference data in other parts of the JSON configuration. E.g. in the following config.json:

```javascript
{
  'driver': {
    ...
  },
  'plugins': {
    'myPlugin': {
      'module': 'nemo-some-plugin',
      'arguments': ['config:data.someProp']
    }
  },
  'data': {
    'someProp': 'someVal'
  }
}
```

The value of `plugins.myPlugin.arguments[0]` will be `someVal`


## Plugins

Authoring a plugin, or using an existing plugin, is a great way to increase the power and usefulness of your Nemo installation. A plugin should add
its API to the `nemo` object it receives and passes on in its constructor (see "plugin interface" below)

### plugin interface

A plugin should export a setup function with the following interface:

```javascript
module.exports.setup = function myPlugin([arg1, arg2, ..., ]nemo, callback) {
  ...
  //add your plugin to the nemo namespace
  nemo.myPlugin = myPluginFactory([arg1, arg2, ...]); //adds myMethod1, myMethod2

  //continue
  callback(null, nemo);
};
```

When nemo initializes your plugin, it will call the setup method with any arguments supplied in the config plus the nemo object,
plus the callback function to continue plugin initialization.

Then in your module where you use Nemo, you will be able to access the plugin functionality:

```javascript
var Nemo = require('nemo');
var nemo = Nemo({
  'driver': {
    'browser': 'firefox',
    'local': true,
    'jar': '/usr/local/bin/selenium-server-standalone.jar'
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  },
  'plugins': {
    'myPlugin': {
      'module': 'path:plugin/my-plugin',
      'arguments': [...]
      'priority': 99
    },
  }
}, function () {
  nemo.driver.get(nemo.data.baseUrl);
  nemo.myPlugin.myMethod1();
  nemo.myPlugin.myMethod2();
  nemo.driver.sleep(5000).
    then(function () {
      console.info('Nemo was successful!!');
      nemo.driver.quit();
    });
});
```




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



