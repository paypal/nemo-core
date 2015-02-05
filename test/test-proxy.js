"use strict";

var should = require('chai').should(),
    Nemo = require('../index');

describe("@launch browser with Proxy@", function () {
    var nemo;
    before(function (done) {

        process.env.nemoData = JSON.stringify({
            "targetBrowser": "phantomjs",
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
            nemo.driver.getCapabilities().then(function(name){
                
                var proxy = name.caps_.proxy;
                if(proxy.proxyType=='manual' && proxy.ftpProxy=='host:1234' && proxy.httpProxy=='host:1234' && proxy.sslProxy=='host:1234'){
                    done();
                }else{
                    done(new Error('proxy details not set'));
                }
            });
            
        });
    });
});
