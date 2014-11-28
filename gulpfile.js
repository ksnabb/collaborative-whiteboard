var gulp = require('gulp');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');


// templates
gulp.task('templates', function() {
  gulp.src('templates/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('public/'));
});

// javascript
(function() {
  var jsFiles = [
    './javascript/app.js'
  ];

  gulp.task('javascript', function() {

    return gulp.src(jsFiles)
      .pipe(uglify())
      .pipe(gulp.dest('./public'));
  });

  gulp.task('javascript-develop', function() {

    return gulp.src(jsFiles)
      .pipe(gulp.dest('./public'));

  });

})();

// styles
gulp.task('styles', function() {
  gulp.src('./styles/styles.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./public'));
});


// build for production
gulp.task('default', ['templates', 'javascript', 'styles']);

// watch the files and build for development
gulp.task('watch', function() {
  gulp.watch('javascript/*.js', ['javascript-develop']);
  gulp.watch('styles/*.styl', ['styles']);
  gulp.watch('templates/*.jade', ['templates']);
});
