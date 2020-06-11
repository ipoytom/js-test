// Ver 1.1  - 02/04/2009
// Add TOC at the buttom .... done


//http://lvchen.blogspot.com/feeds/posts/summary?published-min=2008-05-01T00%3A00%3A00-05%3A00&published-max=2008-06-01T00%3A00%3A00-05%3A00&max-results=90
//http://lvchen.blogspot.com/search?updated-min=2008-05-18T00%3A00%3A00-05%3A00&updated-max=2008-05-19T00%3A00%3A00-05%3A00&max-results=50
//this will get one post only
//http://bartstalk.blogspot.com/2006/07/blogger-calendar-ie.html
// How do I know I have load enough post of that month? Do a check and run the json-in-script again.



/* ========================================================
	Defined all methods and variables --> parameters, and setting
===========================================================  */
function ArchiveCalendar() 
{
this.PrevMonth=PrevMonth; 		//function, go to previous month
this.NextMonth=NextMonth; 		//funciton, go to next month
this.refreshTable=refreshTable;	//function, refresh table
this.drawTable=drawTable;		// function, draw a new table when first load
this.Calendar=Calendar;			// function, return a new month, based on user's behavior
this.fetchposts=fetchposts;		// function, get Google API JSON feed
this.addLink=addLink;			// function, callback for Google API
this.monthTable= monthTable;	// function, go to specific month (selected table)
this.yearTable=yearTable;		// function, go to specific year (input)
this.toggleTOC = toggleTOC; 	// function, toggle Table of content
this.drawTOCTable = drawTOCTable;
this.gainControl = gainControl;
this.sortTable = sortTable;

this.alreadyrunflag=0;
this.week_label = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
this.month_label_real = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
this.month_label = new Array("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12");
this.month_days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
this.today = new Date(); 		// Today's date, shouldn't be change
this.cur_day = new Date();		// Specific date, change accordingly
this.startDay = 0;				// The first day of the month, indicate the index of calendar table(td element)
this.base='lvchen.blogspot.com';// The weblog's URL, preset itis better than auto detection.
this.timeZone = '+08:00';		// Timezone is always a problem, this is the true timezone, without daylight saving. If one blog had changed the location, the calendar may fail for some past month. Let's cross our fingures.
this.timeZoneCheck = false;		// Special setting for daylight saving country. Might work well for the previously described situation. Set it to "true" for timezone auto detection for each article.
this.alignFooter = true;
this.todayMsg = 'Today';
this.showTOC = new Array('列表','日曆');
this.listMode = false;
this.loading = '<i class="fa fa-circle-o-notch fa-spin fa-fw margin-bottom"></i></img>'; // loading info, HTML format.
this.tableColor = 'white';
}
/*============================================
	Return a new month, based on user's behavior
==============================================*/
function Calendar(date_obj)	{
	var year = date_obj.getFullYear(); // This year
	var thisMonth = Calendar.month_label[date_obj.getMonth()]+''; //get month label
	var nDays = Calendar.month_days[date_obj.getMonth()]; //  how many days in the month
	var thisDay = Calendar.today.getDate(); // today's date
	if (date_obj.getMonth() == 1 &&(((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))) {//determine Leap Day.
		nDays = 29;
		Calendar.month_days[1] = '29';
	}
	else
		Calendar.month_days[1] = '28'; // this is necessary if we want to access Calendar.month_days[] from other function
		//date_obj.setDate(1); 	// set to the first day to look for its location of this month
		
	Calendar.startDay = date_obj.getDay();// set to the first day to look for its location of this month
	var out='';					// starting making calendar table
		out+='<table style="text-align:center;" align="center" cellspacing="0">';
		out+='<tr>';
	for (var index=0;index<7;index++){ //generate date order, start from Sun
		out+='<th>'+ Calendar.week_label[index]+'</th>';
	}
	out+='</tr>';
	var tab_col=0;
	for (index=0;index<Calendar.startDay;index++){ // give blank for the day not belong to this month
		if (tab_col==0) 
			out+='<tr>';
			out+='<td class="Lastday">&nbsp;</td>';
			tab_col++;
		}
	for (index=1;index<=nDays;index++)	{ // now filling other day into table	
		if (tab_col==0)
			out+='<tr>';
		if (index==thisDay && date_obj.getMonth()==Calendar.today.getMonth() && year==Calendar.today.getFullYear())
			out+='<td class="Today">'+ index + '</td>';
		else
			out+='<td class="Lastday">' + index +'</td>';
		if (tab_col==6) {
			out+='</tr>';
			tab_col=0;
		}
		else
			tab_col++;
	}
	if (tab_col>0) 	{	// fill blank if some cells are empty
		for (var si=0;si<(7-tab_col);si++)		{
			out+='<td class="Lastday">&nbsp;</td>';
		}
	out+='</tr>';
	}
	out+='</table>';
	return out;
}

/*=====================================
	function, get Google API JSON feed
=======================================*/
function fetchposts(year,month,index)	{
	
	var scriptID = document.getElementById('jsonPosts'); // remove existing json call
	if (scriptID != undefined)
		document.documentElement.firstChild.removeChild(scriptID);
	if (month == 11)	{ // We have to know the next month label
		var nextMonth = '01';
		var nextYear = year + 1;
	}
	else	{
		var nextMonth = Calendar.month_label[month+1];
		var nextYear = year;
	}
	var parameters = 'published-min='+ year + '-'+ Calendar.month_label[month] +'-01T00%3A00%3A00'+Calendar.timeZone+'&published-max='+ nextYear + '-'+ nextMonth + '-01T00%3A00%3A00'+Calendar.timeZone+'&max-results=35&start-index='+ index;
	var y_script = document.createElement('script');
	if (!Calendar.listMode)
		var callbacksrc = 'http://' + Calendar.base + '/feeds/posts/summary?alt=json-in-script&callback=Calendar.addLink&' + parameters;
	else 
		var callbacksrc = 'http://' + Calendar.base + '/feeds/posts/summary?alt=json-in-script&callback=Calendar.drawTOCTable&' + parameters;
	y_script.setAttribute('src',callbacksrc);
	y_script.setAttribute('id', 'jsonPosts');
	y_script.setAttribute('type', 'text/javascript');	
	document.getElementsByTagName('HEAD')[0].appendChild(y_script); // A better way
	//document.documentElement.firstChild.appendChild();
}

/*=============================
	Callback for Google API
===============================*/
function addLink(json)	{ 
	var cell = document.getElementById('CalendarTable');
	var entries = json.feed.entry;
	var tempsave='';
	var timeZone = Calendar.timeZone;
	if (entries != undefined)	{
		var cellArray = cell.getElementsByTagName('td'); // look for all cells in the table
		for (var i =0 ; i < entries.length; i++)	{
			var postDateFull = entries[i].published.$t.substr(0,10);
			var postDay = postDateFull.substr(8,2);
			var theCell = cellArray[Calendar.startDay+(parseInt(postDay,10)-1)];
			var postTitle = entries[i].title.$t;
			var j = 0;
			while (j < entries[i].link.length && entries[i].link[j].rel!='alternate' ) // we search for the link we want
				j++;
			var titleLinkIdx = j;
			if (postDay == tempsave){
				// First take care URL
				// Looking for the 'A' element
				var linkTag = theCell.firstChild;
				// Retrive 'HREF' attribute
				var linkTagURL = linkTag.getAttribute('href');
				// Get max-result index number
				var cur_index = linkTagURL.match(/(max-results=)(\d+)/i);
				if (cur_index == null){
					// Check timezone setting for daylight saving
					if (Calendar.timeZoneCheck)	{ 
						var linkTimezone = entries[i].published.$t.substr(23,6); // Basically, we check the timezone info form the feed, compare with default setting
						if (linkTimezone != unescape(timeZone))	{
							timeZone = encodeURIComponent(linkTimezone);
							timeZone = timeZone.replace(/\-/,'%2D');					
						}
					}
					// Get string for next day, be careful the end of the month.
					var postMonth = postDateFull.substr(5,2);
					if (postDay==Calendar.month_days[parseInt(postMonth,10)-1])	{
						var nextDay = postDateFull.substr(0,4) +'-'+ (parseInt(postMonth,10)+1) + '-01';
						if (nextDay.length < 10)
							nextDay = nextDay.substr(0,5) + '0' + nextDay.substr(5,5);
					}
					else	{
						var nextDay = postDateFull.substr(0,8) + (parseInt(postDay,10)+1);
						if (nextDay.length < 10)
							nextDay = nextDay.substr(0,8) + '0' + nextDay.substr(8,1);
					}				
					linkTagURL = 'http://' + Calendar.base +'/search?updated-min='+postDateFull+'T00%3A00%3A00'+timeZone+'&updated-max='+nextDay+'T00%3A00%3A00'+timeZone+'&max-results=2';
				}
				else
					// increase the value
					linkTagURL = linkTagURL.replace(/(max-results=)(\d+)/i,'$1'+ (cur_index[2]*1 + 1));
				// Store the HREF attribute into A element
				linkTag.setAttribute('href',linkTagURL);
				// Now let's deal with  titles
				linkTag.setAttribute('title', postTitle + ', \n' + linkTag.getAttribute('title'));
				continue;
			}
			tempsave = postDay;
			theCell.innerHTML ='<a href='+entries[i].link[titleLinkIdx].href+' title="'+ postTitle.replace(/\"/g,'&#34;') +'">'+ theCell.innerHTML +'</a>';
			theCell.className = 'Linkday';
		}
	}
	if(json.feed.openSearch$totalResults.$t*1 > 35) {// If you have more than 35 posts per month, this will take care of it. 
		if  (!Calendar.listMode)
			fetchposts(postDateFull.substr(0,4)*1,postMonth*1,json.feed.openSearch$startIndex.$t*1+35,'cal');
		else
			fetchposts(postDateFull.substr(0,4)*1,postMonth*1,json.feed.openSearch$startIndex.$t*1+35,'list');
	}
	else // Return control if all posts have been fetch correctly. 
		Calendar.gainControl();
}

/* ==================================
	Draw a new table when first load
=====================================  */
function drawTable()	{
	// First create caption element
	var tableCaption = document.createElement('div');
		tableCaption.setAttribute('id','CalendarCaption');
	// Create dropdown menu
	// First is the month list
	var faketableMonth = '<div id="monthTable" style="z-index:999;background-color:'+Calendar.tableColor+';">';
 	for (var i=0; i < 12 ; i++)	{
		faketableMonth += '<a href="javascript:Calendar.monthTable('+ i +');">'+ Calendar.month_label_real[i]+'</a><br>';
	}
	faketableMonth += '</div>';
	//  Then the year input text
	var yearSelect = '<div id="yearSelect"><form name="form2year" onsumbit="javascript:return false;" action="">';
		yearSelect += '<input style="width:4em;z-index:999;" class="yearInput" type="text" value="'+ Calendar.cur_day.getFullYear() +'" name="enteryear" onkeypress="if(event.keyCode==13||event.which == 13) {Calendar.yearTable(this.value); return false;}" /></form></div>';
	// Create caption message
	var link = '<table align="center"></tbody><tr><td><a href="javascript:void(0);">&lt;&lt;&nbsp;&nbsp;</a></td>';
		link += '<td style="text-align:center;width:70%"><span id="CalendarMonth"><span id="monthTable_parent"></span>&nbsp;&nbsp;&nbsp;';
		link += '<span id="yearSelect_parent"></span></span></td>';
		link += '<td><a href="javascript:void(0);">&nbsp;&nbsp;&gt;&gt;</a></td></tr></tbody></table>';
		link += faketableMonth + yearSelect;
	tableCaption.innerHTML = link;		
	// Create table element
	var cell = document.createElement('div');
		cell.setAttribute('id','CalendarTable');
	//Create footer element
	var footer = document.createElement('div'); 
		footer.setAttribute('id','CalendarFooter');
		footer.style.textAlign = 'left';
	// Create footer message
	var msg = '<a href="javascript:Calendar.cur_day.setTime(Calendar.today);Calendar.refreshTable();" id ="Today" class="Today">'+ Calendar.todayMsg +'</a>&nbsp;&nbsp;';
		msg += '<span id="todayShow">' + Calendar.month_label[Calendar.cur_day.getMonth()] + '/';
		if (Calendar.cur_day.getDate().toString().length < 2)
			msg += '0'+Calendar.cur_day.getDate();
		else
			msg += Calendar.cur_day.getDate();
		msg += '/' + Calendar.cur_day.getFullYear() + '</span>';
		msg += '<span id="showTOC">&nbsp;&nbsp;<a href ="javascript:Calendar.toggleTOC();">' + Calendar.showTOC[0] +'</a>&nbsp;&nbsp;</span>';
		msg += '<span id="CalLoading">'+Calendar.loading+'</span>';
		footer.innerHTML = msg; // Now put something into the footer
	// Now put the whole table into "blogCalendar" container
	var calendarDiv = document.getElementById('blogCalendar');
	calendarDiv.style.textAlign = 'center';
	calendarDiv.appendChild(tableCaption);
	at_attach('monthTable_parent', 'monthTable', 'click', 'y', 'pointer');
	at_attach('yearSelect_parent', 'yearSelect', 'click', 'y', 'pointer');
	//document.getElementById('monthTable').style.display = 'inline';
	//document.getElementById('yearSelect').style.display = 'inline';
	calendarDiv.appendChild(cell);
	if (Calendar.alignFooter){ // Align the footer with tableCaption
		var dist = tableCaption.getElementsByTagName('table')[0].offsetLeft - tableCaption.offsetLeft;
		footer.style.paddingLeft = dist+'px';
	}		
	calendarDiv.appendChild(footer);
	// Parameter need to be correct  http://www.fileformat.info/info/unicode/char/search.htm?q=-&preview=entity
	if (Calendar.timeZone.length < 4 && Calendar.timeZone!='Z') 
		Calendar.timeZone = Calendar.timeZone+ ':00';
	Calendar.timeZone = encodeURIComponent(Calendar.timeZone);
	Calendar.timeZone = Calendar.timeZone.replace(/\-/,'%2D');
	Calendar.refreshTable(); // Now flesh Table
}

/* ==========================================
	Reflesh table, putting information into table
=============================================  */
function refreshTable()	{
	var theMonth = Calendar.cur_day.getMonth();
	var theYear = Calendar.cur_day.getFullYear();	
	document.getElementById('monthTable_parent').innerHTML = Calendar.month_label_real[theMonth];
	document.getElementById('yearSelect_parent').innerHTML = theYear;
	Calendar.cur_day.setDate(1);
	if  (!Calendar.listMode)
		document.getElementById('CalendarTable').innerHTML = Calendar.Calendar(Calendar.cur_day);
	if (Calendar.today >= Calendar.cur_day)	{			
		var cellArray = document.getElementById('CalendarCaption').getElementsByTagName('a'); // cancal link
			cellArray[0].setAttribute('href', 'javascript:void(0)');
			cellArray[1].setAttribute('href', 'javascript:void(0)');
		var footerArray = document.getElementById('CalendarFooter').getElementsByTagName('*'); // remove footer info and show laoding image
		for(var i = 0; i < footerArray.length; i++)	{
			if (footerArray[i].getAttribute('id') == 'CalLoading')
				footerArray[i].style.display = 'inline';
			else if (footerArray[i].getAttribute('id') != null)
				footerArray[i].style.display = 'none';				
		}
		//if (Calendar.listMode)
			//Calendar.fetchposts(theYear,theMonth,1);
		//else
		if(/Safari/i.test(navigator.userAgent)){ //Test for Safari
		  var _timer=setInterval(function(){
		  if(/loaded|complete/.test(document.readyState)){
			clearInterval(_timer);
			Calendar.alreadyrunflag=1;
			Calendar.fetchposts(theYear,theMonth,1); // call target function
		  }}, 10);
		}
		else
			Calendar.fetchposts(theYear,theMonth,1);
	}
	else {
		if (document.getElementById('TOCTable') != null)
			document.getElementById('TOCTable').innerHTML = '';
		
	}	
}

function toggleTOC() {
	if (!Calendar.listMode)	{
		Calendar.listMode = true;
		document.getElementById('showTOC').innerHTML = '&nbsp;&nbsp;<a href ="javascript:Calendar.toggleTOC();">' + Calendar.showTOC[1] +'</a>&nbsp;&nbsp;';
		var cell = document.getElementById('CalendarTable');
		var tableProp = cell.getElementsByTagName('table')[0];
		var tHeight = tableProp.offsetHeight;
		var TOC_Content = '<div id="TOCScroll"><table id="TOCTable" style="width:'+ tableProp.offsetWidth + 'px;"></table></div>';
		cell.innerHTML = TOC_Content;
		var scroll = document.getElementById('TOCScroll');
		scroll.style.overflow = 'auto';
		scroll.style.height = tHeight;		
		Calendar.refreshTable();
	}
	else {
		Calendar.listMode = false;
		document.getElementById('showTOC').innerHTML = '&nbsp;&nbsp;<a href ="javascript:Calendar.toggleTOC();">' + Calendar.showTOC[0] +'</a>&nbsp;&nbsp;';
		Calendar.refreshTable();
	}
}

function drawTOCTable(json){
	var TOC = document.getElementById('TOCScroll');
	var TOC_Content =  '<table id="TOCTable" style="text-align:left;width:'+ document.getElementById('TOCTable').offsetWidth + 'px;" align="center" cellspacing="0">';
	var entries = json.feed.entry;	
	if (entries != undefined)	{
		TOC_Content += '<thead><tr><th onclick="Calendar.sortTable(&#39;TOCTable&#39;,0)" style="cursor:pointer;text-align:center;">Title</th><th onclick="Calendar.sortTable(&#39;TOCTable&#39;,1,&#39;date&#39;)" style="cursor:pointer;text-align:center;">Date</th></tr></thead>';
		for (var i =0 ; i < entries.length; i++) {
			var postDateFull = entries[i].published.$t.substr(0,10);
			var postDay = postDateFull.substr(8,2);
			var postTitle = entries[i].title.$t;
			var postMonth = postDateFull.substr(5,2);
			var j = 0;
			while (j < entries[i].link.length && entries[i].link[j].rel!='alternate' ) // we search for the link we want
				j++;
			var titleLinkIdx = j;
			TOC_Content += '<tr><td><a href="' + entries[i].link[titleLinkIdx].href + '">' + postTitle +'</a></td><td>' + postMonth + '/' + postDay + '</td></tr>';
		}

	TOC_Content += '</table>';
	TOC.innerHTML = TOC_Content;
	sortTable('TOCTable',1,'date');
	}
	else {
		TOC_Content += '</table>';
		TOC.innerHTML = TOC_Content;
	}
	Calendar.gainControl();	


}

/*=========================
	Go to previous month
===========================*/
function PrevMonth() {//display previous month
	theMonth = Calendar.cur_day.getMonth()-1;
	year = Calendar.cur_day.getFullYear();
	if (theMonth<0)	{
		theMonth = 11;
		year--;
	}
	Calendar.cur_day.setFullYear(year,theMonth);
	Calendar.refreshTable();
}

/*====================
	Go to next month
======================*/
function NextMonth() {//display next month
	theMonth = Calendar.cur_day.getMonth()+1;
	year = Calendar.cur_day.getFullYear();
	if (theMonth>11)	{
		theMonth = 0;
		year++;
	}
	Calendar.cur_day.setFullYear(year,theMonth);
	Calendar.refreshTable();	
}

/* ====================================
	Go to specific month (selected table)
=======================================  */
function monthTable(month){
	Calendar.cur_day.setMonth(month);
	Calendar.refreshTable();
}

/* ==============================
	Go to specific year (input)
=================================  */
function yearTable(year){
	Calendar.cur_day.setYear(year);
	Calendar.refreshTable();
}

function gainControl(){
	var linkArray = document.getElementById('CalendarCaption').getElementsByTagName('a');
	linkArray[0].setAttribute('href', 'javascript:Calendar.PrevMonth();');
	linkArray[1].setAttribute('href', 'javascript:Calendar.NextMonth();');
	var footerArray = document.getElementById('CalendarFooter').getElementsByTagName('*');
	for(var k = 0; k < footerArray.length; k++)	{
		if (footerArray[k].getAttribute('id') == 'CalLoading')
			footerArray[k].style.display = 'none';
		else if (footerArray[k].getAttribute('id') != null)
			footerArray[k].style.display = 'inline';				
		}
}

// Adding new object
Calendar = new ArchiveCalendar();

// The following code are used for dropdown menu. I found it here:
//http://www.dynamicdrive.com/dynamicindex1/dropdowncontrol.htm

// Copyright (C) 2005-2008 Ilya S. Lyubinskiy. All rights reserved.
// Technical support: http://www.php-development.ru/
//
// YOU MAY NOT
// (1) Remove or modify this copyright notice.
// (2) Re-distribute this code or any part of it.
//     Instead, you may link to the homepage of this code:
//     http://www.php-development.ru/javascripts/dropdown.php
//
// YOU MAY
// (1) Use this code on your website.
// (2) Use this code as part of another product.
//
// NO WARRANTY
// This code is provided "as is" without warranty of any kind.
// You expressly acknowledge and agree that use of this code is at your own risk.


// ***** Popup Control *********************************************************

// ***** at_show_aux *****

function at_show_aux(parent, child)
{
  var p = document.getElementById(parent);  
  var c = document.getElementById(child );
  var top  = (c["at_position"] == "y") ? p.offsetHeight+2 : 0;
  var left = (c["at_position"] == "x") ? p.offsetWidth +2 : 0;
  for (; p; p = p.offsetParent) // loop stop at p == null, add offsetTop to each parent found, very clever.
  {
    top  += p.offsetTop;
    left += p.offsetLeft;
  }
	//top = 0;
	//left = 0;	
	
  c.style.position   = "fixed";
  c.style.top        = top +'px';
  c.style.left       = left+'px';
  c.style.visibility = "visible";
}

// ***** at_show *****

function at_show()
{
  var p = document.getElementById(this["at_parent"]);
  var c = document.getElementById(this["at_child" ]);

  at_show_aux(p.id, c.id);
  clearTimeout(c["at_timeout"]);
}

// ***** at_hide *****

function at_hide()
{
  var p = document.getElementById(this["at_parent"]);
  var c = document.getElementById(this["at_child" ]);
  c["at_timeout"] = setTimeout("document.getElementById('"+c.id+"').style.visibility = 'hidden'", 333);
}

// ***** at_click *****

function at_click()
{
  var p = document.getElementById(this["at_parent"]);
  var c = document.getElementById(this["at_child" ]);

  if (c.style.visibility != "visible") at_show_aux(p.id, c.id); else c.style.visibility = "hidden";
  return false;
}

// ***** at_attach *****

// PARAMETERS:
// parent   - id of the parent html element
// child    - id of the child  html element that should be droped down
// showtype - "click" = drop down child html element on mouse click
//            "hover" = drop down child html element on mouse over
// position - "x" = display the child html element to the right
//            "y" = display the child html element below
// cursor   - omit to use default cursor or specify CSS cursor name

function at_attach(parent, child, showtype, position, cursor)
{
  var p = document.getElementById(parent);
  var c = document.getElementById(child);
  p["at_parent"]     = p.id;
  c["at_parent"]     = p.id;
  p["at_child"]      = c.id;
  c["at_child"]      = c.id;
  p["at_position"]   = position;
  c["at_position"]   = position;

  c.style.position   = "absolute";
  c.style.visibility = "hidden";

  	var formtest = c.childNodes;
	for (var i = 0 ; i < formtest.length ; i++){
		if (formtest[i].nodeName=='FORM')
			break;
	}
  
  if (cursor != undefined) p.style.cursor = cursor;

  switch (showtype)
  {
    case "click":
      p.onclick     = at_click;
	  p.onmouseout  = at_hide;
      c.onmouseover = at_show;
	  if (i == formtest.length)
		c.onmouseout  = at_hide;
      break;
    case "hover":
      p.onmouseover = at_show;
      p.onmouseout  = at_hide;
      c.onmouseover = at_show;
	  if (i == formtest.length)
		c.onmouseout  = at_hide;
      break;
  }
}

// Table sorting 
function sortTable(sTableID, iCol, sDataType) {
    function convert(sValue, sDataType) {
        switch(sDataType) {
            // case "int":
				// return parseInt(sValue);
            // case "float":
                // return parseFloat(sValue);
            case "date":
                return new Date(Date.parse(sValue+'/2000'));
            default:
				return sValue.toString();                
			}
	}
    function generateCompareTRs(iCol, sDataType) {
		return  function compareTRs(oTR1, oTR2) {
		var tValue1 = oTR1.cells[iCol].firstChild;
		var tValue2 = oTR2.cells[iCol].firstChild;
					if (sDataType == 'date') {
						vValue1 = convert(tValue1.nodeValue, sDataType);
						vValue2 = convert(tValue2.nodeValue, sDataType);
					}
					else {
						vValue1 = convert(tValue1.innerHTML, sDataType);
						vValue2 = convert(tValue2.innerHTML, sDataType);
					}
					if (vValue1 < vValue2)
						return -1;
					else if (vValue1 > vValue2)
						return 1;
					else
						return 0;
				};
	}
		
	var oTable = document.getElementById(sTableID);
	var oTBody = oTable.tBodies[0];
	var colDataRows = oTBody.rows;
	var aTRs = new Array;
	for (var i=0; i < colDataRows.length; i++) {
		aTRs[i] = colDataRows[i];
	}        
	if (oTable.sortCol == iCol)
		aTRs.reverse();
	else
		aTRs.sort(generateCompareTRs(iCol, sDataType));
	var oFragment = document.createDocumentFragment();
	for (var i=0; i < aTRs.length; i++) {
		oFragment.appendChild(aTRs[i]);
	}       
	oTBody.appendChild(oFragment);
	oTable.sortCol = iCol;
}