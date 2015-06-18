About
=================
In an attempt to understand XSS better, I decided to make this tool.

Here's an idea of how I plan to make it work. I'm basing it off of (this article by OWASP)[https://www.owasp.org/index.php/Testing_for_Reflected_Cross_site_scripting_%28OTG-INPVAL-001%29]

###Step 1: Reconnaissance

The main idea is to detect all input vectors seen on the site. This includes links with query strings, forms, and XHRs. I'm only considering reflective XSS attacks for now.

1. scrape anchor tags
  i. set apart anchors with whose hrefs contain query strings
  ii. use all found links for crawling and also scraping those pages

2. scrape forms
    i. store forms and child inputs
    ii. search form 'action' for query strings

3. scrape inputs that don't have forms. These will probably use XHRs!
    i. run page in phantomjs and test these inputs for XHRs and store the resulting query strings
