var gulp = require('gulp');
var jade = require('gulp-jade');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var transform = require('vinyl-transform');
var stylus = require('gulp-stylus');
var nib = require('nib');


// templates
gulp.task('templates', function() {
  gulp.src('templates/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('public/'));
});

gulp.task('templates-tests', function() {
  gulp.src('tests/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('public/tests/'));
});


// javascript

(function() {
  var jsFiles = [
    './javascript/app.js',
    './javascript/workers/recorder.js'
  ];
  var jsTestFiles = [
    './tests/tests.js'
  ];

  var browserified = function() {
    return transform(function(filename) {
      var b = browserify(filename);
      return b.bundle();
    });
  };

  gulp.task('javascript', function() {

    return gulp.src(jsFiles)
      .pipe(browserified())
      .pipe(gulp.dest('./public/js'));
  });

  gulp.task('javascript-develop', function() {

    return gulp.src(jsFiles)
      .pipe(browserified())
      .pipe(gulp.dest('./public/js'));

  });

  gulp.task('javascript-tests', function() {

    return gulp.src(jsTestFiles)
      .pipe(browserified())
      .pipe(gulp.dest('./public/js'));
  });
})();

// styles
gulp.task('styles', function() {
  gulp.src('./styles/styles.styl')
    .pipe(stylus({
      use: nib()
    }))
    .pipe(gulp.dest('./public/css'));
});


gulp.task('tests', function() {

});

// build for production
gulp.task('default', ['templates', 'javascript', 'styles']);

// watch the files
gulp.task('watch', function() {
  gulp.watch('javascript/**/*.js', ['javascript-develop', 'javascript-tests']);
  gulp.watch('styles/*.styl', ['styles']);
  gulp.watch('templates/*.jade', ['templates']);
  gulp.watch('tests/**', ['javascript-tests', 'templates-tests']);
});
