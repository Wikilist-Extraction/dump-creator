var request = require("request");
var fs = require("fs");

var exportUrl = "http://en.wikipedia.org/w/index.php?title=Special:Export";

/*** ADJUST THIS ARRAY TO ADAPT SITES TO CRAWL ***/
// entries must match wikipedia subpaths
var sitesToCrawl = [ "List_of_Nobel_laureates" ];

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

// send list of page names to wiki exporter and store into dump.xml
function exportDependentPages(pages, callback) {
	var url = exportUrl + buildExportQuery(pages);
	var options = {
		url: url,
		headers: {
			"Accept-Encoding": "gzip,deflate"
		}
	};

	var ws = fs.createWriteStream("dump-single.xml");
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
	console.log("DONE! Look at dump-single.xml");
});



