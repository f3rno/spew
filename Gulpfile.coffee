gulp = require "gulp"
coffee = require "gulp-coffee"

gulp.task "build", ->
  gulp.src "lib/**/*.coffee"
  .pipe coffee()
  .pipe gulp.dest "build/"

gulp.task "default", ["build"]
