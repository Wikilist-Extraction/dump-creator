#! /usr/bin/env node

var request = require("request");
var fs = require("fs");
var path = require("path");

var EXPORT_URL = "http://en.wikipedia.org/w/index.php?title=Special:Export";

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

var extendedDumpName = "enwiki-"+today+"-"+dumpName;
var dirpath = path.join("enwiki", today);

if (sitesToCrawl.length === 0) {
	console.error("Provide at least one wikipedia title as url format, e.g.\n%s %s Lists_of_writers List_of_Nobel_laureates nobels-list.xml", process.argv[0], process.argv[1]);
	return 1;
}

/** HELPERS **/

function mkdirSync(dirpath) {
  var parts = dirpath.split(path.sep);
  for( var i = 1; i <= parts.length; i++ ) {
    try {
	    fs.mkdirSync( path.join.apply(null, parts.slice(0, i)) );
	  } catch(e) {
	    if ( e.code != 'EEXIST' ) throw e;
	  }
  }
}

// use list of wiki page names and create a query string for the wiki exporter
function buildExportQuery(pages) {
	function buildPagesQuery() {
		var pageDelimiter = "%0A";
		return pages.join(pageDelimiter);
	}

	var queryOptions = {
		action: "submit",
		curonly: true,
		pages: buildPagesQuery()
	};

	return "&action="+queryOptions.action+"&pages="+queryOptions.pages+"&curonly="+queryOptions.curonly+"&limit=1";
}

// send list of page names to wiki exporter and store into a dump file
function exportDependentPages(pages, callback) {
	var url = EXPORT_URL + buildExportQuery(pages);
	var options = {
		url: url,
		headers: {
			"Accept-Encoding": "gzip,deflate"
		}
	};

	mkdirSync(dirpath);

	var ws = fs.createWriteStream( path.join(dirpath, extendedDumpName) );
	ws.on("finish", callback);

	request
		.post(options)
		.on("error", function(err) {
			console.error(err);
	  	})
		.pipe(ws);
}

// start crawler
console.log("START EXPORTING, BE PATIENT");
exportDependentPages(sitesToCrawl, function() {
	console.log("DONE! Look at %s", path.join(dirpath, extendedDumpName));
});



