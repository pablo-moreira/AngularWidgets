module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		concat : {
			js : {
				src: ['src/js/**/*.js'],
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
			},
			css : {
				src: ['src/css/**/*.css'],
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.css'
			},
		},
		uglify: {
			dist: {
				src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'			
			}
		},
		cssmin: {
			dist: {
				src: 'dist/<%= pkg.name %>-<%= pkg.version %>.css',
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.css'
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Task(s).
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};
