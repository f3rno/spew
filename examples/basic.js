var spew = require("../spew.js");
var fs = require("fs");

spew.setLogLevel(10);
spew.init("Example starting up...");
spew.info("Looking for README.md...");

try {
	fs.stat("../README.md", function(err, stats) {
		if(err) {
			spew.error("Encountered an error: " + err);
		} else {
			if(stats.isFile()) {
				spew.info("Found README.md, printing to console...");

				fs.readFile("../README.md", { encoding: "UTF-8" }, function(err, data) {
					if(err) {
						spew.error("Encountered an error: " + err);
					} else {
						console.log(data);

						spew.info("Done!");
					}
				});

			} else {
				spew.warning("README.md is a directory, can't proceed!");
			}
		}
	});
} catch(e) {
	spew.error("README.md not found!");
}