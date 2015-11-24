module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		jshint: {
			files: [
				'GruntFile.js',
				'src/js/**/*.js',
			]
		},
		concat : {
			js : {
				src: ['src/js/core/core.js', 'src/js/**/*.js', '!src/js/locale/*.js', 'src/js/locale/angular-widgets_en.js'],
				dest: 'dist/<%= pkg.name %>.js'
			},
			css : {
				src: ['src/css/**/*.css'],
				dest: 'dist/<%= pkg.name %>.css'
			}
		},
		uglify: {
			dist: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'			
			},
			locale: {
				files: [{
					expand: true,
					src: '**/*.js',
					dest: 'dist/locale',
					cwd: 'src/js/locale'
				}]
			}
		},
		cssmin: {
			dist: {
				src: 'dist/<%= pkg.name %>.css',
				dest: 'dist/<%= pkg.name %>.min.css'
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);

};
