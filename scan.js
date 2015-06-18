var flags = require('flags');
var url = require('url');

flags.defineString('url', 'www.google.com', 'URL of page to scan');
flags.defineStringList('targets', ['form', 'object'], 'the HTML tags you want to search for');
flags.parse();

var targetURL = flags.get('url');
targetURL = /(http:\/\/)?((?:www\.)?[^\/]+)(\/.+)?/.exec(targetURL);

var options = {
  host : targetURL[2],
  port : 80,
  path : targetURL[3]
}

var http = require('http');

var crawlQueue = [];

var cheerio = require('cheerio');

var req = http.request(options, function (res) {

  res.setEncoding('utf8');

  var page = '';

  res.on('data', function (chunk) {
    page += chunk;
  });

  res.on('end', function () {
    $ = cheerio.load(page);

    var anchors = scrapeAnchors($)
    for (var i = 0; i < anchors.length; i++) {
      console.log('Possible reflective XSS at %s', anchors[i].url)
    }

    // scrapeForms($);
  });

}).end();

function scrapeAnchors ($) {

  var hrefsWithQuery = [];

  $('a').each(function () {

    var href = $(this).attr('href');

    if (href !== undefined) {

      var urlParsed = url.parse(href, true, true);

      var queries = urlParsed.query;

      var len = Object.keys(queries).length;

      if (len > 0) {

        var hrefWithQuery = {
          url : href.replace(urlParsed.search, ''),
          keys : []
        }

        for (var i = 0; i < len; i++) {
          hrefWithQuery.keys[i] = {
            name : Object.keys(queries)[i],
            possibleType : ''
          };
        }

        hrefsWithQuery.push(hrefWithQuery);

      }

    }

    if (href != '#' && href !== undefined)
      crawlQueue.push(href);

  });

  return hrefsWithQuery;

}



}

// Step 1: scan entire site for used query strings
//  a: scrape HTML for anchors
//    i: find hrefs with query strings
//    ii: use all links for crawling and scraping those pages
//  b: scrape HTML for forms
//    i: find inputs in GET forms
//    ii: find query strings other forms 'action'
//  c: scrape HTML for inputs without forms
//    i: run page in phantomjs and test these inputs for XHRs and check the resulting query strings
