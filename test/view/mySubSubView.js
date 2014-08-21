/* globals require: true, module: true */
"use strict";

var assert = require('assert'),
	NemoView = require("nemo-view");

function MySubSubView(config) {
	this.name = "mySubSubView";
	(new NemoView()).init(this, config);
}

MySubSubView.prototype = {
	tellLifeStory: function () {

	}

};

module.exports = MySubSubView;