
module.exports.waitForJSReady = function waitForJSReady(nemo) {
  return nemo.driver.wait(function() {
      //console.log('execute waitForJSReady');
      return nemo.driver.executeScript(function() {
        if (window.$) {
          return $('body').data('loaded');
        }
        return false;
      });
    }
    , 5000, 'JavaScript didn\'t load');
};

module.exports.doneSuccess = function (done) {
  return function () {
    done();
  };
};

module.exports.doneError = function (done) {
  return function (err) {
    done(err);
  };
};