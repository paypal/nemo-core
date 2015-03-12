/* global require,process,module */
'use strict';
var nconf = require('nconf');

module.exports = function (grunt) {
	nconf.env()
		.argv();
	grunt.initConfig({
		simplemocha: {
			options: {
				globals: ['should'],
				timeout: 30000,
				ignoreLeaks: false,
				grep: grunt.option('grep') || '',
				ui: 'bdd',
				reporter: 'spec'
			},

			all: {
				src: ['test/*.js']
			}
		},
		jshint: {
			files: ['index.js', 'Gruntfile.js', 'setup/*.js'],
			options: {
				jshintrc: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask('default', ['simplemocha', 'jshint']);
};