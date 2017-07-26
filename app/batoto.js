//Comment Test?
var Nightmare = require('nightmare');
var mangaDB = require('../config/mangaDB.js')
var mangaUserDB = require('../config/mangaUserDB.js')
var configAuth = require('../config/auth');
var Q = require('q')

var debug = require('debug')('Muri:Batoto')  

//Used to setup nightmare with default settings
var setupNightmare = function() {
	debug('setupNightmare');
	var nightmare = Nightmare({
		show: false,
		typeInterval: 20,
	webPreferences: {
        images: false,
        partition: 'persist: batoto'
    },
	})
	return nightmare;
}

//Logins into bato.to
var firstLogin = function() {
	debug('firstLogin');
	var nightmare = Nightmare({
		show: false,
		typeInterval: 20,
		webPreferences: {
			images: false,
			partition: 'persist: batoto'
		}
	})
	nightmare
		.goto('https://bato.to/forums/index.php?app=core&module=global&section=login')
		.wait('input#ips_username')
		.type('input#ips_username', configAuth.batoto.login)
		.type('input#ips_password', configAuth.batoto.pass)
		.click('form#login > fieldset.submit:nth-child(5) > input.input_submit:nth-child(1)')
		.wait('#user_link')
		.evaluate(function () {
			return document.querySelector('#user_link').innerText;
		})
		.end(function(result) {
			console.log("firstLogin was successful: " + result);
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
	});
}

var batotoDateParser = function(date) {
	debug('batotoDateParser');
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

//Function for getting all neccessary information from a mangaChapter 
var getMangaChapterPages = function(mangaChapterUrl, cb) {
	debug('getMangaChapterPages');
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
				//console.log('What was inside');
				console.log(result);
				cb(result);
				//getChapters('http://kissmanga.com/Manga/Rough-Sketch-Senpai');
			})
			.catch(function (error) {
				console.error('Search Failed: ', error);
			});
}

// Sets up nightmare to parse entire bato.to manga database
var updateBatotoFullMangaDatabase = function() {
	debug('updateBatotoFullMangaDatabase');
	var nightmare = setupNightmare();
	var page = 1;
	nightmare
		.goto('https://bato.to/search?&p=' + page)
		.then(function(result) {
			if(result.code == 200) {
				return nightmare
					.exists('#comic_search_results table tbody tr td')
					.evaluate(function() {
						return document.querySelector('#comic_search_results table tbody tr td').innerText;
					})
					.then(function(result) {
						if(result == "No (more) comics found!") {
							console.log('Updated Master Manga Database completed @' + new Date);
							return nightmare.end();
						}
						else {
							console.log("Page: " + page + " is valid");
							queryPage(nightmare, page);
						}
					})
					.catch(function (err) {
						console.log('updateBatotoFullMangaDatabase failed: ' + err);
					})
			}
			else {
				console.log("seems to have found a snag on page: " + page + " This:" + result.code);
				return checkPageValidity(nightmare, page);
			}

		})
		.catch(function (err) {
			console.log('updateBatotoFullMangaDatabase failed2: ' + err);
		})
		
	}
//Checks to see if page loaded properly, otherwise calls back to itself to try again
var checkPageValidity = function(nightmare, page) {
	debug('checkPageValidity');
	nightmare
		.goto('https://bato.to/search?&p=' + page)
		.then(function(result) {
			if(result.code == 200) {
				return nightmare
					.exists('#comic_search_results table tbody tr td')
					.evaluate(function() {
						return document.querySelector('#comic_search_results table tbody tr td').innerText;
					})
					.then(function(result) {
						if(result == "No (more) comics found!") {
							console.log('Completed updateBatotoFullMangaDatabase @ ' + new Date)
							return nightmare.end();
						}
						else {
							console.log("Page: " + page + " is valid");
							queryPage(nightmare, page);
						}
					})
					.catch(function(err) {
						console.log('checkPageValidity failed: ' + err);
					})
			}
			else {
				console.log("seems to have found a snag on page: " + page + " This:" + result.code);
				checkPageValidity(setupNightmare(), page);
				return nightmare.end();
			}
		})
		.catch(function (err) {
			console.log('checkPageValidity failed2: ' + err);
		})
}
// Scans page, and saves all relavant data
var queryPage = function(nightmare, page) {
	debug('queryPage');
	nightmare
		.evaluate(function() {
			var returnValue = {};
			var fullList = document.querySelectorAll('#comic_search_results table tbody tr');
			for(var i = 0; i < (fullList.length - 1);i++) {
				if(i % 2) {
					var mangaTitle= fullList[i].querySelectorAll('td')[0].querySelectorAll('a')[1].innerText;
					var href = fullList[i].querySelectorAll('td')[0].querySelectorAll('a')[1].href.split('/_/')[1];
					//var href = chapters.querySelectorAll('td')[0].querySelector('a').href;
					var auth = fullList[i].querySelectorAll('td')[1].innerText;
					var date = fullList[i].querySelectorAll('td')[5].innerText;
					returnValue[href] = {mName: mangaTitle, author: auth, date: date};
				}
			}
			return returnValue;
		})
		.then(function(result) {
			var mangalist = [];
			for (var key in result) {
				var mangaUrl = key;
				var tmp = result[key];
				var mangaName = tmp['mName'];
				var mangaName = mangaName.trim();
				//console.log("MangaName: " , mName);
				var author = tmp['author'];
				var date = tmp['date'];
				//console.log("Date:" + date);
				if(date != '--') {
					var newDate = batotoDateParser(date);
					mangalist.push( { mangaUrl: mangaUrl, mangaName: mangaName, author: author , lastUpdated: newDate});
				}
				else mangalist.push( { mangaUrl: mangaUrl, mangaName: mangaName, author: author });
			}
			//console.log("Manga List is:" + mangalist);
			mangaDB.newMangaEntry(mangalist);
		})
		.then(function() {
			checkPageValidity(nightmare, ++page);
		})
		.catch(function(err) {
			console.log('queryPage failed: ' + err)
		})
}

