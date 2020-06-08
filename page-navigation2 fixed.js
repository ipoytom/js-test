pageNav.urlActivePage = location.href;
pageNav.homePage = "/";
pageNav.noPage = 0;
pageNav.currentPage = 0;
pageNav.currentPageNo = 0;
pageNav.postLabel = "";

pageNav.loopPage = function(pageInfo) {
	var pageNumber = parseInt(pageNav.numPages / 2),
		pageStart = pageNav.currentPageNo - pageNumber,
		lastPageNo = parseInt(pageInfo / pageNav.perPage) + 1,
		pageEnd = pageStart + pageNav.numPages - 1,
		prevNumber = parseInt(pageNav.currentPageNo) - 1,
		html = '',
		i, nextNumber;
	if (pageNumber == pageNav.numPages - pageNumber) {
		pageNav.numPages = pageNumber * 2 + 1
	}
	if (pageStart < 1) {
		pageStart = 1;
	}
	if (lastPageNo - 1 == pageInfo / pageNav.perPage) {
		lastPageNo = lastPageNo - 1;
	}
	if (pageEnd > lastPageNo) {
		pageEnd = lastPageNo;
	}
	html += "<span class='showPageOf'>Page " + pageNav.currentPageNo + ' of ' + lastPageNo + "</span>";
	if (pageNav.currentPageNo > 1) {
		if (pageNav.currentPage == "page") {
			html += '<span class="showpage"><a href="' + pageNav.homePage + '">' + pageNav.firstText + '</a></span>'
		} else {
			html += '<span class="displaypageNum"><a href="/search/label/' + pageNav.postLabel + '?&max-results=' + pageNav.perPage + '">' + pageNav.firstText + '</a></span>'
		}
	}
	if (pageNav.currentPageNo > 2) {
		if (pageNav.currentPageNo == 3) {
			if (pageNav.currentPage == "page") {
				html += '<span class="showpage"><a href="' + pageNav.homePage + '">' + pageNav.prevText + '</a></span>'
			} else {
				html += '<span class="displaypageNum"><a href="/search/label/' + pageNav.postLabel + '?&max-results=' + pageNav.perPage + '">' + pageNav.prevText + '</a></span>'
			}
		} else {
			if (pageNav.currentPage == "page") {
				html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectPage(' + prevNumber + ');return false">' + pageNav.prevText + '</a></span>'
			} else {
				html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectLabel(' + prevNumber + ');return false">' + pageNav.prevText + '</a></span>'
			}
		}
	}
	if (pageStart > 1) {
		if (pageNav.currentPage == "page") {
			html += '<span class="displaypageNum"><a href="' + pageNav.homePage + '">1</a></span>'
		} else {
			html += '<span class="displaypageNum"><a href="/search/label/' + pageNav.postLabel + '?&max-results=' + pageNav.perPage + '">1</a></span>'
		}
	}
	if (pageStart > 2) {
		html += ' ... '
	}
	for (i = pageStart; i <= pageEnd; i++) {
		if (pageNav.currentPageNo == i) {
			html += '<span class="pagecurrent">' + i + '</span>';
		} else if (i == 1) {
			if (pageNav.currentPage == "page") {
				html += '<span class="displaypageNum"><a href="' + pageNav.homePage + '">1</a></span>'
			} else {
				html += '<span class="displaypageNum"><a href="/search/label/' + pageNav.postLabel + '?&max-results=' + pageNav.perPage + '">1</a></span>'
			}
		} else {
			if (pageNav.currentPage == "page") {
				html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectPage(' + i + ');return false">' + i + '</a></span>'
			} else {
				html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectLabel(' + i + ');return false">' + i + '</a></span>'
			}
		}
	}
	if (pageEnd < lastPageNo - 1) {
		html += '...'
	}
	if (pageEnd < lastPageNo) {
		if (pageNav.currentPage == "page") {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectPage(' + lastPageNo + ');return false">' + lastPageNo + '</a></span>'
		} else {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectLabel(' + lastPageNo + ');return false">' + lastPageNo + '</a></span>'
		}
	}
	nextNumber = parseInt(pageNav.currentPageNo) + 1;
	if (pageNav.currentPageNo < (lastPageNo - 1)) {
		if (pageNav.currentPage == "page") {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectPage(' + nextNumber + ');return false">' + pageNav.nextText + '</a></span>'
		} else {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectLabel(' + nextNumber + ');return false">' + pageNav.nextText + '</a></span>'
		}
	}
	if (pageNav.currentPageNo < lastPageNo) {
		if (pageNav.currentPage == "page") {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectPage(' + lastPageNo + ');return false">' + pageNav.lastText + '</a></span>'
		} else {
			html += '<span class="displaypageNum"><a href="#" onclick="pageNav.redirectLabel(' + lastPageNo + ');return false">' + pageNav.lastText + '</a></span>'
		}
	}
	$("#blog-pager").html(html);
};
pageNav.redirectPage = function(numberpage) {
	var jsonStart = (numberpage - 1) * pageNav.perPage;
	pageNav.noPage = numberpage;
	$.getScript(pageNav.homePage + "feeds/posts/summary?start-index=" + jsonStart + "&max-results=1&alt=json-in-script&callback=pageNav.findDatePost");
};
pageNav.redirectLabel = function(numberpage) {
	var jsonStart = (numberpage - 1) * pageNav.perPage;
	pageNav.noPage = numberpage;
	$.getScript(pageNav.homePage + "feeds/posts/summary/-/" + pageNav.postLabel + "?start-index=" + jsonStart + "&max-results=1&alt=json-in-script&callback=pageNav.findDatePost");
};
pageNav.findDatePost = function(root) {
	var post = root.feed.entry[0],
		timestamp = encodeURIComponent(post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29)),
		pAddress;
	if (pageNav.currentPage == "page") {
		pAddress = "/search?updated-max=" + timestamp + "&max-results=" + pageNav.perPage + "#PageNo=" + pageNav.noPage
	} else {
		pAddress = "/search/label/" + pageNav.postLabel + "?updated-max=" + timestamp + "&max-results=" + pageNav.perPage + "#PageNo=" + pageNav.noPage
	}
	location.href = pAddress;
};
(function($) {
	var thisUrl = pageNav.urlActivePage;
	if (thisUrl.indexOf("/search/label/") != -1) {
		if (thisUrl.indexOf("?updated-max") != -1) {
			pageNav.postLabel = thisUrl.substring(thisUrl.indexOf("/search/label/") + 14, thisUrl.indexOf("?updated-max"))
		} else {
			pageNav.postLabel = thisUrl.substring(thisUrl.indexOf("/search/label/") + 14, thisUrl.indexOf("?&max"))
		}
	}
	if (thisUrl.indexOf("?q=") == -1 && thisUrl.indexOf(".html") == -1) {
		if (thisUrl.indexOf("/search/label/") == -1) {
			pageNav.currentPage = "page";
			if (pageNav.urlActivePage.indexOf("#PageNo=") != -1) {
				pageNav.currentPageNo = pageNav.urlActivePage.substring(pageNav.urlActivePage.indexOf("#PageNo=") + 8, pageNav.urlActivePage.length)
			} else {
				pageNav.currentPageNo = 1
			}
			$.getJSON(pageNav.homePage + "feeds/posts/summary?max-results=1&alt=json-in-script&callback=?", function(json) {
				pageNav.loopPage(parseInt(json.feed.openSearch$totalResults.$t, 10));
			});
		} else {
			pageNav.currentPage = "label";
			if (pageNav.urlActivePage.indexOf("#PageNo=") != -1) {
				pageNav.currentPageNo = pageNav.urlActivePage.substring(pageNav.urlActivePage.indexOf("#PageNo=") + 8, pageNav.urlActivePage.length)
			} else {
				pageNav.currentPageNo = 1
			}
			$.getJSON(pageNav.homePage + "feeds/posts/summary/-/" + pageNav.postLabel + "?alt=json-in-script&max-results=1&callback=?", function(json) {
				pageNav.loopPage(parseInt(json.feed.openSearch$totalResults.$t, 10));
			});
		}
	}
	$("a[href*='/search/label/']").attr("href", function(){
		return $(this).attr("href") + "?&max-results=" + pageNav.perPage;
	});
})(jQuery);