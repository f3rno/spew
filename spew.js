var fs = require("fs");
var request = require("request");
var nodemailer = require("nodemailer");

// Default formatting, can be overriden both here, and on a channel-by-channel basis
globalFormatting = {
	prefix: "[",
	suffix: "]--> "
};

// By default, emails are not sent at all.
var emailTransport;
var emailAdmin;
var emailMe;
var emailEnabled = false;

// Channels is a container of objects of functions and an enable flag, that take a tag/msg/color and do something with it.
// By default, only console logging is enabled
var channels = {

	// Generic console output
	"console": {

		"format": globalFormatting,
		"enabled": true,

		"out": function(tag, msg, color) {
			console.log(color + this.format.prefix + tag.toUpperCase() + this.format.suffix + msg + exports.colors.reset);
		}
	},

	// Disk output (logfile)
	"disk": {

		"format": globalFormatting,
		"enabled": false,

		// Setup for disk logging
		//
		// Args:
		//  path	- Path to logfile, assumed accessible
		//
		"setup": function(path) {

			// Path is assumed to be accessible!
			if(path.length > 0) {
				this.out = function(tag, msg, color) {
					fs.appendFile(path, this.format.prefix + tag + this.format.suffix + msg + "\n", function(e) { if(e) { console.log("Couldn't write to logfile"); }});
				};
			}
		}
	},

	// Server output (http/https, custom url)
	"server": {

		"format": globalFormatting,
		"enabled": false,

		// Setup for server logging, over HTTP GET
		//
		// Args
		//  path    - Path to send logs too, with the message and tag replacing
		//            __msg__ and __tag__
		//
		//            Example: http://host.com/log_server.php?tag=__tag__&&msg=__msg__
		//
		//  port    - Port to access host on, default 80
		//
		"setup": function(path, port) {

			path.replace("http://", "");
			path.replace("https://", "");

			if(port === undefined || port === null) { port = 80; }

			this.path = path;
			this.port = port;

			this.out = function(tag, msg, color) {

				var finalPath = this.path.split("__tag__").join(tag).split("__msg__").join(msg);

				request({
					"url": "http://" + finalPath,
					"port": this.port,
					"strictSSL": false
				}, function(err, res, body) {if(err) { console.log(err); }});
			};
		}
	},

	// Google cloud messaging, regIDs are kept in the public array spew.regIds
	"gcm": {

		"format": globalFormatting,
		"enabled": false,

		// Setup for logging over google cloud messaging
		//
		// Args
		//  authKey    - GCM server auth key
		//
		//  Data is sent in an object, containing "tag" and "msg"
		"setup": function(authKey) {

			this.out = function(tag, msg, color) {

				if(exports.regIds.length > 0) {
					request.post({
						uri: "https://android.googleapis.com/gcm/send",
						json: {
							registration_ids: exports.regIds,
							data: {
								"tag": tag,
								"msg": msg
							}
						},
						headers: {
							Authorization: "key=" + authKey
						}
					});
				}
			};
		}
	}
};

// GCM registered ids
exports.regIds = [];

// Default log level
var globalLogLevel = 2; // Includes Critical, Error, and Warning

// Low level log, logs to all enabled channels
function spew(tag, msg, color, email, loglevel) {
	for(var key in channels) {
		if(channels[key].enabled) {
			if(!channels[key].out) {
				channels[key].enabled = false;
			} else {
				if(loglevel <= globalLogLevel ) {
					channels[key].out(tag, msg, color);

					if(channels[key].email === true && emailEnabled) {
						emailTransport.sendMail({
							"from": emailMe,
							"to": emailAdmin,
							"text": channels[key].formatting.prefix + tag + channels[key].formatting.suffix + msg
						});
					}
				}
			}
		}
	}
}

// Creates a new spew function to attach to the public interface
function createSpew(tag, color, email, loglevel) {
	return function(msg) {
		spew(tag, msg, color, email, loglevel);
	};
}

// Color definitions, escape sequences
exports.colors = {

	red: "\033[31m",
	blue: "\033[34m",
	yellow: "\033[33m",
	green: "\033[32m",
	purple: "\033[35m",
	cyan: "\033[36m",
	reset: "\033[0m"
};

exports.formatting = globalFormatting;

// Create a new tag, accessibly by spew.<tag>(msg);
exports.addTag = function(tag, color, email, loglevel) {
	if(this[tag] === undefined) {
		this[tag] = createSpew(tag, color, email, loglevel);
	}
};

// Some boilerplate functions
exports.init = createSpew("Init", "\033[32m", false, 4); // Green
exports.info = createSpew("Info", "\033[34m", false, 3); // Blue
exports.error = createSpew("Error", "\033[31m", true, 1); // Red
exports.warning = createSpew("Warning", "\033[33m", false, 2); // Yellow
exports.critical = createSpew("Critical", "\033[36m", true, 0); // Cyan

// General spew function
exports.log = function(tag, msg, color) { spew(tag, msg, color); };

exports.setLogLevel = function(l) { globalLogLevel = l; };
exports.getLogLevel = function() { return globalLogLevel; };

// Enable/Disable channels
exports.enableChannel = function(chan) {

	if(channels[chan]) {
		channels[chan].enabled = true;
	}
};
exports.disableChannel = function(chan) {

	if(channels[chan]) {
		channels[chan].enabled = false;
	}
};
exports.getChannelStatus = function(chan) {

	if(channels[status]) {
		return channels[chan].enabled;
	} else {
		return undefined;
	}
};

// Add/Remove channels
//
// Args:
//  name          - Name of channel
//  out           - Callback, takes arguments in the format (tag, msg, color)
//  formatting    - Contains two strings, "prefix" and "suffix"
//  enabled       - Boolean
//
exports.addChannel = function(name, out, formatting, enabled) {

	if(channels[name] === undefined && out) {

		if(formatting === undefined) { formatting = globalFormatting; }
		if(enabled === undefined) { enabled = false; }

		channels[name] = {
			"out": out,
			"enabled": enabled,
			"formatting": formatting
		};
	}
};
exports.removeChannel = function(name) {

	if(channels[name]) {
		channels[name] = undefined;
	}
};

// Used to access channel setup()
//
// Although there is probably a better way of doing this...
exports.getChannel = function(name) {
	return channels[name];
}

// Enable/Disable emails
//
// Example settings structure:
//
// {
//      me: "my-app-mailer@gmail.com",
//      admin: "johndoe@gmail.com",
//      smtpTransport: {
//          service: "Gmail",
//          auth: {
//              user: "my-app-mailer@gmail.com",
//              pass: "topsecretpassword123**"
//          }
//      }
// }
exports.enableEmails = function(settings) {
	if(settings) {
		if(settings.admin && settings.me && settings.smtpTransport) {
			emailTransport = nodemailer.createTransport("SMTP", settings.smtpTransport);
			emailAdmin = settings.admin;
			emailMe = settings.me;
			emailEnabled = true;
		}
	} else if(emailTransport && emailAdmin && emailMe) {
		emailEnabled = true;
	}
};
exports.disableEmails = function() {
	emailEnabled = false;
};