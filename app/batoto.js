var Nightmare = require('nightmare');
var mangaDB = require('../config/mangaDB.js')
var configAuth = require('../config/auth');
var Q = require('Q')

var setupNightmare = function() {
	var nightmare = Nightmare({
		show: false,
		typeInterval: 20,
		openDevTools: {
    mode: 'detach'
  	},
	webPreferences: {
        images: false,
        partition: 'persist: batoto'
    },
	})
	return nightmare;
}

//

var login = function(callback) {
	var nightmare = setupNightmare();
	nightmare
		.goto('https://bato.to/')
		.wait(2000)
		.goto('https://bato.to/forums/index.php?app=core&module=global&section=login')
		.wait('input#ips_username')
		.type('input#ips_username', configAuth.batoto.login)
		.type('input#ips_password', configAuth.batoto.pass)
		.click('form#login > fieldset.submit:nth-child(5) > input.input_submit:nth-child(1)')
		.wait('#user_link')
		.evaluate(function () {
		})
		.then(function(result) {
			return nightmare;
		})
		.catch(function (error) {
			console.error('Search failed: ', error);
	});
	return nightmare;
}
/*
*
*/
var getMangaInfoAndChapters = function(mangaUrl) {
	console.log('batoto.js get Chapters');
	var nightmare = login();
	nightmare
		.wait(5000)
		.wait('#user_link')
		.goto(mangaUrl)
		.wait('h3.maintitle')
		.exists('tr.lang_English')
		.evaluate(function() {
			var returnValue = {};
			var altnames = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[1].innerText;
			var author = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[3].innerText;
			var artist = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[5].innerText;
			var tmpgenre = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[7].querySelectorAll('img');
			var genre = [];
			for(var i = 0; i < (tmpgenre.length - 1); i++) {
				genre[i] = tmpgenre[i].alt;
			}
			//genre = genre.split(' ');
			//genre.shift();
			var desc = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[13].innerText;
			var mangaImageUrl = document.querySelector('div.ipsBox div div img').src;


			returnValue['mangaInfo'] = {altnames: altnames, author: author, artist: artist, genre: genre, desc: desc, mangaImageUrl: mangaImageUrl};

			var fullList = document.querySelectorAll('tr.lang_English');
			var reverse = fullList.length - 1;
			for(var i = 0; i < fullList.length; i++) {
			//for(var i = (fullList.length - 1); i > 0; i--) {
				var chapters = fullList[reverse--];
				var href = chapters.querySelectorAll('td')[0].querySelector('a').href;
				href = href.split('#')[1];
				var cName = chapters.querySelectorAll('td')[0].querySelector('a').innerText;
				cName = cName.trim();
				var sort = chapters.querySelectorAll('td')[0].querySelector('a').title.split('|')[1].split(':')[1].split(' ')[1];
				var date = chapters.querySelectorAll('td')[4].innerText.split('[A]')[0].trim();
				//Insert Date parsing here
				// An/# hour ago
				var tmpDate = new Date();
				//console.log('Current date/time' + tmpDate);
				if(date.split(' ')[1][0] == 'h') {
					//console.log('Modifying Hour' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - .042);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * .042));
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// A/# day ago
				else if(date.split(' ')[1][0] == 'd') {
					//console.log('Modifying day' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - 1);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - date.split(' ')[0][0]);
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// A/# Week ago
				else if(date.split(' ')[1][0] == 'w') {
					//console.log('Modifying week' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - 7);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * 7));
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// Today, ##:##
				else if(date.split(' ')[0][0] == 'T') {
					date = new Date;
				}
				//Deal with proper date here
				else {
					//console.log("Attempting to Make Date object");
					//console.log(date);
					var split = date.split(' ');
					var day = split[0];
					if(day[0] == 0) day = day[1];
					//console.log("Day:" + day);
					var month = split[1];
					if(month == 'January') month = 0;
					else if(month == 'February') month = 1;
					else if(month == 'March') month = 2;
					else if(month == 'April') month = 3;
					else if(month == 'May') month = 4;
					else if(month == 'June') month = 5;
					else if(month == 'July') month = 6;
					else if(month == 'August') month = 7;
					else if(month == 'September') month = 8;
					else if(month == 'October') month = 9;
					else if(month == 'November') month = 10;
					else if(month == 'December') month = 11;
					//console.log("Month:" + month);
					var year = split[2];
					//console.log("Year:" + year);
					var time = split[4].split(':');
					var hour = time[0];
					if(hour[0] == 0) hour = hour[1];
					//console.log("Hour:" + hour);
					var minute = time[1];
					if(minute[0] == 0) minute = minute[1];
					//console.log("Minute:" + minute);
					var ampm = split[5];
					if(ampm == 'PM') {
						if(hour != 12)	hour = parseInt(hour) + 12;
					}
					//console.log("Hour:" + hour);
					date = new Date(year, month, day, hour, minute);
					//console.log("Final Date");
					//console.log(date);
				}
				returnValue[i] = {chapterUrl: href, chapterName: cName, sort: sort, date: date};
			};
			return returnValue;
		})
		.then(function(result) {
			result['mangaUrl'] = mangaUrl.split('/')[5];
			//console.log(result);
			mangaDB.updateMangaEntry(result)
			.then(function(manga) {
				console.log('After');
				console.log(manga);
			})

		})
		.catch(function (error) {
			console.error('Search Failed: ', error);
		});
}

var getMangaInfoAndChaptersLive = function(mangaUrl, cb) {
	console.log('batoto.js get Chapters');
	var nightmare = setupNightmare();
	/*
	.goto('https://bato.to')
		.wait()
		.goto('https://bato.to/forums/index.php?app=core&module=global&section=login')
		.wait('input#ips_username')
		.type('input#ips_username', 'anonjoosh')
		.type('input#ips_password', '4311')
		.click('form#login > fieldset.submit:nth-child(5) > input.input_submit:nth-child(1)')
		.wait('#user_link')
	*/
	nightmare
		.goto(mangaUrl)
		.wait('h3.maintitle')
		.exists('tr.lang_English')
		.evaluate(function() {
			var returnValue = {};
			var altnames = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[1].innerText;
			var author = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[3].innerText;
			var artist = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[5].innerText;
			var tmpgenre = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[7].querySelectorAll('img');
			var genre = [];
			for(var i = 0; i < (tmpgenre.length - 1); i++) {
				genre[i] = tmpgenre[i].alt;
			}
			//genre = genre.split(' ');
			//genre.shift();
			var desc = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[13].innerText;
			var mangaImageUrl = document.querySelector('div.ipsBox div div img').src;


			returnValue['mangaInfo'] = {altnames: altnames, author: author, artist: artist, genre: genre, desc: desc, mangaImageUrl: mangaImageUrl};

			var fullList = document.querySelectorAll('tr.lang_English');
			var reverse = fullList.length - 1;
			for(var i = 0; i < fullList.length; i++) {
			//for(var i = (fullList.length - 1); i > 0; i--) {
				var chapters = fullList[reverse--];
				var href = chapters.querySelectorAll('td')[0].querySelector('a').href;
				href = href.split('#')[1];
				var cName = chapters.querySelectorAll('td')[0].querySelector('a').innerText;
				cName = cName.trim();
				var sort = chapters.querySelectorAll('td')[0].querySelector('a').title.split('|')[1].split(':')[1].split(' ')[1];
				var date = chapters.querySelectorAll('td')[4].innerText.split('[A]')[0].trim();
				//Insert Date parsing here
				// An/# hour ago
				var tmpDate = new Date();
				//console.log('Current date/time' + tmpDate);
				if(date.split(' ')[1][0] == 'h') {
					//console.log('Modifying Hour' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - .042);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * .042));
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// A/# day ago
				else if(date.split(' ')[1][0] == 'd') {
					//console.log('Modifying day' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - 1);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - date.split(' ')[0][0]);
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// A/# Week ago
				else if(date.split(' ')[1][0] == 'w') {
					//console.log('Modifying week' + date);
					if(date.split(' ')[0][0] == 'A') {
						tmpDate.setDate(tmpDate.getDate() - 7);
						date = tmpDate;
					}
					else {
						tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * 7));
						date = tmpDate;
					}
					//console.log('The New date is ' + date);
				}
				// Today, ##:##
				else if(date.split(' ')[0][0] == 'T') {
					date = new Date;
				}
				//Deal with proper date here
				else {
					//console.log("Attempting to Make Date object");
					//console.log(date);
					var split = date.split(' ');
					var day = split[0];
					if(day[0] == 0) day = day[1];
					//console.log("Day:" + day);
					var month = split[1];
					if(month == 'January') month = 0;
					else if(month == 'February') month = 1;
					else if(month == 'March') month = 2;
					else if(month == 'April') month = 3;
					else if(month == 'May') month = 4;
					else if(month == 'June') month = 5;
					else if(month == 'July') month = 6;
					else if(month == 'August') month = 7;
					else if(month == 'September') month = 8;
					else if(month == 'October') month = 9;
					else if(month == 'November') month = 10;
					else if(month == 'December') month = 11;
					//console.log("Month:" + month);
					var year = split[2];
					//console.log("Year:" + year);
					var time = split[4].split(':');
					var hour = time[0];
					if(hour[0] == 0) hour = hour[1];
					//console.log("Hour:" + hour);
					var minute = time[1];
					if(minute[0] == 0) minute = minute[1];
					//console.log("Minute:" + minute);
					var ampm = split[5];
					if(ampm == 'PM') {
						if(hour != 12)	hour = parseInt(hour) + 12;
					}
					//console.log("Hour:" + hour);
					date = new Date(year, month, day, hour, minute);
					//console.log("Final Date");
					//console.log(date);
				}
				returnValue[i] = {chapterUrl: href, chapterName: cName, sort: sort, date: date};
			};
			return returnValue;
		})
		.end(function(result) {
			result['mangaUrl'] = mangaUrl.split('/')[5];
			//console.log(result);
			mangaDB.updateMangaEntry(result)
			.then(function(manga) {
				cb(manga);
			})

		})
		.catch(function (error) {
			console.error('Search Failed: ', error);
		});
}

var batotoUrlParser = function(url) {

}

var batotoDateParser = function(date) {
	//Insert Date parsing here
	// An/# hour ago
	var tmpDate = new Date();
	//console.log('Current date/time' + tmpDate);
	if(date.split(' ')[1][0] == 'h') {
		//console.log('Modifying Hour' + date);
		if(date.split(' ')[0][0] == 'A') {
			tmpDate.setDate(tmpDate.getDate() - .042);
			date = tmpDate;
		}
		else {
			tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * .042));
			date = tmpDate;
		}
		//console.log('The New date is ' + date);
	}
	// A/# day ago
	else if(date.split(' ')[1][0] == 'd') {
		//console.log('Modifying day' + date);
		if(date.split(' ')[0][0] == 'A') {
			tmpDate.setDate(tmpDate.getDate() - 1);
			date = tmpDate;
		}
		else {
			tmpDate.setDate(tmpDate.getDate() - date.split(' ')[0][0]);
			date = tmpDate;
		}
		//console.log('The New date is ' + date);
	}
	// A/# Week ago
	else if(date.split(' ')[1][0] == 'w') {
		//console.log('Modifying week' + date);
		if(date.split(' ')[0][0] == 'A') {
			tmpDate.setDate(tmpDate.getDate() - 7);
			date = tmpDate;
		}
		else {
			tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * 7));
			date = tmpDate;
		}
		//console.log('The New date is ' + date);
	}
	// Today, ##:##
	else if(date.split(' ')[0][0] == 'T') {
		date = new Date;
	}
	//Deal with proper date here
	else {
		//console.log("Attempting to Make Date object");
		//console.log(date);
		var split = date.split(' ');
		var day = split[0];
		if(day[0] == 0) day = day[1];
		//console.log("Day:" + day);
		var month = split[1];
		if(month == 'January') month = 0;
		else if(month == 'February') month = 1;
		else if(month == 'March') month = 2;
		else if(month == 'April') month = 3;
		else if(month == 'May') month = 4;
		else if(month == 'June') month = 5;
		else if(month == 'July') month = 6;
		else if(month == 'August') month = 7;
		else if(month == 'September') month = 8;
		else if(month == 'October') month = 9;
		else if(month == 'November') month = 10;
		else if(month == 'December') month = 11;
		//console.log("Month:" + month);
		var year = split[2];
		//console.log("Year:" + year);
		var time = split[4].split(':');
		var hour = time[0];
		if(hour[0] == 0) hour = hour[1];
		//console.log("Hour:" + hour);
		var minute = time[1];
		if(minute[0] == 0) minute = minute[1];
		//console.log("Minute:" + minute);
		var ampm = split[5];
		if(ampm == 'PM') {
			if(hour != 12)	hour = parseInt(hour) + 12;
		}
		//console.log("Hour:" + hour);
		date = new Date(year, month, day, hour, minute);
		//console.log("Final Date");
		//console.log(date);
	}
	return date;
}


