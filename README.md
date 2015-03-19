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

### Nemo and Confit in 90 seconds

Nemo uses confit - a powerful, expressive and intuitive configuration system - to elegantly expose the Nemo and selenium-webdriver APIs.

#### Direct configuration

If you install this repo you'll get the following in `examples/setup.js`. Note the `Nemo()` constructor is directly accepting the needed configuration,
along with a callback function.

```javascript
var nemo = Nemo({
  "driver": {
    "browser": "firefox"
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  }
}, function (err) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }
  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo successfully launched", caps.caps_.browserName);
    });
  nemo.driver.quit();
});
```


Run it:

```bash
$ node examples/setup.js
Nemo successfully launched firefox
```

#### Using config files

Look at `examples/setupWithConfigFiles.js`

```javascript
//passing __dirname as the first argument tells confit to
//look in __dirname + '/config' for config files
var nemo = Nemo(__dirname, function (err) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo setup', err);
  }

  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo successfully launched", caps.caps_.browserName);
    });
  nemo.driver.quit();
});
```

Note the comment above that passing a filesystem path as the first argument to `Nemo()` will tell confit to look in that directory + `/config` for config files.

Look at `examples/config/config.json`

```javascript
{
  "driver": {
    "browser": "config:BROWSER"
  },
  "data": {
    "baseUrl": "https://www.paypal.com"
  },
  "BROWSER": "firefox"
}
```

That is almost the same config as the first example. But notice `"config:BROWSER"`. Yes, confit will resolve that to the config property `"BROWSER"`.

Run this and it will open the Firefox browser:

```bash
$ node examples/setup.js
Nemo successfully launched firefox
```

Now run this command:

```bash
$ node examples/setupWithConfigDir.js --BROWSER=chrome
Nemo successfully launched chrome
```

Here, confit resolves the `--BROWSER=chrome` command line argument and overrides the `BROWSER` value from config.json

Now this command:

```bash
$ BROWSER=chrome node examples/setupWithConfigDir.js
Nemo successfully launched chrome
```

Here, confit resolves the `BROWSER` environment variable and overrides `BROWSER` from config.json

What if we set both?

```bash
$ BROWSER=chrome node examples/setupWithConfigDir.js BROWSER=phantomjs
Nemo successfully launched chrome
```

You can see that the environment variable wins.

Now try this command:

```
$ NODE_ENV=special node examples/setupWithConfigDir.js
Nemo successfully launched phantomjs
```

Note that confit uses the value of NODE_ENV to look for an override config file. In this case `config/special.json`:

```javascript
{
  "driver": {
    "browser": "phantomjs"
  },
  "data": {
    "baseUrl": "https://www.paypal.com"
  }
}
```

Hopefully this was an instructive dive into the possibilities of Nemo + confit. There is more to learn but hopefully this is enough to whet your appetite for now!

## Nemo Constructor

The interface into Nemo is simple. The constructor is:
`var nemo = Nemo([[nemoBaseDir, ]config, ]callback);`

Note that `nemoBaseDir` can also be set as an environment variable, and can be optional in the constructor. `config` is likewise optional if you have provided
a `nemoBaseDir` value in the env or constructor.

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

#### browser (optional)

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

#### builders (optional)

This is a JSON interface to any of the Builder methods which take simple arguments and return the builder. See the Builder class here: http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_class_Builder.html

Useful such functions are:
* forBrowser (can take the place of "browser", "local" and "jar" properties above)
* withCapabilities (can take the place of "serverCaps" above)

There may be some overlap between these functions and
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

  //error in your plugin setup
  if (err) {
    callback(err);
    return;
  }
  //continue
  callback(null);
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



