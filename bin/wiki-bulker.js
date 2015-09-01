#! /usr/bin/env node

var exportSites = require('../lib/export-sites');
var fs = require('fs');

var customArgv = process.argv.slice(2);
var sourceFilename = customArgv[0];
var dumpName = customArgv[1];

/** POLYFILLS **/

if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

/** INPUT VALIDATION **/

if (dumpName === null || (typeof dumpName == "string" && !dumpName.includes(".xml"))) {
	console.error("Provide a name for the dump as last argument, e.g.\n%s %s Lists_of_writers List_of_Nobel_laureates nobels-list.xml", process.argv[0], process.argv[1]);
	return 1;
}

if (sourceFilename === null) {
	console.error("Provide at a file containing with one wikipedia title as url format per line, e.g.\nLists_of_writers\nList_of_Nobel_laureates\n...", process.argv[0], process.argv[1]);
	return 1;
}

if (!fs.existsSync(sourceFilename)) {
	console.error("Provided file %s does not exist!", sourceFilename);
	return 1;
}

var file = fs.readFileSync(sourceFilename, { encoding: 'utf8' });
var sitesToCrawl = file.match(/[^\n]+/g); // split by newline

if (typeof sitesToCrawl !== 'object' || sitesToCrawl.length === 0) {
	console.error("Could not find sites to crawl in %s.", sourceFilename);
	return 1;
}

// start crawler
console.log("START EXPORTING, BE PATIENT");
exportSites(sitesToCrawl, dumpName, function() {
	console.log("DONE! Look at %s", dumpName);
});
