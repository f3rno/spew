fs = require "fs"

module.exports =

  format: require("../config").format

  ###
  # Setup file logging to the specified path. Assumes the path is accessible!
  # Our output method is not available untill @setup() is called.
  #
  # @param [String] path
  ###
  setup: (path) ->
    @out = (tag, message, color) =>
      fs.appendFile path, "#{@format.prefix}#{tag}#{@format.suffix}#{msg}\n"
