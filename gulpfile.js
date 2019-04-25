/* eslint-disable require-jsdoc */

// Initialize modules
const {src, dest, watch, series, parallel} = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const imagemin = require('gulp-imagemin');
const jasmineBrowser = require('gulp-jasmine-browser');
const minify = require('gulp-terser');
const pngquant = require('imagemin-pngquant');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const {reload} = browserSync;

// File path variables
const source = {
  'htmlPath': './index.html',
  'imgPath': 'img/*',
  'jsPath': 'js/**/*.js',
  'scssPath': 'sass/**/*.scss',
  'unitTestFile': 'tests/spec/extraSpec.js'
};

const target = {
  'htmlPath': './dist',
  'imgPath': 'dist/img',
  'jsFile': 'all.js',
  'jsPath': 'dist/js',
  'scssPath': 'dist/css'
};

// Sass task
function styles() {
  return src(source.scssPath)
    .pipe(sass({'outputStyle': 'compressed'})
      .on('error', sass.logError))
    .pipe(autoprefixer({'browsers': ['last 2 versions']}))
    .pipe(dest(target.scssPath))
    .pipe(browserSync.stream());
}

// JS tasks
function lint() {
  return src(source.jsPath)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

function scripts() {
  return src(source.jsPath)
    .pipe(babel())
    .pipe(concat(target.jsFile))
    .pipe(dest(target.jsPath));
}

function scriptsDist() {
  return src(source.jsPath)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat(target.jsFile))
    .pipe(minify())
    .pipe(sourcemaps.write())
    .pipe(dest(target.jsPath));
}

// HTML task
function copyHtml() {
  return src(source.htmlPath)
    .pipe(dest(target.htmlPath));
}

// Image tasks
function copyImages() {
  return src(source.imgPath)
    .pipe(dest(target.imgPath));
}

function crunchImages() {
  return src(source.imgPath)
    .pipe(imagemin({
      'progressive': true,
      'use': [pngquant()]
    }))
    .pipe(dest(target.imgPath));
}

// Live editing tasks
function serve(done) {
  browserSync.init({'server': target.htmlPath});
  done();
}

// Unit testing tasks
function unitTest() {
  return src(source.unitTestFile)
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({'port': 3001}));
}

function unitTestChrome() {
  return src(source.unitTestFile)
    .pipe(jasmineBrowser.specRunner({'console': true}))
    .pipe(jasmineBrowser.headless({'driver': 'chrome'}));
}

// Watch tasks
function watchTask() {
  watch([source.htmlPath, source.imgPath, source.jsPath, source.scssPath],
    series(lint, parallel(copyHtml, copyImages, scripts, styles), reload));
}

// Default task
exports.default = series(
  lint,
  parallel(copyHtml, copyImages, scripts, styles),
  serve,
  watchTask
);

// Distribution task
exports.dist = series(
  lint,
  parallel(copyHtml, crunchImages, scriptsDist, styles)
);

// Unit testing
exports.unitTest = series(unitTest);
exports.unitTestChrome = series(unitTestChrome);
