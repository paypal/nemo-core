var async = require("async");
module.exports = {
  "setup": function (whoami, nemo, callback) {
    console.log('args to sample plugin', whoami.constructor, (nemo && nemo.constructor), (callback && callback.constructor));
    if (arguments.length === 2) {
      callback = nemo;
      nemo = whoami;
      whoami = 'sample';
    }
    if (whoami === 'crap plugin') {
      throw new Error('Sorry I wrote a crap plugin');
    }
    nemo[whoami] = {};
    nemo[whoami].isDriverSetup = (!!nemo.driver.get);
    process.nextTick(function () {
      console.log('callback', callback.constructor);
      callback(null);
    });

  }
};