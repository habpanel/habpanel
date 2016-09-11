var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var mainBowerFiles = require('gulp-main-bower-files');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');

gulp.task('lint', function () {
    return gulp.src(['app/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('vendor-fonts', function() {
    return gulp.src([
        'bower_components/bootstrap/dist/fonts/*'
    ]).pipe(gulp.dest('fonts'));
});

gulp.task('vendor-css', function() {
    return gulp.src([
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/angular-gridster/dist/angular-gridster.min.css',
        'bower_components/angularjs-slider/dist/rzslider.min.css',
        'node_modules/n3-charts/build/LineChart.min.css'
    ]).pipe(concat('vendor.css')).pipe(gulp.dest('vendor'));
});

gulp.task('vendor-js', function() {
    // var filterJS = gulpFilter('**/*.js', { restore: true });
    // return gulp.src('./bower.json')
    //            .pipe(mainBowerFiles({debugging: true}))
    //            .pipe(filterJS)
    //            .pipe(concat('vendor.js'))
    //            .pipe(uglify())
    //            .pipe(filterJS.restore)
    //            .pipe(gulp.dest('lib'));

    return gulp.src([
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.min.js',
        'bower_components/d3/d3.min.js',
        'bower_components/sprintf/dist/sprintf.min.js',
        'bower_components/angular-gridster/dist/angular-gridster.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-fullscreen/src/angular-fullscreen.js',
        'bower_components/sprintf/dist/angular-sprintf.min.js',
        'bower_components/angular-prompt/dist/angular-prompt.min.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
        'bower_components/angularjs-slider/dist/rzslider.min.js',
        'bower_components/atmosphere.js/atmosphere.min.js',
        'bower_components/angular-atmosphere-service/service/angular-atmosphere-service.js',
        'bower_components/ng-knob/dist/ng-knob.min.js',
        'bower_components/inobounce/inobounce.min.js',
        'node_modules/n3-charts/build/LineChart.min.js',
        'vendor/angular-web-colorpicker.js'
    ]).pipe(concat('vendor.js')).pipe(gulp.dest('vendor'));

});



gulp.task('default', ['vendor-js', 'vendor-css', 'vendor-fonts'], function () {

});