//asdf
var getMangaDatabase = function() {
	console.log('starting getMangaDatabase batoto');
	var nightmare = setupNightmare();
	nightmare
		.goto('https://bato.to/forums/index.php?app=core&module=global&section=login')
		.wait('input#ips_username')
		.type('input#ips_username', configAuth.batoto.login)
		.type('input#ips_password', configAuth.batoto.pass)
  	.click('form#login > fieldset.submit:nth-child(5) > input.input_submit:nth-child(1)')
		.wait('#user_link')
		.evaluate(function () {
		})
		.then(function(result) {
			var page = 183;
			getMangas(nightmare,'https://bato.to/search?&p=', page);
		})
		.catch(function (error) {
			console.error('Search failed: ', error);
		});

};

var getMangas = function(nightmare, mangaListUrl,  page) {
	console.log("Running for Page: " + page);
	nightmare
		.goto(mangaListUrl + page)
		.wait('#comic_search_results table tbody tr')
		.evaluate(function () {
			var returnValue = {};
			var fullList = document.querySelectorAll('#comic_search_results table tbody tr');
			for(var i = 0; i < (fullList.length - 1);i++) {
				if(i % 2) {
					var mangaTitle= fullList[i].querySelectorAll('td')[0].querySelectorAll('a')[1].innerText;
					var href = fullList[i].querySelectorAll('td')[0].querySelectorAll('a')[1].href;
					var auth = fullList[i].querySelectorAll('td')[1].innerText;
					var date = fullList[i].querySelectorAll('td')[5].innerText;
					returnValue[href] = {mName: mangaTitle, author: auth, date: date};
				}
			}
			return returnValue;
		})
		.then(function(result) {
			console.log("Running for Page: " + page);
			var mangalist = [];
			for (var key in result) {
				var url = key;
				var tmp = result[key];
				var mName = tmp['mName'];
				var mName = mName.trim();
				//console.log("MangaName: " , mName);
				var author = tmp['author'];
				var date = tmp['date'];
				//console.log("Date:" + date);
				if(date != '--') {
					var split = date.split(' ');
					var day = split[0];
					if(day[0] == 0) day = day[1];
					//console.log("Day:" + day);
					var month = split[1];
					if(month == 'January') month = 0;
					else if(month == 'February') month = 1;
					else if(month == 'March') month = 2;
					else if(month == 'April') month = 3;
					else if(month == 'May') month = 4;
					else if(month == 'June') month = 5;
					else if(month == 'July') month = 6;
					else if(month == 'August') month = 7;
					else if(month == 'September') month = 8;
					else if(month == 'October') month = 9;
					else if(month == 'November') month = 10;
					else if(month == 'December') month = 11;
					//console.log("Month:" + month);
					var year = split[2];
					//console.log("Year:" + year);
					var time = split[4].split(':');
					var hour = time[0];
					if(hour[0] == 0) hour = hour[1];
					//console.log("Hour:" + hour);
					var minute = time[1];
					if(minute[0] == 0) minute = minute[1];
					//console.log("Minute:" + minute);
					var ampm = split[5];
					if(ampm == 'PM') {
						if(hour != 12)	hour = parseInt(hour) + 12;
					}
					//console.log("Hour:" + hour);
					date = new Date(year, month, day, hour, minute)
					/*
					console.log("Final Date No mod: " + date);
					console.log("Final Date Asking for it json: " + date.toJSON());
					console.log("Final Date Asking for it gmt: " + date.toGMTString());
					console.log("Final Date Asking for it to string: " + date.toLocaleDateString());
					console.log("Final Date Asking for it utc: " + date.toUTCString());*/
					mangalist.push( { mangaUrl: key, mangaName: mName, author: author , lastUpdated: date});
				}
				else mangalist.push( { mangaUrl: key, mangaName: mName, author: author });
			}
			//console.log(mangalist);
			mangaDB.newMangaEntry(mangalist);
			getMangas(nightmare, mangaListUrl, ++page);
		})
		.catch(function (error) {
			nightmareEnd(nightmare);
			console.error('Search failed: ', error);
		});
}

