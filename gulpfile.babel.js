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
  return gulp.src(['app/src/**/*.js'])
    .pipe(b)
    .pipe(gulp.dest('app/build'));
});

gulp.task('default', gulp.series('babel-server'));
