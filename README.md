# Nemo-core [![Build Status](https://travis-ci.org/paypal/nemo-core.svg)](https://travis-ci.org/paypal/nemo-core)

[![Join the chat at https://gitter.im/paypal/nemo-core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/paypal/nemo-core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![JS.ORG](https://img.shields.io/badge/js.org-nemo-ffb400.svg?style=flat-square)](http://js.org)
[![Dependency Status](https://david-dm.org/paypal/nemo-core.svg)](https://david-dm.org/paypal/nemo-core)
[![devDependency Status](https://david-dm.org/paypal/nemo-core/dev-status.svg)](https://david-dm.org/paypal/nemo-core#info=devDependencies)

Nemo-core provides a simple way to add selenium automation to your NodeJS web projects. With a powerful configuration 
ability provided by [krakenjs/confit](https://github.com/krakenjs/confit), and plugin
architecture, Nemo-core is flexible enough to handle any browser/device automation need.

Nemo-core is built to easily plug into any task runner and test runner. But in this README we will only cover setup and architecture of Nemo-core
as a standalone entity.

## Getting started

### Install

```
npm install --save-dev nemo-core
```

### Pre-requisites

#### Webdriver

[Please see here for more information about setting up a webdriver](https://github.com/paypal/nemo-docs/blob/master/driver-setup.md).
As long as you have the appropriate browser or browser driver (selenium-standalone, chromedriver) on your PATH, the rest of this should work
fine.



### Nemo-core and Confit in 90 seconds

Nemo-core uses confit - a powerful, expressive and intuitive configuration system - to elegantly expose the Nemo-core and selenium-webdriver APIs.

#### Direct configuration

If you install this repo you'll get the following in `examples/setup.js`. Note the `NemoCore()` constructor is directly accepting the needed configuration,
along with a callback function.

```javascript
NemoCore({
  "driver": {
    "browser": "firefox"
  },
  'data': {
    'baseUrl': 'https://www.paypal.com'
  }
}, function (err, nemo) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo-core setup', err);
  }
  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo-core successfully launched", caps.caps_.browserName);
    });
  nemo.driver.quit();
});
```


Run it:

```bash
$ node examples/setup.js
Nemo-core successfully launched firefox
```

#### Using config files

Look at `examples/setupWithConfigFiles.js`

```javascript
//passing __dirname as the first argument tells confit to
//look in __dirname + '/config' for config files
NemoCore(__dirname, function (err, nemo) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo-core setup', err);
  }

  nemo.driver.get(nemo.data.baseUrl);
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo-core successfully launched", caps.caps_.browserName);
    });
  nemo.driver.quit();
});
```

Note the comment above that passing a filesystem path as the first argument to `NemoCore()` will tell confit to look in that directory + `/config` for config files.

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
Nemo-core successfully launched firefox
```

Now run this command:

```bash
$ node examples/setupWithConfigDir.js --BROWSER=chrome
Nemo-core successfully launched chrome
```

Here, confit resolves the `--BROWSER=chrome` command line argument and overrides the `BROWSER` value from config.json

Now this command:

```bash
$ BROWSER=chrome node examples/setupWithConfigDir.js
Nemo-core successfully launched chrome
```

Here, confit resolves the `BROWSER` environment variable and overrides `BROWSER` from config.json

What if we set both?

```bash
$ BROWSER=chrome node examples/setupWithConfigDir.js --BROWSER=phantomjs
Nemo-core successfully launched chrome
```

You can see that the environment variable wins.

Now try this command:

```
$ NODE_ENV=special node examples/setupWithConfigDir.js
Nemo-core successfully launched phantomjs
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

Hopefully this was an instructive dive into the possibilities of Nemo-core + confit. There is more to learn but hopefully this is enough to whet your appetite for now!

## Nemo-core and Plugins in 60 Seconds

Look at the `example/setupWithPlugin.js` file:

```javascript
NemoCore(basedir, function (err, nemo) {
  //always check for errors!
  if (!!err) {
    console.log('Error during Nemo-core setup', err);
  }
  nemo.driver.getCapabilities().
    then(function (caps) {
      console.info("Nemo-core successfully launched", caps.caps_.browserName);
    });
  nemo.driver.get(nemo.data.baseUrl);
  nemo.cookie.deleteAll();
  nemo.cookie.set('foo', 'bar');
  nemo.cookie.getAll().then(function (cookies) {
    console.log('cookies', cookies);
    console.log('=======================');
  });
  nemo.cookie.deleteAll();
  nemo.cookie.getAll().then(function (cookies) {
    console.log('cookies', cookies);
  });
  nemo.driver.quit();
});
```

Notice the `nemo.cookie` namespace. This is actually a plugin, and if you look at the config for this setup:
```javascript
{
  "driver": {
    "browser": "firefox"
  },
  "data": {
    "baseUrl": "https://www.paypal.com"
  },
  "plugins": {
    "cookie": {
      "module": "path:./nemo-cookie"
    }
  }
}
```
You'll see the `plugins.cookie` section, which is loading `examples/plugin/nemo-cookie.js` as a plugin:
```javascript
'use strict';

module.exports = {
  "setup": function (nemo, callback) {
    nemo.cookie = {};
    nemo.cookie.delete = function (name) {
      return nemo.driver.manage().deleteCookie(name);
    };
    nemo.cookie.deleteAll = function () {
      return nemo.driver.manage().deleteAllCookies();
    };
    nemo.cookie.set = function (name, value, path, domain, isSecure, expiry) {
      return nemo.driver.manage().addCookie(name, value, path, domain, isSecure, expiry)
    };
    nemo.cookie.get = function (name) {
      return nemo.driver.manage().getCookie(name);
    };
    nemo.cookie.getAll = function () {
      return nemo.driver.manage().getCookies();
    };
    callback(null);

  }
};
```

Running this example:

```bash
$ node examples/setupWithPlugin.js
Nemo-core successfully launched firefox
cookies [ { name: 'foo',
   value: 'bar',
   path: '',
   domain: 'www.paypal.com',
   secure: false,
   expiry: null } ]
=======================
cookies []
$
```

This illustrates how you can create a plugin, and the sorts of things you might want to do with a plugin.

## API

### Nemo-core

`var nemo = NemoCore([[nemoBaseDir, ][config, ][callback]] | [Confit object]);`

`@argument nemoBaseDir {String}` (optional) - If provided, should be a filesystem path to your test suite. Nemo-core will expect to find a `/config` directory beneath that.
`<nemoBaseDir>/config/config.json` should have your default configuration (described below). `nemoBaseDir` can alternatively be set as an environment variable. If it is
not set, you need to pass your configuration as the `config` parameter (see below).

`@argument config {Object}` (optional) - Can be a full configuration (if `nemoBaseDir` not provided) or additional/override configuration to what's in your config files.

`@argument callback {Function}` (optional) - This function will be called once the `nemo` object is fully resolved. It may be called with an error as the first argument which has important debugging information. So make sure to check for an error. The second argument is the resolved `nemo` object.

`@argument Confit object {Object}` (optional) - If a Confit object is passed, the configuration step is skipped and the passed object is used directly.

`@returns nemo {Object|Promise}` - Promise returned if no callback provided. Promise resolves with the same nemo object as would be given to the callback.
 The nemo object has the following properties:

* **driver** The live `selenium-webdriver` API. See WebDriver API Doc: http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

* **wd** This is a reference to the `selenium-webdriver` module: http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html

* **data** Pass through of any data included in the `data` property of the configuration

* **_config** This is the confit configuration object. Documented here: https://github.com/krakenjs/confit#config-api

* **plugin namespace(s)** Plugins are responsible for registering their own namespace under nemo. The convention is that the plugin should register the same namespace
as is specified in the plugin configuration. E.g. the `nemo-view` module registers itself as `nemo.view` and is configured like this:

```javascript
{
  "driver": ...
  "plugins": {
    "view": {
      "module": "nemo-view"
    }
  }
```

You could also have a config that looks like this, and `nemo-view` will still register itself as `nemo.view`

```javascript
{
  "driver": ...
  "plugins": {
    "cupcakes": {
      "module": "nemo-view"
    }
  }
```

But that's confusing. So please stick to the convention.

#### Typical usage of Nemo-core constructor

A typical pattern would be to use `mocha` as a test runner, resolve `nemo` in the context of the mocha `before` function, and use
the mocha `done` function as the callback:

```javascript
var nemo;
describe('my nemo suite', function () {
  before(function (done) {
    NemoCore(config, function (err, resolvedNemo-core) {
        nemo = resolvedNemo-core;
        done(err)
    });
  });
  it('will launch browsers!', function (done) {
    nemo.driver.get('https://www.paypal.com');
    nemo.driver.quit().then(function () {
       done();
    });
  });
});

```

### Configure

Calling `Configure` will return a promise which resolves as a Confit object. This is the same method Nemo-core calls internally in the basic use case. You might want to call `Configure` if
you are interested in the resolved configuration object but not yet ready to start the webdriver. An example would be if you want to make further
changes to the configuration based on what gets resolved, prior to starting the webdriver.

`function Configure([nemoBaseDir, ][configOverride])`

`@argument nemoBaseDir {String}` (optional) - If provided, should be a filesystem path. There should be a `/config` directory beneath that.
`<nemoBaseDir>/config/config.json` should have your default configuration. `nemoBaseDir` can alternatively be set as an environment variable. If it is
not set, you need to pass your configuration as the `config` parameter (see below).

`@argument config {Object}` (optional) - Can be a full configuration (if `nemoBaseDir` not provided) or additional/override configuration to what's in your config files.

`@returns {Promise}` - Promise resolves as a confit object:


## Configuration Input

```javascript
{
  "driver": { /** properties used by Nemo-core to setup the driver instance **/ },
  "plugins": { /** plugins to initialize **/},
  "data": { /** arbitrary data to pass through to nemo instance **/ }
}
```

This configuration object is optional, as long as you've got `nemoData` set as an environment variable (see below).

### driver

Here are the `driver` properties recognized by Nemo-core. This is ALL of them. Please be aware that you really only need to supply "browser" to get things working initially.

#### browser (optional)

Browser you wish to automate. Make sure that your chosen webdriver has this browser option available. While this is "optional" you must choose a browser. Either use this property or the `builders.forBrowser` option (see below).
If both are specified, `builders.forBrowser` takes precedence.

#### local (optional, defaults to false)

Set local to true if you want Nemo-core to attempt to start a standalone binary on your system (like selenium-standalone-server) or use a local browser/driver like Chrome/chromedriver or PhantomJS.

#### server (optional)

Webdriver server URL you wish to use. This setting will be overridden if you are using `builders.usingServer`

#### serverProps (optional/conditional)

Additional server properties required of the 'targetServer'

You can also set args and jvmArgs to the selenium jar process as follows:

```javascript
"serverProps": {
  "port": 4444,
  "args": ["-firefoxProfileTemplate","/Users/medelman/Desktop/ffprofiles"],
  "jvmArgs": ["-someJvmArg", "someJvmArgValue"]
}
```

#### jar (optional/conditional)

Path to your webdriver server Jar file. Leave unset if you aren't using a local selenium-standalone Jar (or similar).

#### serverCaps (optional)

serverCaps would map to the capabilities here: http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Capabilities.html

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
Default is 'direct'. For more information refer : http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/proxy.html

```javascript
"proxyDetails" : {
    "method": "manual",
    "args": [{"http": "localhost:9001","ftp":"localhost:9001","https":"localhost:9001"}]
}
```

#### builders (optional)

This is a JSON interface to any of the Builder methods which take simple arguments and return the builder. See the Builder class here: http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Builder.html

Useful such functions are:
* forBrowser (can take the place of "browser", "local" and "jar" properties above)
* withCapabilities (can take the place of "serverCaps" above)

The nemo setup routine will prefer these "builder" properties over other abstracted properties above, if there is a conflict.

#### selenium.version (optional)

Since nemo requires a narrow range of versions of selenium-webdriver, you may have a need to upgrade selenium-webdriver (or downgrade) outside of the supported versions that nemo uses.
You can do that by using `selenium.version`. E.g.

```js
"driver": {
  "browser": "firefox",
  "selenium.version": "^2.53.1"
}
```

Nemo-core will upgrade its internal dependency to what is set in this property. The `npm install` will only run if the version specified is not already installed.

### plugins

Plugins are registered with JSON like the following (will vary based on your plugins)

```javascript
{
	"plugins": {
		"samplePlugin": {
			"module": "path:plugin/sample-plugin",
			"arguments": [...],
			"priority": 99
		},
		"view": {
			"module": "nemo-view"
		}
	}
}
```

Plugin.pluginName parameters:

* **module {String}** - Module must resolve to a require'able module, either via name (in the case it is in your dependency tree) or via path to the file or directory.

* **arguments {Array}** (optional, depending on plugin) - Your plugin will be called via its setup method with these arguments: `[configArg1, configArg2, ..., ]nemo, callback`.
Please note that the braces there indicate "optional". The arguments will be applied via `Function.apply`

* **priority {Number}** (optional, depending on plugin) - A `priority` value of < 100 will register this plugin BEFORE the selenium driver object is created.
This means that such a plugin can modify `config` properties prior to driver setup. Leaving `priority` unset will register the plugin after the driver object is created.

### data

Data will be arbitrary stuff that you might like to use in your tests. In a lot of the examples we set `data.baseUrl` but again, that's arbitrary and not required. You could
pass and use `data.cupcakes` if you want. Cupcakes are awesome.

## Shortstop handlers

Shortstop handlers are data processors that key off of directives in the JSON data. Ones that are enabled in nemo are:

### path

use path to prepend the `nemoBaseDir` (or `process.cwd()`) to a value. E.g. if `nemoBaseDir` is `.../myApp/tests` then
a config value of `'path:plugin/myPlugin'` will resolve to `.../myApp/tests/plugin/myPlugin`

### env

use env to reference environment variables. E.g. a config value of `'env:PATH'` will resolve to
`/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:...`

### argv

use argv to reference argv variables. E.g. a config value of `'argv:browser'` will resolve to `firefox` if you
set `--browser firefox` as an argv on the command line

### config

Use config to reference data in other parts of the JSON configuration. E.g. in the following config.json:

```javascript
{
  "driver": {
    ...
  },
  "plugins": {
    "myPlugin": {
      "module": "nemo-some-plugin",
      "arguments": ["config:data.someProp"]
    }
  },
  "data": {
    "someProp": "someVal"
  }
}
```

The value of `plugins.myPlugin.arguments[0]` will be `someVal`


### file

Please see [https://github.com/krakenjs/shortstop-handlers#handlersfilebasedir-options](https://github.com/krakenjs/shortstop-handlers#handlersfilebasedir-options)

### base64

Please see [https://github.com/krakenjs/shortstop-handlers#handlersbase64](https://github.com/krakenjs/shortstop-handlers#handlersbase64)

### require

Please see [https://github.com/krakenjs/shortstop-handlers#handlersrequirebasedir](https://github.com/krakenjs/shortstop-handlers#handlersrequirebasedir)

### exec

Please see [https://github.com/krakenjs/shortstop-handlers#handlersexecbasedir](https://github.com/krakenjs/shortstop-handlers#handlersexecbasedir)

### glob

Please see [https://github.com/krakenjs/shortstop-handlers#handlersglobbasediroptions](https://github.com/krakenjs/shortstop-handlers#handlersglobbasediroptions)

## Plugins

Authoring a plugin, or using an existing plugin, is a great way to increase the power and usefulness of your Nemo-core installation. A plugin should add
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

Then in your module where you use Nemo-core, you will be able to access the plugin functionality:

```javascript
var Nemo-core = require('nemo');
NemoCore({
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
}, function (err, nemo) {
  nemo.driver.get(nemo.data.baseUrl);
  nemo.myPlugin.myMethod1();
  nemo.myPlugin.myMethod2();
  nemo.driver.sleep(5000).
    then(function() {
      console.info('Nemo-core was successful!!');
      nemo.driver.quit();
    });
});
```




## Logging and debugging

Nemo-core uses the [debug](https://github.com/visionmedia/debug.git) module for console logging and error output. There are two classes of logging, `nemo:log` and `nemo:error`

If you want to see both classes of output, simply use the appropriate value of the DEBUG environment variable when you run nemo:

```bash
$ DEBUG=nemo:* <nemo command>
```

To see just one:

```bash
$ DEBUG=nemo:error <nemo command>
```


## Why Nemo-core?

Because we NEed MOre automation testing!

[![NPM](https://nodei.co/npm/nemo.png?downloads=true&stars=true)](https://nodei.co/npm/nemo/)

## Unit Tests

* Unit tests run by default using headless browser [PhantomJS](http://phantomjs.org/). To run unit tests out of box, You must have PhantomJS installed on your system and must be present in the path
    * Download PhantomJS from [here](http://phantomjs.org/download.html)
    * On OSX, you can optionally use `brew` to install PhantomJS like `brew install phantomjs`
    * PhantomJS installation detailed guide on Ubuntu can be found [here](https://gist.github.com/julionc/7476620)

* If you want to run unit tests on your local browser, like lets say Firefox/Chrome (make sure ChromeDriver is in current path), you need to update browser in unit test
configuration, for example the browser section under `test/config/config.json` like [here](https://github.com/paypal/nemo-core/blob/master/test/config/config.json#L19)

* How to run unit tests?
  * `npm test` will run unit tests as well as lint task
  * `grunt simplemocha` will just run unit tests
  * `grunt` - default grunt task will run linting as well as unit tests
  * To run directly using mocha assuming its globally installed on your system `mocha -t 60s`
  * Or a specific test,  `mocha --grep @allArgs@ -t 60s`
  * Or post `npm install` on nemo module, you can run `node_modules/.bin/mocha --grep @allArgs@ -t 60s`