'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');

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

gulp.task('default', ['babel-server']);
