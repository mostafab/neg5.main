'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');


gulp.task('babel-server', () => {
  console.log(`Transpiling server at ${new Date()}`);
  const b = babel();
  b.on('error', (err) => {
    console.log(err.message);
  });
  gulp.src(['app/src/**/*.js'])
  .pipe(b)
  .pipe(gulp.dest('app/build'));
});

/**
 * @deprecated Don't use this. Use webpack.
 */
gulp.task('babel-client', () => {
  console.log(`Transpiling client at ${new Date()}`);
  const b = babel();
  b.on('error', (err) => {
    console.log(err.message);        
  });
  gulp.src(['app/public/javascript/es6/**/*.js'])
    .pipe(b)
    .pipe(rename({ suffix: '.es5' }))
    .pipe(gulp.dest('app/public/javascript/es5'));
});

/**
 * @deprecated Don't use this. Use webpack.
 */
gulp.task('minify-js', () => {
  gulp.src(['app/public/javascript/es5/**/*.js'])
    .pipe(concat('bundle.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/public/javascript'));
});

gulp.task('minify-css', () => {
  gulp.src('app/public/css/v2/*.css')
      .pipe(concat('bundle.css'))
      .pipe(cleanCss())
      .pipe(gulp.dest('app/public/css/min'));
});

gulp.task('watch', () => {
  gulp.watch(['app/src/**/*.js'], ['babel-server']);
  gulp.watch(['app/public/javascript/es6/**/*.js'], ['babel-client']);
  gulp.watch(['app/public/css/v2/*.css'], ['minify-css']);
});

gulp.task('default', ['babel-server', 'minify-css', 'watch']);
