config = require "./config"

class Spew

  ###
  # Registers all channels in ./channels. Only those not requiring a @setup()
  # call are enabled!
  ###
  constructor: ->
    @colors = config.colors
    @channels = {}
    @_logLevel = 5

    fs.readdirSync("#{__dirname}/channels").forEach (file) =>
      if !!file.indexOf ".js"
        name = file.split(".js")[0]
        @channels[name] = require "./channels/#{file}"
        @channels[name].enabled = !!@channels[name].out

  ###
  # Low-level output method, logs to all enabled channels
  #
  # @param [String] tag
  # @param [String] message
  # @param [String] color color escape code
  # @param [Number] logLevel
  ###
  out: (tag, message, color, logLevel) ->
    return if logLevel > @_logLevel
    color ||= ""

    # Disable channels that haven't been setup
    for name, channel of @channels
      channel.enabled = false unless channel.out

      if channel.enabled
        channel.out tag, message, color

    null

  ###
  # Basic log method, pass in colors from @colors
  #
  # @param [String] tag
  # @param [String] message
  # @param [String] color
  ###
  log: (tag, message, color) ->
    @out tag, message, color, -1

  ###
  # Helpful pre-tagged log methods.
  ###
  init: (message) -> @out "Init", message, config.colors.green, 4
  info: (message) -> @out "Info", message, config.colors.yellow, 3
  warning: (message) -> @out "Warning", message, config.colors.purple, 2
  error: (message) -> @out "Error", message, config.colors.red, 1
  critical: (message) -> @out "Critical", message, config.colors.cyan, 0

  ###
  # Set a new log level. Messages only go through to our channels if their log
  # level is less than or equal to our log level
  #
  # @param [Number] level
  ###
  setLogLevel: (@_level) ->

  ###
  # Fetch our log level
  #
  # @return [Number] level
  ###
  getLogLevel: -> @_logLevel

  ###
  # Enable channel by name
  #
  # @param [String] name
  ###
  enableChannel: (name) ->
    @channels[name].enabled = true if @channels[name]

  ###
  # Disable channel by name
  #
  # @param [String] name
  ###
  disableChannel: (name) ->
    @channels[name].enabled = false if @channels[name]

  enableAllChannels: -> channel.enabled = true for name, channel of @channels
  disableAllChannels: -> channel.enabled = false for name, channel of @channels

  ###
  # Check if a channel is enabled
  #
  # @param [String] name
  ###
  getChannelStatus: (name) ->
    !!@channels[name]?.enabled

  ###
  # Add a new channel if one with the specified name does not already exist
  #
  # @param [String] name
  # @param [Method] out output method, takes (tag, message, color)
  # @param [Object] formatting optional, defaults to global formatting
  # @options formatting [String] prefix
  # @options formatting [String] suffix
  # @param [Boolean] enabled defaults to false
  # @return [Channel] newChannel
  ###
  addChannel: (name, out, formatting, enabled) ->
    return if @channels[name] || !out

    formatting ||= config.format
    enabled = !!enabled

    @channels[name] =
      out: out
      enabled: enabled
      formatting: formatting

  ###
  # Delete a channel by name
  #
  # @param [String] name
  ###
  removeChannel: (name) ->
    delete @channels[name]

module.exports = new Spew
