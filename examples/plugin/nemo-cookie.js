module.exports = {
  'setup': function (nemo, callback) {
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
    nemo.cookie.showAll = function () {
      return nemo.cookie.getAll().then(function (cookies) {
        console.log('cookies', cookies);
        console.log('=======================');
      });
    };
    callback(null);

  }
};