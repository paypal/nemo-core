const chrome = require('selenium-webdriver/chrome')
const { Builder } = require('selenium-webdriver')
module.exports = function () {
  const width = 640
  const height = 480
  let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new chrome.Options().headless().windowSize({ width, height })
    )
    .build()
  return driver;
}
