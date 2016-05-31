'use strict';
import webpackStream from 'webpack-stream';
import gulp from 'gulp';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import del from 'del';
import jade from 'gulp-jade';
import browserSync from 'browser-sync'
import named from 'vinyl-named'
import plumber from 'gulp-plumber';
import notify from 'gulp-notify'

const webpackConfig = require('./webpack.config');

const bsServer = browserSync.create();

const plumberConfig = {
  errHandler: notify.onError(err=>({title: 'error', message: err.message}))
};

const paths = {
  styles: {
    src: ['src/styles.scss'],
    watch: ['src/**/*.scss'],
    dest: 'dist/assets/'
  },
  assets: {
    src: ['src/assets/**'],
    watch: ['src/assets/**'],
    dest: 'dist/assets/'
  },
  scripts: {
    src: ['src/index.js'],
    watch: ['src/**/*.js'],
    dest: 'dist/assets/'
  },
  serve: {
    dest: 'dist'
  },
  templates: {
    src: ['src/markup/*.jade'],
    watch: ['src/**/*.jade'],
    dest: 'dist/'
  }
};


const clean = () => del(['dist']);
export {clean};

export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(bsServer.stream())
}

export function templates() {
  const YOUR_LOCALS = {};

  return gulp.src(paths.templates.src)
    .pipe(jade({
      locals: YOUR_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest(paths.templates.dest))
    .pipe(bsServer.stream())
}

export function assets() {
  return gulp.src(paths.assets.src)
    .pipe(gulp.dest(paths.assets.dest))
    .pipe(bsServer.stream())
}

export function scripts(callback) {
  let first = true;

  function done(err, stats) {
    first = true;
    if (err) {
      return;
    }
    if (stats.hasErrors()) {
      console.log('scripts: ERROR');
    } else {
      console.log('scripts: DONE');
    }
  }

  // TODO по хорошему таск надопеределать для взаимодействие именно с вотчером webpack
  return gulp.src(paths.scripts.src)
    .pipe(plumber(plumberConfig))
    .pipe(named())
    .pipe(webpackStream(webpackConfig, null, (err, stats) => {
      if (err) throw new gutil.PluginError("webpack", err);
      gutil.log("[webpack]", stats.toString({
        // output options
        colors: true
      }));
      callback();
    }))
    .pipe(gulp.dest(paths.scripts.dest))
    // .on('data', ()=> {
    //   if (first) {
    //     first = false;
    //     callback();
    //   }
    // })
    .pipe(bsServer.stream())
}

export function serve() {
  bsServer.init({
    server: {
      baseDir: paths.serve.dest
    }
  });
}


export function watch() {
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.templates.watch, templates);
  gulp.watch(paths.scripts.watch, scripts);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, templates, assets), gulp.parallel(watch, serve));
export {build};

export default build;
