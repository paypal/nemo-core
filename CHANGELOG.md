# nemo CHANGELOG

## v2.2.0

* add `selenium.version` feature. Please see: https://github.com/paypal/nemo/pull/107

## v2.1.1 

* add resolved nemo as the second argument to the constructor's callback. See: https://github.com/paypal/nemo/pull/114

## v2.1.0 [UNPUBLISHED]

* add ability to install custom selenium-webdriver version. Please see #98 
* unfortunately the addition of this feature caused some unintended consequences via the `npmi` module. Please see #102

## v2.0.0

* lock to ES6 feature compatible version of selenium-webdriver (not guaranteed to work with node@v0.12 and earlier)