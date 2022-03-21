const chrome = require('selenium-webdriver/chrome')
const { Builder } = require('selenium-webdriver')

function getConfig() {
  const width = 640
  const height = 480
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new chrome.Options().headless().windowSize({ width, height })
    )
}

module.exports = function () {
  return getConfig()
    .build()
};

module.exports.getConfig = getConfig;
