// Step 1: scan entire site for URLs with query strings
//  a: scrape HTML for anchors
//    i: find hrefs with query strings
//    ii: use all links for crawling and scraping those pages
//  b: scrape HTML for forms
//    i: find inputs in forms
//    ii: search form 'action' for query strings
//  c: scrape HTML for inputs without forms
//    i: run page in phantomjs and test these inputs for XHRs and check the resulting query strings
