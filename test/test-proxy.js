"use strict";

var should = require('chai').should(),
    Nemo = require('../index');

describe("@launch browser with Proxy@", function () {
    var nemo;
    before(function (done) {

        process.env.nemoData = JSON.stringify({
            "targetBrowser": "firefox",
            "targetBaseUrl": "https://www.paypal.com",
            "proxyDetails" : {
                method: "manual",
                args: [{"http": "host:1234","ftp":"host:1234","https":"host:1234"}]
            }
        });
        done();
    });
    after(function (done) {
        nemo.driver.quit().then(function () {
            setTimeout(function() {done();}, 10);
        });
    });
    it("should load problem loading page error", function (done) {
        (new Nemo()).setup({}).then(function (_nemo) {

            nemo = _nemo;
            console.log(nemo.props.targetBaseUrl);
            nemo.driver.get(nemo.props.targetBaseUrl).then(function () {
                nemo.driver.getTitle().then(function(title){
                    console.log(title);
                    title.should.equals('Problem loading page');
                    done();
                });
            }, function (err) {
                done(err);
            });
        });
    });
});
