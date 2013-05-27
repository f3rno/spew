Spew
====

A simple logging module for NodeJS. I had to create my own logging plugin for all of my node projects, and ended up adding so many features that it now consists of enough functionality to move into a seperate, official module.

I'll continue to add more handlers too it over time, but for now this should suffice. If you find any bugs, or wish to contribute, feel free to send a pull request or create a new issue :)

I've created a basic example, and will add more as I migrate more functionality from my various projects

Basic Example
=============

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