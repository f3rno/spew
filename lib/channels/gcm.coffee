fs = require "fs"
request = require "request"

module.exports =

  format: require("../config").format

  # GCM registered ids
  regIds: []

  ###
  # Setup logging over Google Cloud Messaging
  #
  # Our output method is not available untill @setup() is called.
  #
  # @param [String] authKey GCM server auth key
  ###
  setup: (authKey) ->
    @out = (tag, message) =>

      if @regIds.length > 0
        request.post
          uri: "https://android.googleapis.com/gcm/send"
          json:
            registration_ids: @regIds
            data:
              tag: tag
              msg: message
          headers:
            Authorization: "key=#{authKey}"
