'use strict';

module.exports.envToJson = function (prop) {
  var returnJSON = {};
  var originalValue = process.env[prop];
  if (originalValue === undefined) {
    return {
      'json': {},
      'reset': function () {
      }
    };
  }
  try {
    var grabJSON = JSON.parse(process.env[prop]);
    returnJSON[prop] = grabJSON;
    delete process.env[prop];
  } catch (err) {
    //noop
  }
  return {
    'json': returnJSON,
    'reset': function () {
      process.env[prop] = originalValue;
    }
  };
};