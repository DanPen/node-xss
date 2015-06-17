var http = require('http');


var flags = require('flags');

flags.defineString('url', 'www.google.com', 'URL of page to scan');
flags.defineStringList('targets', ['form', 'object']);
flags.parse();

console.log(flags.get('url'));
var result = /^(http\:\/\/)? .+/i.exec(flags.get('url'))
console.log(result);


var options = {
  host : 'www.blender3d.org',
  port : 80,
  path : '/e-shop/product_info_n.php?products_id=164'
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
    console.log('done');
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
