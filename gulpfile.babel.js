'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('babel-server', () => {
    
    console.log(`Transpiling server at ${new Date()}`);
    
    const b = babel();
    
    b.on('error', (err) => {
        console.log(err.message);        
    });
    
    gulp.src(['src/**/*.js', '!src/public/**/*'])
    .pipe(b)
    .pipe(gulp.dest('src/build'));
    
});

gulp.task('babel-client', () => {
    
    console.log(`Transpiling client at ${new Date()}`);
    
    const b = babel();
    
    b.on('error', (err) => {
        console.log(err.message);        
    });
    
    gulp.src(['src/public/es6/**/*.js'])
    .pipe(b)
    .pipe(gulp.dest('src/public/js'));
})

gulp.task('watch', () => {
   gulp.watch(['src/**/*.js', '!src/public/**/*'], ['babel-server']);
   gulp.watch(['src/public/es6/**/*.js'], ['babel-client']);
});

gulp.task('default', ['watch']);