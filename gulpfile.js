//
// system-level requires
//

var exec = require('child_process').exec;
var path = require('path');

//
// gulp-specific tools
//

var gulp = require('gulp');
var concat = require('gulp-concat');
var vsource = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

//
// testing/packaging
//

var browserify = require('browserify');
var pkg = require('./package.json');

//
// config for the web server used to serve examples
//

var SERVERPORT = 8080;
var SOURCEGLOB = './src/**/*.js';

//
// BUILDFILExxx is the file name,
// BUILDPATHxxx is the full path: <BUILDDIR>/<BUILDFILExxx>
//

var BUILDDIR = 'scripts';
var BUILDFILENAME = 'r3test';
var MODULENAME = 'r3test';

var BUILDFILEDEV = BUILDFILENAME + '.js';
var BUILDPATHDEV = path.join(BUILDDIR, BUILDFILEDEV);

var BUILDFILEMIN = BUILDFILENAME + '.min.js';
var BUILDPATHMIN = path.join(BUILDDIR, BUILDFILEMIN);

function errorHandler(err) {
  gutil.log(err);
  this.emit('end'); // so that gulp knows the task is done
}

gulp.task('help', function() {
  console.log('Possible tasks:');
  console.log('"default" - compile ' + pkg.name + ' into ' + BUILDPATHDEV);
  console.log('"watch" - watch ' + pkg.name + ' source files and rebuild');
  console.log('"test" - run tests in test directory');
  console.log('"livereload" - compile and launch web server/reload server');
});

gulp.task('lint', function() {
  return gulp.src([SOURCEGLOB])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browserify',['lint'], function() {
  var bundler = browserify();
  bundler.add('./src/r3test.js',{expose:MODULENAME});

  return bundler.bundle().on('error', errorHandler)
    .pipe(vsource('r3test.js'))
    .pipe(gulp.dest(BUILDDIR));
});


gulp.task('watch', ['browserify'], function() {
  gulp.watch(SOURCEGLOB, ['browserify']);
});

gulp.task('livereload', ['lint','browserify'], function() {
  var nodestatic = require('node-static');
  var fileserver = new nodestatic.Server('.');
  require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      fileserver.serve(request,response);
    }).resume();
  }).listen(SERVERPORT);

  var livereloadserver = livereload();

  gulp.watch(SOURCEGLOB, ['browserify']);
  gulp.watch(['scripts/*.js','index.html'], function(file) {
    livereloadserver.changed(file.path);
  });
});

gulp.task('default', ['lint','browserify']);
