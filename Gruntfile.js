module.exports = function (grunt) {
	grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
        transport : {
        	options: {
                idleading: '/dist/',
      			alias: '<%= pkg.spm.alias %>',
      			debug: false
        	},
        	app:{
        		files:[{
        			cwd: 'js/',
        			src: '**/*',
        			dest: '.build'
        		}]
        	}
	    },
	    concat : {
            options : {
                include : 'all'
            },
            app: {
            	files: [
            		{
            			expand: true,
            			cwd: '.build/',
            			src: ['pixelegos.js'],
            			dest: 'dist/',
            			ext: '.js'
            		}
            	]
            }
        },
         uglify : {
            app : {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**/*.js', '!**/*-debug.js'],
                        dest: 'dist/',
                        ext: '.js'
                    }
                ]
            }
        },
        normalconcat: {
            app: {
                src: ['engine.js', 'dist/pixelegos.js'],
                dest: 'dist/pixelegos.js'
            }
        },
        clean:{
        	app:['.build', 'dist']
        }
    })

     grunt.loadNpmTasks('grunt-cmd-transport')
     grunt.loadNpmTasks('grunt-contrib-concat')
     grunt.renameTask('concat', 'normalconcat')
     grunt.loadNpmTasks('grunt-cmd-concat')
     grunt.loadNpmTasks('grunt-contrib-uglify')
     grunt.loadNpmTasks('grunt-contrib-clean')

     grunt.registerTask('build', ['clean', 'transport:app', 'concat:app', 'normalconcat:app'])
     grunt.registerTask('default', ['build'])
}
