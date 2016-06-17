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

gulp.task('babel-client', () => {
    
    console.log(`Transpiling client at ${new Date()}`);
    
    const b = babel();
    
    b.on('error', (err) => {
        console.log(err.message);        
    });
    
    gulp.src(['app/public/es6/**/*.js'])
    .pipe(b)
    .pipe(gulp.dest('app/public/js'));
})

gulp.task('watch', () => {
   gulp.watch(['app/src/**/*.js'], ['babel-server']);
   gulp.watch(['public/es6/**/*.js'], ['babel-client']);
});

gulp.task('default', ['watch']);