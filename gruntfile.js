module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({

    config: {
      title: 'Schlr',
      date: function() {
        var d = new Date();
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
      }
    },
    paths: {
      build: {
        root: 'build',
        img: 'build/assets/img/',
        js: 'build/assets/js/',
        libs: 'build/assets/libs/',
        css: 'build/assets/css/',
        templates: 'build/templates/'
      },
      dist: {
        root: 'dist',
        img: 'dist/assets/img/',
        css: 'dist/assets/css/',
        templates: 'dist/templates/'
      }
    },

    /*==============================================
     = cssmin
     ==============================================*/
    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= paths.build.css %>',
          src: ['*.css'],
          dest: '<%= paths.dist.root %>',
          ext: '.min.css'
        }]
      }
    },

    /*==============================================
     = clean
     ==============================================*/
    clean: {
      main: ['<%= paths.dist.root %>/*']
    },

    /*=============================================
     = uglify
     =============================================*/
    uglify: {
      app: {
        options: {
          mangle: false,
          screwIE8: true,
          banner: '/* <%= config.title %> | built on <%= config.date() %> */\n'
        },
        files: [{
          '<%= paths.dist.root %>/app.min.js': [
            '<%= paths.build.js %>app.js',
            '<%= paths.build.js %>**/*.module.js',
            '<%= paths.build.js %>**/*.filters.js',
            '<%= paths.build.js %>**/*.ctrl.js',
            '<%= paths.build.js %>**/*.svc.js',
            '<%= paths.build.js %>**/*.dir.js',
            '<%= paths.build.js %>**/*.class.js'
          ]
        }]
      },
      f4a: {
        options: {
          mangle: false,
          screwIE8: true
        },
        files: [{
          '<%= paths.dist.root %>/f4a.min.js': [
            '<%= paths.build.libs %>foundation.js',
            '<%= paths.build.libs %>templates.js',
            '<%= paths.build.libs %>routes.js'
          ]
        }]
      }
    },

    /*=============================================
     = concat
     =============================================*/
    concat: {
      options: {
        separator: ';\n',
        banner: '/* \n' +
        'angular-cache.min.js\n' +
        'angular-cookies.min.js\n' +
        'angular-messages.min.js\n' +
        'lodash.min.js\n' +
        'built on <%= config.date() %> \n*/\n'
      },
      dist: {
        src: [
          '<%= paths.build.libs %>angular-cache.min.js',
          '<%= paths.build.libs %>angular-cookies.min.js',
          '<%= paths.build.libs %>angular-messages.min.js',
          '<%= paths.build.libs %>lodash.min.js'
        ],
        dest: '<%= paths.dist.root %>/libs.min.js'
      }
    },


    /*=============================================
     = copy
     =============================================*/
    copy: {
      libs: {
        files: [{
          expand: true,
          flatten: false,
          cwd: '<%= paths.build.templates %>',
          src: [
            '**/*.html'
          ],
          dest: '<%= paths.dist.templates %>'
        }]
      },
      img: {
        files: [{
          expand: true,
          flatten: false,
          cwd: '<%= paths.build.img %>',
          src: [
            '**/*'
          ],
          dest: '<%= paths.dist.img %>'
        }]
      }
    },

    /*=============================================
     = replace
     =============================================*/
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /<!-- DEV_SCRIPTS -->[\s\S]+<!-- END_DEV_SCRIPTS -->/,
              replace: ''
            },
            {
              match: /<!-- DEV_STYLESHEETS -->[\s\S]+<!-- END_DEV_STYLESHEETS -->/,
              replace: ''
            }
          ]
        },
        files: [
          {
            src: 'client/index.html',
            dest: '<%= paths.dist.root %>/index.html'
          }
        ]
      }
    }
  });

  grunt.registerTask('dist', [
    'clean', 'replace:dist', 'copy', 'cssmin', 'uglify', 'concat'
  ]);
};
