module.exports =

  format: require("../config").format
  colors: require("../config").colors

  out: (tag, message, color) ->
    header = "#{@format.prefix}#{tag}#{@format.suffix}"
    console.log "#{color}#{header}#{message}#{@colors.reset}"
