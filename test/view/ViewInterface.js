/* global console: true, require: true, module: true */
'use strict';
/*
 a view should:
 implement an interface with the following functionality
 take nemo config as constructor argument
 load its locator file (../locator/viewName)
 find (all locators: e.g. findSubmitButton)
 isVisible (all locators: e.g. isSubmitButtonVisible)
 isPresent (all locators: e.g. isSubmitButtonPresent)
 instantiate any subviews
 */

function ViewInterface() {
	//what here?
}
ViewInterface.prototype.init = function (context, nemo) {

	var drivex = nemo.drivex;
	var locator = require(nemo.autoBaseDir + "/locator/" + context.name);
	nemo.locator[context.name] = locator;
	Object.keys(locator).forEach(function (loc) {
		var _loc = nemo.locatex(context.name + "." + loc);
		//console.log("loc.locator", _loc.locator);
		context[ loc + "Present"] = function () {
			return isPresent(_loc);
		};
		context[loc] = function () {
			return find(_loc);
		};
		context[loc + "Wait"] = function () {
			return wait(_loc);
		};
	});

	//private methods
	var isPresent = function (locator) {
		return drivex.present(locator);
	};
	var find = function (locator) {
		return drivex.find(locator);
	};
	var wait = function(locator) {
		return drivex.waitForElement(locator, nemo.waitTimeout || 5000);
	};
};

module.exports = ViewInterface;