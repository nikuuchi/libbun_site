var gulp = require('gulp');
var gutil = require('gulp-util');
var gtypescript = require('gulp-tsc');
var gjade = require('gulp-jade');

gulp.task('default', function(){
    gulp.src(['ts/*'])
        .pipe(gtypescript())
        .pipe(gulp.dest("js/"));
    gulp.src(['jade/index.jade', 'jade/editor.jade'])
        .pipe(gjade())
        .pipe(gulp.dest("."));
});
