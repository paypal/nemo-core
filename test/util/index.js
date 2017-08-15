'use strict';
module.exports.waitForJSReady = function waitForJSReady(nemo) {
  return nemo.driver.wait(() => //console.log('execute waitForJSReady');
      nemo.driver.executeScript(() => {
        if (window.$) {
          return $('body').data('loaded');
        }
        return false;
      })
    , 5000, 'JavaScript didn\'t load');
}

module.exports.doneSuccess = function (done) {
  return () => {
    done();
  };
};

module.exports.doneError = function (done) {
  return err => {
    done(err);
  };
};