var request = require("request");
var fs = require("fs");
var Crawler = require("simplecrawler");

var exportUrl = "http://en.wikipedia.org/w/index.php?title=Special:Export";
var domain = "en.wikipedia.org";
var basePath = "/wiki/";

/*** ADJUST THIS ARRAY TO ADAPT SITES TO CRAWL ***/
// entries must match wikipedia subpaths
var sitesToCrawl = [ "Lists_of_writers" ];

var dependentPages = [];
var pageCrawler = new Crawler(domain);

// add page entries to crawler queue
sitesToCrawl.forEach(function(name) { 
	pageCrawler.queue.add(
		pageCrawler.initialProtocol, 
		domain, 
		pageCrawler.initialPort,
		basePath + name,
		1
	);
});

// configure crawler
pageCrawler.parseHTMLComments = false;
pageCrawler.parseScriptTags = false;
pageCrawler.downloadUnsupported = false;
pageCrawler.interval = 5; // in ms
pageCrawler.maxConcurrency = 50;
pageCrawler.domainWhitelist = [ "en.wikipedia.org" ];
pageCrawler.maxDepth = 2;

// only look for internal wiki links
var articleCondition = pageCrawler.addFetchCondition(function(parsedURL) {
    return parsedURL.uriPath.match(/^\/wiki\/list(s)?_of_/i);
});

// remove base path from uri
function getNameFromUriPath(uriPath) {
	return uriPath.replace(basePath, "");
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

// send list of page names to wiki exporter and store into dump.xml
function exportDependentPages(pages, callback) {
	var url = exportUrl + buildExportQuery(pages);
	var options = {
		url: url,
		headers: {
			"Accept-Encoding": "gzip,deflate"
		}
	};

	var ws = fs.createWriteStream("dump.xml");
	ws.on("finish", callback);

	request
		.post(options)
		.on("error", function(err) {
			console.error(err);
	  	})
		.pipe(ws);
}

// start crawler
console.log("START CRAWLING, BE PATIENT.");

pageCrawler
	.on("fetchcomplete", function(queueItem) {
		console.log(queueItem.url, getNameFromUriPath(queueItem.path), pageCrawler.queue.length);
		dependentPages.push( getNameFromUriPath(queueItem.path) );
	})
	.on("fetcherror", function() {
		throw new Error("fetcherror with", arguments);
	})
	.on("complete", function() {
		console.log("COMPLETED CRAWLING, START DOWNLOAD, BE PATIENT.");
		exportDependentPages(
			dependentPages,
			function() { console.log("FINISHED DOWNLOADING. Look at dump.xml!"); }
		);
	});

pageCrawler.start();

