var Nightmare = require('nightmare');
var mangaDB = require('../config/mangaDB.js')

var setupNightmare = function() {
	var nightmare = Nightmare({
		show: true,
		typeInterval: 20,
		openDevTools: {
    mode: 'detach'
  	},
		webPreferences: {
        images: false
    }
	})
	return nightmare;
}

var getChapters = function(mangaUrl) {
	var nightmare = setupNightmare();
	nightmare
		.goto(mangaUrl)
		.wait('table.listing')
		.evaluate(function() {
			var returnValue = {};
			var len = document.querySelectorAll('table.listing tr td a').length;
			for(var i = 0; i< len; i++) {
				var href = document.querySelectorAll('table.listing tr td a')[i].href;
				var name = document.querySelectorAll('table.listing tr td a')[i].innerText;
				returnValue[i] = {name: name, link: href};
			}
			return returnValue;
		})
		.then(function(result) {
			console.log(result)
		})
		.catch(function (error) {
			console.error('Search Failed: ', error);
		});
}
//asdf
var getMangaDatabase = function(mangaListUrl) {
	console.log('starting getMangaDatabase');
	var nightmare = setupNightmare();
	nightmare
		.goto(mangaListUrl)
		.wait(5000)
		.exists('div#leftside div.barContent table.listing tr.odd a')
		.evaluate(function () {
			//Trying to get the last page
			/*
			var returnValue = document.querySelectorAll('div#leftside div.pagination-left ul.pager li a');
			returnValue = returnValue[returnValue.length - 1];
			returnValue = returnValue.getAttribute("page");
			return returnValue;*/
		})
		.then(function(result) {
			getMangas(nightmare,mangaListUrl, 31, 100);
		})
		.catch(function (error) {
			console.error('Search failed: ', error);
		});

};

var getMangas = function(nightmare, mangaListUrl,  page, lastpage) {
	console.log("Running for Page: " + page);
	//if(page <= lastpage) {
	nightmare
		.goto(mangaListUrl + page)
		.wait('div#leftside > div.bigBarContainer:nth-child(1) > div.barContent:nth-child(2) > div:nth-child(5) > table.listing:nth-child(11) > tbody:nth-child(1) > tr.odd:nth-child(3) > td:nth-child(1) > a:nth-child(1)')
		.evaluate(function () {
			var returnValue = {};
			var len = document.querySelectorAll('table.listing td').length;
			//console.log("Length: " + len);
			for(var i = 0; i < len;) {
				var full = document.querySelectorAll('table.listing td')[i];
				var href = full.querySelector('a').href;
				var name = full.querySelector('a').innerText;
				returnValue[href] = name;
				i = i + 2;
			}
			return returnValue;
		})
		.then(function(result) {
			console.log("Running for Page: " + page);
			var mangalist = [];
			for (var key in result) {
				var url = key;
				var mName = result[key];
				mangalist.push( { mangaUrl: key, mangaName: mName });
				var tmp = {
					mangaUrl : key,
					mangaName : mName
				};

			}
			mangaDB.newMangaEntry(mangalist);
			getMangas(nightmare, mangaListUrl, ++page, lastpage);
		})
		.catch(function (error) {
			nightmareEnd(nightmare);
			console.error('Search failed: ', error);
		});
	//}
	/*
	else {
		nightmareEnd(nightmare);
	}*/
}

var nightmareEnd = function(nightmare) {
	nightmare
		.end();
}



var getMangaChapterPages = function(mangaChapterUrl) {
	var nightmare = setupNightmare();
	nightmare
		.goto(mangaChapterUrl)
		.wait('select#selectReadType')
		.select('select#selectReadType', 1)
		.wait('div#divImage > p:nth-child(2) > img:nth-child(1)')
		.evaluate(function() {
			var returnValue = {};
			var len = document.querySelectorAll('#divImage p img').length;
			for(var i = 0; i< len; i++) {
				var href = document.querySelectorAll('#divImage p img')[i].src;
				returnValue[i] = { link: href};
			}
			return returnValue;
		})
		.then(function(result) {
			console.log(result);
			getChapters('http://kissmanga.com/Manga/Rough-Sketch-Senpai');
		})
		.catch(function (error) {
			console.error('Search Failed: ', error);
		});
}

exports.getChapters = getChapters;
exports.getMangaDatabase = getMangaDatabase;
exports.getMangaChapterPages = getMangaChapterPages;
