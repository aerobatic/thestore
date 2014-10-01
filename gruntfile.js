var fs = require('fs');

module.exports = function(grunt) {
    'use strict';
    //load npmtask
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsonmin');
    grunt.loadNpmTasks('grunt-contrib-concat-sourcemaps');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-aws');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-aerobatic');

    //configure task
    grunt.initConfig({

       srcjsFiles: ['src/js/**/*.js'],
       testjsFiles: ['tests/**/*.js'],
       srchtmlFiles: ['src/**/*.html'],
       srccssFiles: ['src/css/**/*.css'],

       concat: {
           thestore: {
               dest: 'build/js/thestore.min.js',
               src: '<%= srcjsFiles %>'
           },
           vendor: {
               dest: 'build/js/vendors.js',
               src: [
                'src/vendor/angular-translate/angular-translate.min.js',
                'src/vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
                'src/vendor/angular-aerobatic/angular-aerobatic.min.js'
              ]
           }
       },

       jsonmin: {
           data: {
               files: [ {expand: true, cwd: 'src/storeData', src: ['**/*.json'], dest: 'build/storeData/'} ]
           },
           i18n: {
               files: [ {expand: true, cwd: 'src/i18n', src: ['**/*.json'], dest: 'build/i18n/'} ]
           }
       },

       cssmin: {
           thestore: {
               files: {
                   'build/css/thestore.min.css': ['<%= srccssFiles %>']
               }
           }
       },

       imagemin: {
           images: {
               files: [
                   {
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'build/'
                   }
               ]
           }
       },

       copy: {
           favicon: {
               dest: 'build/favicon.ico',
               src: 'src/favicon.ico'
           },
           ghpages: {
               expand:true,
               cwd: 'build',
               dest: 'gh-pages/thestore/',
               src: ['**/*']
           }
       },

       jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['Gruntfile.js','<%= srcjsFiles %>'],
            tests:  ['<%= testjsFiles %>']
       },

       uglify: {
           options: {
               mangle: true,
               preserveComments: false,
               compress: true
           },
           js: {
               files: {'<%= concat.thestore.dest %>': ['<%= concat.thestore.dest %>']}
           }
       },

       clean: {
           build: ['build'],
           postbuild: ['<%= ngtemplates.storeApp.dest %>']
       },

       aerobatic: {
         options: {
           root: 'src'
         },
         deploy: {
           // Force new versions to take 100% of traffic
           cowboy: true,
           // These are the files that should be deployed to the cloud.
           src: ['src/index.html', 'build/**/*.*']
         },
         sim: {
           port: 3000,
           livereload: true
         }
       },

       aws: (grunt.file.exists('../aws.json')) ? grunt.file.readJSON('../aws.json') : null,
       s3: {
           options: {
               accessKeyId: '<%= aws.accessKeyId %>',
               secretAccessKey: '<%= aws.secretAccessKey %>',
               bucket: 'gostore'
           },
           build: {
               cwd: 'build/',
               src: '**'
           }
       },

        // The actual grunt server settings
        connect: {
            options: {
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    port: 9000,
                    open: true,
                    base: 'src'
                }
            },
            build: {
                options: {
                    livereload: true,
                    keepalive: true,
                    port: 9001,
                    open: true,
                    base: 'build'
                }
            }
        },

       watch: {
           js: {
              files: ['Gruntfile.js', '<%= srcjsFiles %>', '<%= testjsFiles %>'],
              tasks: ['lintjs']
           },
           templates: {
             files: ['views/**/*.html'],
             tasks: ['ngtemplates']
           },
           livereload: {
              options: {
                spawn: true,
                livereload: true
              },
              files: [
                '<%= srcjsFiles %>',
                '<%= srchtmlFiles %>',
                '<%= srccssFiles %>'
              ]
          }
       },

        ngtemplates:  {
            storeApp:        {
                cwd: 'src',
                src: 'views/**/*.html',
                dest: 'src/js/templates.js',
                options: {
                    htmlmin: {
                        removeComments: true,
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        removeOptionalTags: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        removeEmptyAttributes: true
                    }
                }
            }
        }
    });

    grunt.registerTask('log-build', function() {
        this.requires('ngtemplates');
        this.requires('clean:build');
        this.requires('concat');
        this.requires('jsonmin');
        this.requires('cssmin');
        this.requires('copy');
        this.requires('lintjs');
        this.requires('uglify');
        grunt.task.run('clean:postbuild');
        var message = 'Built on ' + new Date();
        fs.appendFileSync('build.log', message + '\n');
        grunt.log.writeln(message);
    });

    // makes jshint optional
    grunt.registerTask('lintjs', function() {
        if (grunt.file.exists('.jshintrc')) {
            grunt.task.run('jshint');
        }
        else {
            grunt.log.writeln('Warning: .jshintrc file not found. Javascript not linted!');
        }
    });

    grunt.registerTask('log-deployAWS', function() {
        var message = 'Deployed on ' + new Date();
        fs.appendFileSync('deployAWS.log', message + '\n');
        grunt.log.writeln(message);
    });

    // Instead of connect-serve, use the aerobatic:sim task
    // grunt.registerTask('serve', 'start a connect web server', function () {
    //     grunt.task.run([
    //         'connect:livereload',
    //         'watch'
    //     ]);
    // });

    grunt.registerTask('build', ['ngtemplates', 'clean:build', 'concat', 'jsonmin', 'cssmin', 'copy', 'lintjs', 'uglify', 'log-build']);
    grunt.registerTask('default', 'build');
    grunt.registerTask('sim', ['ngtemplates', 'aerobatic:sim:sync', 'watch']);
    grunt.registerTask('deploy', ['build', 'aerobatic:deploy']);

    grunt.registerTask('deployAWS', ['s3', 'log-deployAWS']);
};
