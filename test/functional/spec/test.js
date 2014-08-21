/*global describe:true, it:true, before:true, after:true */
"use strict";

var assert = require('assert'),
    nemo = require(process.cwd()+'/index'),
    nconfig = {
		"plugins": {
			"samplePlugin": {
				"module": "./test/plugin/sample-plugin"
			}
		}
	},
    setup;

describe('Nemo setup', function() {

    before(function(done) {
        (new nemo(nconfig)).setup({
			"samplePlugin": {
				"sampleoptions": {
					"option1": "value1",
					"option2": "value2"
				}
			}
		}).
        then(function(result) {
            setup = result;
            done();
        })
    });

    after(function(done) {
        setup.driver.quit().then(function() {
            done();
        });
    });
    it('should complete setup and load the URL', function(done) {
        var driver = setup.driver;
            driver.get("https://www.paypal.com").
            then(function() {
                done();
            }, function(err) {
                done(err);
            });

    });

});