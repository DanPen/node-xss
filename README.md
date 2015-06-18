About
=================
In an attempt to understand XSS better, I decided to make this tool.

Here's an idea of how I plan to make it work. I'm basing it off of [this article by OWASP](https://www.owasp.org/index.php/Testing_for_Reflected_Cross_site_scripting_%28OTG-INPVAL-001%29)

###Step 1: Reconnaissance

The main idea is to detect all input vectors seen across the entire site. This includes links with query strings, forms, and XHRs. I'm only considering reflective XSS attacks for now.

1. Scrape anchor tags.
  1. Store URLs from anchors that contain query strings `?foo=123&bar=asdf`.
  2. Store all URLS from anchors for crawling and in turn also scraping those pages.
2. Scrape forms.
  1. Store forms and child inputs resulting URLs and parameters (query strings in GET; body parameters in POST/PUT/DELETE/etc).
  2. Search form 'action' for query strings. An action may contain query strings such as `/signup?page=home` even if it's not a GET request.
3. Scrape inputs that don't have forms. These will probably use XHRs (XMLHttpRequests; aka: AJAX)!
  1. Run page in phantomjs and test these inputs for outgoing XHRs and store the resulting query strings and/or body parameters.

XSS Bypasses
=================
Some ideas of what XSS tests to run.

 - [UTF-7 encoding attack](http://stackoverflow.com/a/29445514/546476)
