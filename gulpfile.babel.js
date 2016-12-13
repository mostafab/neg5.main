'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');

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

gulp.task('babel-client', () => {
    
    console.log(`Transpiling client at ${new Date()}`);
    
    const b = babel();
    
    b.on('error', (err) => {
        console.log(err.message);        
    });
    
    gulp.src(['app/public/es6/**/*.js'])
    .pipe(b)
    .pipe(gulp.dest('app/public/js/ng'));
})

gulp.task('minify', () => {
    gulp.src(['app/public/js/ng/**/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./app/public/js/min'))
})

gulp.task('watch', () => {
   gulp.watch(['app/src/**/*.js'], ['babel-server']);
   gulp.watch(['app/public/es6/**/*.js'], ['babel-client']);
   gulp.watch(['app/public/js/ng/**/*.js'], ['minify']);
});

gulp.task('default', ['watch']);