var nightmareEnd = function(nightmare) {
	nightmare
		.end();
}



var getMangaChapterPages = function(mangaChapterUrl, cb) {
	//var nightmare = login();
	var nightmare = setupNightmare();
		nightmare
			.goto("http://bato.to/reader#" + mangaChapterUrl)
			.wait('img#comic_page')
			.evaluate(function() {
				var returnValue = {};
				var previousPage;
				if( document.querySelectorAll('div#reader div ul li a img')[0].title == 'Previous Chapter') {
					previousPage = document.querySelectorAll('div#reader div ul li a img')[0].parentNode.href;
				}
				else previousPage = false;
				var nextPage;
				if(previousPage) {
					if(document.querySelectorAll('div#reader div ul li a img')[2].title == 'Next Chapter') {
						nextPage = document.querySelectorAll('div#reader div ul li a img')[2].parentNode.href;
					}
					else nextPage = false;
				}
				else if(document.querySelectorAll('div#reader div ul li a img')[1].title == 'Next Chapter'){
					nextPage = document.querySelectorAll('div#reader div ul li a img')[1].parentNode.href;
				}
				else nextPage = false;

				var chapterName = document.getElementsByName("chapter_select")[0];



				returnValue['previousPage'] = previousPage;
				returnValue['nextPage'] = nextPage;
				returnValue['pagesCount'] = document.querySelector('select#page_select').length;
				returnValue['firstImage'] = document.querySelector('img#comic_page').src;
				returnValue['chapterName'] = chapterName.options[chapterName.selectedIndex].text;
				return returnValue;
			})
			.end(function(result) {
				console.log('What was inside');
				console.log(result);
				//return result;
				//nightmareEnd();
				cb(result);
				//getChapters('http://kissmanga.com/Manga/Rough-Sketch-Senpai');
			})
			.catch(function (error) {
				console.error('Search Failed: ', error);
			});



}

exports.login = login;
exports.getMangaInfoAndChapters = getMangaInfoAndChapters;
exports.getMangaInfoAndChaptersLive = getMangaInfoAndChaptersLive;
exports.getMangaDatabase = getMangaDatabase;
exports.getMangaChapterPages = getMangaChapterPages;
