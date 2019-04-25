/* eslint-disable capitalized-comments */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const {reload} = browserSync;
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const jasmineBrowser = require('gulp-jasmine-browser');
const babel = require('gulp-babel');

gulp.task('styles', () => gulp
  .src('sass/**/*.scss')
  .pipe(sass({
      'outputStyle': 'compressed'
    })
    .on('error', sass.logError))
  .pipe(
    autoprefixer({
      'browsers': ['last 2 versions']
    })
  )
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.stream()));

gulp.task('copy-html', () => gulp
  .src('./index.html')
  .pipe(gulp.dest('./dist')));

gulp.task('copy-images', () => gulp
  .src('img/*')
  .pipe(gulp.dest('dist/img')));

gulp.task('lint', () => gulp
  .src(['js/**/*.js'])
  // eslint() attaches the lint output to the eslint property
  // Of the file object so it can be used by other modules.
  .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
  .pipe(eslint.format())
  // To have the process exit with an error code (1) on
  // Lint error, return the stream and pipe to failOnError last.
  .pipe(eslint.failOnError()));

gulp.task('scripts', () => gulp
  .src(['js/**/*.js'])
  .pipe(babel())
  .pipe(concat('all.js'))
  .pipe(gulp.dest('dist/js'))
  );

gulp.task('scripts-dist', () => gulp
  .src(['js/**/*.js'])
  .pipe(babel())
  .pipe(concat('all.js'))
  .pipe(uglify('all.js'))
  .pipe(gulp.dest('dist/js'))
  );

gulp.task('jasmine', () => gulp
  .src('tests/spec/extraSpec.js')
  .pipe(jasmineBrowser.specRunner())
  .pipe(jasmineBrowser.server({
    'port': 3001
  })));

// Requires `puppeteer` be installed in the project
gulp.task('jasmine-chrome', function (done) {
  gulp
    .src('tests/spec/extraSpec.js')
    .pipe(jasmineBrowser.specRunner({
      'console': true
    }))
    .pipe(jasmineBrowser.headless({
      'driver': 'chrome'
    }));
  done();
});

gulp.task('default', () => {
  gulp.watch('sass/**/*.scss', gulp.parallel('styles'));
  gulp.watch('js/**/*.js', gulp.parallel('lint'));
  gulp.watch('/index.html', gulp.parallel('copy-html'));
  gulp.watch('img/*', gulp.parallel('copy-images'));

  browserSync.init({
    'server': './dist'
  });

  gulp.watch('*.html').on('change', reload);
});

gulp.task('dist', [
  'copy-html',
  'copy-images',
  'styles',
  'lint',
  'scripts-dist'
]);
