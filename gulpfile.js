'use strict'

const babelify = require('babelify')
const browserify = require('browserify')
const del = require('del')
const gulp = require('gulp')
const merge2 = require('merge2')
const path = require('path')
const runSequence = require('run-sequence')
const source = require('vinyl-source-stream')

function bundle (indexFile, dir, deps, cb) {
  let stream = merge2(
    browserify(indexFile, { debug: true })
      .transform(babelify)
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(dir))
  )

  for (let key in deps) {
    stream.add(
      gulp.src(key)
        .pipe(gulp.dest(path.join(dir, deps[key])))
    )
  }

  stream.on('queueDrain', cb)
}

function createTasks (name) {
  gulp.task(`clean-${name}`, () => del(`./build/${name}`, { force: true }))

  gulp.task(`build-${name}`, (cb) => {
    bundle('./src/index.js', `./build/${name}`, {
      [`./src/manifest.json`]: '',
      './src/content.js': '',
      './src/images/*': 'images',
      './src/popup/*': 'popup'
    }, cb)
  })

  gulp.task(name, (cb) => {
    runSequence(`clean-${name}`, `build-${name}`, cb)
  })
}

createTasks('chrome')