//Gets a complete list of mangas users have favorited and then feeds them into getMangaInfo
var updateBatotoUserMangaDatabase = function(cb) {
	debug('updateBatotoUserMangaDatabase');
	mangaUserDB.getUserChaptersDB()
	.then(function(mangaList) {
		//console.log(mangaList);
		var nightmare = setupNightmare();
		getMangaInfo(mangaList, nightmare, cb);
	})
}
//Gets manga information Live
var getMangaInfoLive = function(mangaUrl, cb) {
	debug('getMangaInfoLive');
		var nightmare = setupNightmare();
		getMangaInfo([mangaUrl], nightmare, cb);
}
//Gets the neccessary data from the manga
var getMangaInfo = function( mangaList, nightmare, cb) {
	debug('getMangaInfo');
	if(mangaList.length > 0) {
		nightmare
			.goto("http://bato.to/comic/_/comics/" + mangaList[0])
			.then(function(result) {
				if(result.code == 200) {
					return nightmare
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
							var desc = document.querySelectorAll('table.ipb_table')[0].querySelectorAll('td')[13].innerText;
							var mangaImageUrl = document.querySelector('div.ipsBox div div img').src;
							returnValue['mangaInfo'] = {altnames: altnames, author: author, artist: artist, genre: genre, desc: desc, mangaImageUrl: mangaImageUrl};

							var fullList = document.querySelectorAll('tr.lang_English');
							var reverse = fullList.length - 1;
							var tmpLastUpdated = new Date(0);
							var tmpLastChapter = '';
							var tmpLastChapterUrl = '';
							//prepares all chapters into an object
							for(var i = 0; i < fullList.length; i++) {
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
								if(date.split(' ')[1][0] == 'h') {
									if(date.split(' ')[0][0] == 'A') {
										tmpDate.setDate(tmpDate.getDate() - .042);
										date = tmpDate;
									}
									else {
										tmpDate.setDate(tmpDate.getDate() - (date.split(' ')[0][0] * .042));
										date = tmpDate;
									}
								}
								// A/# day ago
								else if(date.split(' ')[1][0] == 'd') {
									if(date.split(' ')[0][0] == 'A') {
										tmpDate.setDate(tmpDate.getDate() - 1);
										date = tmpDate;
									}
									else {
										tmpDate.setDate(tmpDate.getDate() - date.split(' ')[0][0]);
										date = tmpDate;
									}
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
									var year = split[2];
									var time = split[4].split(':');
									var hour = time[0];
									if(hour[0] == 0) hour = hour[1];
									var minute = time[1];
									if(minute[0] == 0) minute = minute[1];
									var ampm = split[5];
									if(ampm == 'PM') {
										if(hour != 12)	hour = parseInt(hour) + 12;
									}
									date = new Date(year, month, day, hour, minute);
								}
								if( date > tmpLastUpdated) {
									tmpLastUpdated = date;
									tmpLastChapter = cName;
									tmpLastChapterUrl = href;
								}
								returnValue[i] = {chapterUrl: href, chapterName: cName, sort: sort, date: date};
							};
							returnValue['lastUpdated'] = tmpLastUpdated;
							returnValue['lastChapter'] = tmpLastChapter;
							returnValue['lastChapterUrl'] = tmpLastChapterUrl;
							return returnValue;
						})
						.then(function(result) {
							result['mangaUrl'] = mangaList[0];
							mangaDB.updateMangaEntry(result)
							.then(function(manga) {
								mangaList.shift();
								if(mangaList.length == 0) {
									cb(manga);
								}
								getMangaInfo(mangaList, nightmare, cb);
								//return nightmare.end();
							})
							
						})
						.catch(function (error) {
							console.error('Search Failed: ', error);
						});
				}
				else {
					console.log("Seems to have found a snag on page: " + page + " This:" + result.code);
					getMangaInfo(setupNightmare(), page, cb);
					return nightmare.end();
				}
			})
	}
	else {
		return nightmare.end(function() {
			console.log("Reached the end of the run")
		});
	}
}

exports.firstLogin = firstLogin;
exports.getMangaChapterPages = getMangaChapterPages;
exports.updateBatotoFullMangaDatabase = updateBatotoFullMangaDatabase;
exports.updateBatotoUserMangaDatabase = updateBatotoUserMangaDatabase;
exports.getMangaInfoLive = getMangaInfoLive;
