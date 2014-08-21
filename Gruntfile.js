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
				grep: '',
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
		},
		'automation': {
			'baseDir': 'test/functional',
			'filter': '*.js',
			'browser': 'firefox'
		},
		//for js functional testing
		'loopmocha': {
			'basedir': process.cwd() + '/' + 'test/functional',
			'src': ['<%=loopmocha.basedir%>/spec/*.js'],
			'options': {
				'reporter': grunt.option('reporter') || 'spec',
				'reportLocation': grunt.option('reportLocation') || '<%=loopmocha.basedir%>/report',
				'timeout': grunt.option('timeout') || 120000,
				'grep': grunt.option('grep') || 0,
				'debug': grunt.option('debug') || 0,
				'TARGET_BROWSER': nconf.get('TARGET_BROWSER') || 'firefox',
				'TARGET_SERVER': nconf.get('TARGET_SERVER') || 'localhost',
				'SELENIUM_JAR': nconf.get('SELENIUM_JAR') || '/usr/bin/selenium-server-standalone.jar',
				'SERVER_PROPS': '{"port": 4444}',
				'iterations': [
					{
						'description': 'chrome',
						'TARGET_BROWSER': 'chrome'
					} ,
					{
						'description': 'firefox',
						'TARGET_BROWSER': 'firefox'
					}
				]
			},
			'all': {
				'src': '<%=loopmocha.src%>'
			}
		}
	});

	// For this to work, you need to have run `npm install grunt-simple-mocha`
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-loop-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// Add a default task. This is optional, of course :)
	grunt.registerTask('default', ['simplemocha', 'jshint']);
	grunt.registerTask('automation', ['loopmocha:all']);
};