var path = require('path');
var fs = require('fs');
var request = require('request');

var EXPORT_URL = "http://en.wikipedia.org/w/index.php?title=Special:Export";

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
function exportDependentPages(pages, dumpName, callback) {
	var url = EXPORT_URL + buildExportQuery(pages);
  console.log(url);
	var options = {
		url: url,
		headers: {
			"Accept-Encoding": "gzip,deflate"
		}
	};

	var ws = fs.createWriteStream(dumpName);
	ws.on("finish", callback);

	request
		.post(options)
		.on("error", function(err) {
			console.error(err);
	  	})
		.pipe(ws);
}

module.exports = exportDependentPages;
