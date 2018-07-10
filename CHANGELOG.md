# nemo-core CHANGELOG

## v1.1.0

- feature: allow passed in driver function
  - helpful when custom driver desired, for which current internal convenience methods are not suitable
  - allows use of latest constructors in selenium-webdriver

## nemo-core@1.0.0

- renaming nemo to nemo-core

## v3.0.3

- upgrading all deps and devDeps

## v3.0.2

- upgrade confit to v2.3.0, removes insecure "uglify" module
- add package-lock.json

## v3.0.1

- upgrade "debug" dependency to resolve DoS vuln

## v3.0.0

- alpha has been out and in use long enough. We don't expect further breaking API changes

## v3.0.0-alpha

- Add support for selenium-webdriver@^3.0.0
- refactor index.js into several lib/ modules

## v2.3.1

- Fix: [#115](https://github.com/paypal/nemo/issues/115)
- %j placeholder for debug module doesn't print Error objects. %s should be used instead for Strings and Error objects.
%j is appropriate where we expect JSON objects and want logger to convert JSON.stringify() for us
- Enhanced error message when plugin is not found
- Changed default local unit tests to run on PhantomJS only
- Added section to elaborate on how to run unit tests

## v2.3.0

Selenium web driver was outdated and had a node security advisory. Bumped other outdated modules;

- async@~0.2.8 -> async@^1.5.2
- lodash@^2.4.0 -> lodash@^4.12.0
- selenium-webdriver@~2.48.0 -> selenium-webdriver@^2.53.2
- yargs@^3.6.0 -> yargs@^4.7.1
- chai@~1.6.0 -> chai@^3.5.0
- grunt@~0.4.1 -> grunt@^1.0.1
- grunt-contrib-jshint@~0.7.1 -> grunt-contrib-jshint@^1.0.0

## v2.2.0

* add `selenium.version` feature. Please see: https://github.com/paypal/nemo/pull/107

## v2.1.1

* add resolved nemo as the second argument to the constructor's callback. See: https://github.com/paypal/nemo/pull/114

## v2.1.0 [UNPUBLISHED]

* add ability to install custom selenium-webdriver version. Please see #98
* unfortunately the addition of this feature caused some unintended consequences via the `npmi` module. Please see #102

## v2.0.0

* lock to ES6 feature compatible version of selenium-webdriver (not guaranteed to work with node@v0.12 and earlier)
