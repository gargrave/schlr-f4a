// FOUNDATION FOR APPS TEMPLATE GULPFILE
// -------------------------------------
// This file processes all of the assets in the "client" folder, combines them with the Foundation for Apps assets, and outputs the finished files in the "build" folder as a finished app.

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var $ = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var gulp = require('gulp');
var rimraf = require('rimraf');
var router = require('front-router');
var sequence = require('run-sequence');
var replace = require('gulp-replace');
var ts = require('gulp-typescript');

// Check for --production flag
var isProduction = !!(argv.production);

// 2. FILE PATHS
// - - - - - - - - - - - - - - -

var paths = {
  build: {
    jsApp: [
      './build/assets/js/**/*.js',
      '!./build/assets/libs/*.js'
    ]
  },
  dist: {
    root: './dist/'
  },
  assets: [
    './client/**/*.*',
    '!./client/templates/**/*.*',
    '!./client/assets/{scss,js}/**/*.*'
  ],
  // Sass will check these folders for files when you use @import.
  sass: [
    'client/assets/scss',
    'bower_components/foundation-apps/scss'
  ],
  // These files include Foundation for Apps and its dependencies
  foundationJS: [
    'bower_components/fastclick/lib/fastclick.js',
    'bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
    'bower_components/tether/tether.js',
    'bower_components/hammerjs/hammer.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/foundation-apps/js/vendor/**/*.js',
    'bower_components/foundation-apps/js/angular/**/*.js',
    '!bower_components/foundation-apps/js/angular/app.js'
  ],
  libsJS: [
    'bower_components/lodash/dist/lodash.min.js',
    'bower_components/angular-cookies/angular-cookies.min.js',
    'bower_components/angular-cache/dist/angular-cache.min.js',
    'bower_components/angular-messages/angular-messages.min.js'
  ],
  appTS: [
    './client/assets/js/**/*.ts'
  ],
  // These files are for your app's JavaScript
  appJS: [
    'client/assets/js/app.js'
  ]
};

// 3. TASKS
// - - - - - - - - - - - - - - -

/*==============================================
 = clean
 ==============================================*/
// Cleans the build directory
gulp.task('clean', function(cb) {
  rimraf('./build', cb);
});

/*=============================================
 = copy
 =============================================*/
// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function() {
  return gulp.src(paths.assets, {
      base: './client/'
    })
    .pipe(gulp.dest('./build'));
});

// Copies your app's page templates and generates URLs for them
gulp.task('copy:templates', ['replace-build'], function() {
  return gulp.src('./client/templates/**/*.html')
    .pipe(router({
      path: 'build/assets/libs/routes.js',
      root: 'client'
    }))
    .pipe(gulp.dest('./build/templates'));
});

// Compiles the Foundation for Apps directive partials into a single JavaScript file
gulp.task('copy:foundation', function(cb) {
  gulp.src('bower_components/foundation-apps/js/angular/components/**/*.html')
    .pipe($.ngHtml2js({
      prefix: 'components/',
      moduleName: 'foundation',
      declareModule: false
    }))
    .pipe($.uglify())
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('./build/assets/libs/'));

  // Iconic SVG icons
  gulp.src('./bower_components/foundation-apps/iconic/**/*')
    .pipe(gulp.dest('./build/assets/img/iconic/'));

  cb();
});

// copy required libs into 'build' folder
gulp.task('copy:libs', function() {
  return gulp.src(paths.libsJS)
    .pipe(gulp.dest('./build/assets/libs/'));
});

/*=============================================
 = sass
 =============================================*/
// Compiles Sass
gulp.task('sass', function() {
  var minifyCss = $.if(isProduction, $.minifyCss());

  return gulp.src('client/assets/scss/app.scss')
    .pipe($.sass({
      includePaths: paths.sass,
      outputStyle: (isProduction ? 'compressed' : 'nested'),
      errLogToConsole: true
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10']
    }))
    .pipe(minifyCss)
    .pipe(gulp.dest('./build/assets/css/'));
});

/*==============================================
 = typescript
 ==============================================*/
// compile all typescript source files
gulp.task('ts', function() {
  return gulp.src(paths.appTS)
    .pipe(ts({
      module: 'commonjs',
      target: 'es5',
      removeComments: true
    }))
    .pipe(gulp.dest('build/assets/js'));
});

/*=============================================
 = uglify
 =============================================*/
// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
// gulp.task('uglify', ['uglify:foundation', 'uglify:app']);

gulp.task('uglify:foundation', function(cb) {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function(e) {
      console.log(e);
    }));

  return gulp.src(paths.foundationJS)
    .pipe(uglify)
    .pipe($.concat('foundation.js'))
    .pipe(gulp.dest('./build/assets/libs/'));
});

// gulp.task('uglify:app', function() {
//   var uglify = $.if(isProduction, $.uglify()
//     .on('error', function(e) {
//       console.log(e);
//     }));
//
//   var asdf = [
//     'build/assets/js/app.js',
//     'build/assets/js/**/*.module.js',
//     'build/assets/js/**/*.ctrl.js',
//     'build/assets/js/**/*.svc.js',
//     'build/assets/js/**/*.filters.js',
//     'build/assets/js/entries/WeekContainer.js'
//   ];
//
//   return gulp.src(asdf)
//     .pipe(uglify)
//     .pipe($.concat('app.min.js'))
//     .pipe(gulp.dest(paths.dist.root));
// });

/*=============================================
 = replace
 =============================================*/
gulp.task('replace-build', function() {
  gulp.src(['client/index.html'])
    .pipe(replace(/<!-- PROD_SCRIPTS -->[\s\S]+<!-- END_PROD_SCRIPTS -->/g, ''))
    .pipe(replace(/<!-- PROD_STYLESHEETS -->[\s\S]+<!-- END_PROD_STYLESHEETS -->/g, ''))
    .pipe(gulp.dest('build/'));
});

/*==============================================
 = server
 ==============================================*/
// Starts a test server, which you can view at http://localhost:8079
gulp.task('server', function() {
  gulp.src('./build')
    .pipe($.webserver({
      port: 8079,
      host: 'localhost',
      fallback: 'build/index.html',
      livereload: false,
      open: false
    }));
});


/*=============================================
 = build tasks
 =============================================*/
// Builds your entire app once, without starting a server
gulp.task('build', function(cb) {
  // sequence('clean', ['copy', 'copy:foundation', 'sass', 'uglify'], 'copy:templates', cb);
  sequence('clean', [
      'copy', 'copy:foundation', 'copy:libs',
      'replace-build', 'uglify:foundation'
    ],
    'copy:templates', 'ts', 'sass', cb);
});

/*=============================================
 = default/watch
 =============================================*/
// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', function() {
  // Watch Sass
  gulp.watch('./client/assets/scss/**/*', ['sass']);
  // Watch JavaScript
  // gulp.watch(['./client/assets/js/**/*', './js/**/*'], ['uglify:app']);
  // Watch static files
  gulp.watch([
      './client/**/*.*',
      '!./client/index.html',
      '!./client/templates/**/*.*',
      '!./client/assets/{scss,js}/**/*.*'
    ],
    ['copy']);
  // Watch app templates
  gulp.watch(['./client/templates/**/*.html'], ['copy:templates']);
  // watch index.html
  gulp.watch(['./client/index.html'], ['replace-build']);
});
