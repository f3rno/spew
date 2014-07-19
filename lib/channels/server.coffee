fs = require "fs"
request = require "request"

module.exports =

  format: require("../config").format

  ###
  # Setup server logging via a GET request. The message and tag are passed in
  # via URL parameters. i.e. ?tag=...&msg=...
  #
  # Our output method is not available untill @setup() is called.
  #
  # @param [String] path
  # @param [Number] port
  # @param [String] tagKey URL key name for tag
  # @param [String] messageKey URL key name for message
  ###
  setup: (path, port, tagKey, messageKey) ->
    port ||= 80

    @out = (tag, message) =>

      formattedMessage = "#{@format.prefix}#{message}#{@format.suffix}"
      request
        url: "#{path}?#{tagKey}=#{tag}&#{messageKey}=#{formattedMessage}"
        port: port
        strictSSL: false
