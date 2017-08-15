'use strict';

module.exports = {
  "setup"(nemo, callback) {
    nemo.cookie = {};
    nemo.cookie.delete = name => nemo.driver.manage().deleteCookie(name);
    nemo.cookie.deleteAll = () => nemo.driver.manage().deleteAllCookies();
    nemo.cookie.set = (name, value, path, domain, isSecure, expiry) => nemo.driver.manage().addCookie(name, value, path, domain, isSecure, expiry);
    nemo.cookie.get = name => nemo.driver.manage().getCookie(name);
    nemo.cookie.getAll = () => nemo.driver.manage().getCookies();
    nemo.cookie.showAll = () => nemo.cookie.getAll().then(cookies => {
      console.log('cookies', cookies);
      console.log('=======================');
    });
    callback(null);

  }
};