var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var mainBowerFiles = require('gulp-main-bower-files');
var path = require('path');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');

gulp.task('lint', function() {
    return gulp.src(['app/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('web-server', function() {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});

gulp.task('watch', function() {
    gulp.watch([
        './app/widgets/**/[^_]*.scss', // omit internal styles starting with "_"
        './assets/styles/**/*.scss',
        './vendor/**/*.scss'
    ], ['sass']);
});

gulp.task('server', [
    'watch',
    'web-server'
], function() {});

gulp.task('sass-vendor', function() {
    gulp.src('./vendor/styles.scss')
        .pipe(plumber())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(cleanCSS({
            compatibility: '*,-properties.merging'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./vendor'));
});

gulp.task('sass', [
    'sass-vendor'
], function() {});

gulp.task('vendor-fonts', function() {
    return gulp.src([
        'bower_components/bootstrap-sass/assets/fonts/*/**',
        'bower_components/roboto-fontface/fonts/*/Roboto-Regular.*'
    ]).pipe(gulp.dest('fonts'));
});

gulp.task('uglify-timeline', function() {
    return gulp.src('bower_components/d3-timeline/src/d3-timeline.js')
        .pipe(uglify())
        .pipe(gulp.dest('bower_components/d3-timeline/dist'));
});

gulp.task('vendor-js', ['uglify-timeline'], function() {
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
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/d3/d3.min.js',
        'bower_components/sprintf/dist/sprintf.min.js',
        'bower_components/angular-gridster/dist/angular-gridster.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-fullscreen/src/angular-fullscreen.js',
        'bower_components/sprintf/dist/angular-sprintf.min.js',
        'bower_components/angular-prompt/dist/angular-prompt.min.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.min.js',
        'bower_components/angularjs-slider/dist/rzslider.min.js',
        'bower_components/angular-clipboard/angular-clipboard.js',
        'bower_components/ng-knob/dist/ng-knob.min.js',
        'bower_components/inobounce/inobounce.min.js',
        'bower_components/oclazyload/dist/ocLazyLoad.min.js',
        'bower_components/angular-ui-clock/dist/angular-clock.min.js',
        'bower_components/angular-ui-select/dist/select.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/snapjs/snap.min.js',
        'bower_components/angular-snap/angular-snap.min.js',
        'bower_components/event-source-polyfill/eventsource.min.js',
        'bower_components/d3-timeline/dist/d3-timeline.js',
        'bower_components/aCKolor/dist/js/aCKolor.min.js',
        'node_modules/n3-charts/build/LineChart.min.js',
        'vendor/angular-web-colorpicker.js'
    ]).pipe(concat('vendor.js')).pipe(gulp.dest('vendor'));

});




gulp.task('codemirror-lib', function() {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/lib'));
});

gulp.task('codemirror-css', function() {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.css'
    ]).pipe(gulp.dest('vendor/cm/lib'));
});

gulp.task('codemirror-addon-fold', function() {
    return gulp.src([
        'bower_components/codemirror/addon/fold/xml-fold.js',
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/fold'));
});

gulp.task('codemirror-addon-mode', function() {
    return gulp.src([
        'bower_components/codemirror/addon/mode/overlay.js',
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/mode'));
});

gulp.task('codemirror-addon-edit', function() {
    return gulp.src([
        'bower_components/codemirror/addon/edit/matchbrackets.js',
        'bower_components/codemirror/addon/edit/matchtags.js',
        'bower_components/codemirror/addon/edit/closebrackets.js',
        'bower_components/codemirror/addon/edit/closetag.js',
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/edit'));
});

gulp.task('codemirror-mode-xml', function() {
    return gulp.src([
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/mode/xml'));
});

gulp.task('codemirror-mode-javascript', function() {
    return gulp.src([
        'bower_components/codemirror/mode/javascript/javascript.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/mode/javascript'));
});

gulp.task('codemirror-theme', function() {
    return gulp.src([
        'bower_components/codemirror/theme/rubyblue.css'
    ]).pipe(gulp.dest('vendor/cm/theme'));
});

gulp.task('codemirror', [
    'codemirror-lib',
    'codemirror-css',
    'codemirror-addon-fold',
    'codemirror-addon-mode',
    'codemirror-addon-edit',
    'codemirror-mode-xml',
    'codemirror-mode-javascript',
    'codemirror-theme'
], function() {});

gulp.task('vendor', [
    'vendor-js',
    'vendor-fonts'
], function() {});

gulp.task('default', ['vendor', 'codemirror'], function() {});