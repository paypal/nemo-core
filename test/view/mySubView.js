/* globals require: true, module: true */
"use strict";

var assert = require('assert'),
	NemoView = require("nemo-view"),
	SubSubView = require("./mySubSubView"),
	subSubView;

function MySubView(config) {
	console.log("hi from MySubView");
	this.name = "mySubView";
	(new NemoView()).init(this, config);
	subSubView = new SubSubView(config);
}

MySubView.prototype = {
	tellLifeStory: function () {

	}

};

module.exports = MySubView;