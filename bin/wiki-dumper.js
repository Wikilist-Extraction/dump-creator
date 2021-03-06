#! /usr/bin/env node

var exportSites = require('../lib/export-sites');

var customArgv = process.argv.slice(2);
var sitesToCrawl = customArgv.slice(0, -1);
var dumpName = customArgv.slice(-1).length == 1 ? customArgv.slice(-1)[0] : null;

function getToday() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1 < 10 ? "0"+(date.getMonth() + 1) : ""+(date.getMonth() + 1);
	var day = date.getDate() < 10 ? "0"+date.getDate() : ""+date.getDate();

	return year + month + day;
}

var today = getToday();


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

if (sitesToCrawl.length === 0) {
	console.error("Provide at least one wikipedia title as url format, e.g.\n%s %s Lists_of_writers List_of_Nobel_laureates nobels-list.xml", process.argv[0], process.argv[1]);
	return 1;
}



// start crawler
console.log("START EXPORTING, BE PATIENT");
exportSites(sitesToCrawl, dumpName, function() {
	console.log("DONE! Look at %s", dumpName);
});
