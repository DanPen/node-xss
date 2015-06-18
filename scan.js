var flags = require('flags')
var url = require('url')

flags.defineString('url', 'www.google.com', 'URL of page to scan')
flags.defineStringList('targets', ['form', 'object'], 'the HTML tags you want to search for')
flags.parse()

var targetURL = flags.get('url')
targetURL = /(http:\/\/)?((?:www\.)?[^\/]+)(\/.+)?/.exec(targetURL)

var options = {
  host : targetURL[2],
  port : 80,
  path : targetURL[3]
}

var http = require('http')

var crawlQueue = []

var cheerio = require('cheerio')

var req = http.request(options, function (res) {

  res.setEncoding('utf8')

  var page = ''

  res.on('data', function (chunk) {
    page += chunk
  })

  res.on('end', function () {
    $ = cheerio.load(page)

    var anchors = scrapeAnchors($)
    for (var i = 0; i < anchors.length; i++) {
      console.log("<a> found GET request %s with parameters:", anchors[i].url)

      console.log() // new line

      for (var p = 0; p < anchors[i].parameters.length; p++) {

        console.log("\t%s\t%s", anchors[i].parameters[p].key, anchors[i].parameters[p].knownValues)

      }

      console.log() // new line
    }

    var forms = scrapeForms($)
    for (var i = 0; i < forms.length; i++) {
      console.log('%s %s with inputs', forms[i].method, forms[i].url, forms[i].params.join(', '))
    }
  })

}).end()

function scrapeAnchors ($) {

  var hrefsWithQuery = []

  $('a').each(function () {

    var href = $(this).attr('href')

    if (href !== undefined) {

      var urlParsed = url.parse(href, true, true)

      var queries = urlParsed.query

      var alreadyIn = false;
      for (var i = 0; i < hrefsWithQuery.length; i++) {
        if (href.replace(urlParsed.search, '') == hrefsWithQuery[i].url)
          alreadyIn = true
      }

      var paramsCount = Object.keys(queries).length

      if (!alreadyIn && paramsCount > 0) {  // if it hasn't been recorded yet and has a query string

        var hrefWithQuery = {
          url : href.replace(urlParsed.search, ''),
          parameters : []
        }

        for (var i = 0; i < paramsCount; i++) {
          hrefWithQuery.parameters[i] = {
            key : Object.keys(queries)[i],
            knownValues : []
          }
          // insert the current known value
          hrefWithQuery.parameters[i].knownValues.push(queries[hrefWithQuery.parameters[i].key]);
        }

        hrefsWithQuery.push(hrefWithQuery)
      }

      // the URL has already been stored. But there might be different query strings here
      else if (alreadyIn && paramsCount > 0) {

        // loop through every stored URL
        for (var i = 0; i < hrefsWithQuery.length; i++) {

          if (hrefsWithQuery[i].url == href.replace(urlParsed.search, '')) {
            // this is the URL entry we are looking for

            var parameterIndex = -1

            // loop through every stored parameter object of this URL
            for (var e = 0; e < hrefsWithQuery[i].parameters.length; e++) {

              // check if this is a new parameter key
              if (Object.keys(queries)[e] == hrefsWithQuery[i].parameters[e].key)
                parameterIndex = e
            }

            // we already have some known values of of this parameter recorded. Let's look check if there's any new ones
            if (parameterIndex >= 0) {

              var valueAlreadyRecorded = false

              for (var y = 0; y < hrefsWithQuery[i].parameters[parameterIndex].knownValues.length; y++) {

                var knownValue = hrefsWithQuery[i].parameters[parameterIndex].knownValues[y]

                if (queries[Object.keys(queries)[y]] == hrefsWithQuery[i].parameters[parameterIndex].knownValues[y])
                  valueAlreadyRecorded = true

              }

              if (!valueAlreadyRecorded) {
                hrefsWithQuery[i].parameters[parameterIndex].knownValues.push(queries[Object.keys(queries)[y]])
              }
            }

            // this is a completely new parameter
            else {

            }

            // we already found the URL we wanted. no need to continue to next iteration of i.
            break;
          }

        }

      }

    }

    if (href != '#' && href !== undefined)
      crawlQueue.push(href)

  })

  return hrefsWithQuery

}

var inputsInsideOfForms = []

function scrapeForms ($) {

  var pageForms = []

  var findings = []

  $('form').each(function () {
    var form = $(this)

    var method = form.attr('method').toUpperCase()
    var action = form.attr('action')
    var actionQuery = url.parse(action, true, true).query

    var formFindings = {
      method : method,
      url : action,
      params : []
    }

    form.find('input').each(function () {

      var inputName = $(this).attr('name')

      if (inputName !== undefined)
        formFindings.params.push(inputName)

      inputsInsideOfForms.push($(this))
    })

    if (Object.keys(actionQuery).length != 0) {

    }


    findings.push(formFindings)

  })

  return findings

}
