var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  angularjs: ['./js/**/*.js']
};

gulp.task('sass', function() {
  gulp.src(paths.sass)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./css/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.angularjs, ['build']);
});

gulp.task('build', function() {
  if(process.env.ENV === 'dev' || process.env.ENV === 'prod'){
    var paths = [
      './js/partialApp.js',
      './js/properties/'+process.env.ENV+'.js',
      './js/controllers/*.js',
      './js/directives/*.js',
      './js/interceptors/*.js',
      './js/services/*.js'
    ];
    return gulp.src(paths)
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./js/'));
  }
});
