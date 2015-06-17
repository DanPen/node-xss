var http = require('http');
var https = require('https');


var flags = require('flags');

flags.defineString('url', 'www.google.com', 'URL of page to scan');
flags.defineStringList('targets', ['form', 'object'], 'the HTML tags you want to search for');
flags.parse();

var url = flags.get('url');
url = /(http:\/\/)?((?:www\.)?[^\/]+)(\/.+)?/.exec(url);

var options = {
  host : url[2],
  port : 80,
  path : url[3]
}

var page = "";
var tags = [];

var req = http.request(options, function (res) {

  res.setEncoding('utf8');

  var purgatory = '';

  var readTagName = false;
  var tagPurgatoryName = '';

  var readTagFull = false;
  var tagPurgatoryFull = '';


  res.on('data', function (chunk) {

    var lastChar;

    for (var i = 0, len = chunk.length; i < len; i++) {
      // Start of beginning tag
      if (chunk[i] == '<') {
        readTagName = true;
        readTagFull = true;
      }

      // Don't read end tags
      if (chunk[i] == '/' && lastChar == '<') {
        readTagName = false;
        readTagFull = false;
        tagPurgatoryFull = '';
      }

      if (readTagFull && chunk[i] != '>') {
        tagPurgatoryFull += chunk[i];
      }

      if (readTagFull && tagPurgatoryFull && chunk[i] == '>') {
        tagPurgatoryFull += chunk[i];

        readTagName = false;
        readTagFull = false;

        gotTag(tagPurgatoryName, tagPurgatoryFull);

        tagPurgatoryName = '';
        tagPurgatoryFull = '';
      }

      if (readTagName && chunk[i] != '<' && chunk[i] != ' ' && chunk[i] != '/') {
        tagPurgatoryName += chunk[i];
      }

      if (readTagName && (chunk[i] == ' ' || chunk[i] == '/')) {
        readTagName = false;
      }


      // if (tagPurgatoryFull && readTagFull && chunk[i] == ' ') {
      //   readTagFull = false;
      //   console.log(tagPurgatoryFull);
      //   tags.push(tagPurgatoryFull);
      //   tagPurgatoryFull = '';
      // }

      lastChar = chunk[i];

    }

    page += chunk;

  });

  res.on('end', function () {

  });

}).end();

function gotTag (tagName, tagFull) {
  tags.push({
    tagName : tagName,
    tagFull : tagFull
  });

  if (tagName == 'form')
    console.log(tagFull);
}
