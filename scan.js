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
      console.log('Possible reflective XSS at %s', anchors[i].url)
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

      var len = Object.keys(queries).length

      if (len > 0) {

        var hrefWithQuery = {
          url : href.replace(urlParsed.search, ''),
          keys : []
        }

        for (var i = 0; i < len; i++) {
          hrefWithQuery.keys[i] = {
            name : Object.keys(queries)[i],
            possibleType : ''
          }
        }

        hrefsWithQuery.push(hrefWithQuery)

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
