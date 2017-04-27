const async = require('async');
module.exports = {
  'setup': function (whoami, nemo, callback) {
    if (arguments.length === 2) {
      callback = nemo;
      nemo = whoami;
      whoami = 'sample';
    }
    if (whoami === 'crap plugin') {
      throw new Error('Sorry I wrote a crap plugin');
    }
    nemo[whoami] = {};
    nemo[whoami].isDriverSetup = !!nemo.driver.get;
    process.nextTick(function () {
      callback(null);
    });

  }
};