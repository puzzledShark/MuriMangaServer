var cloudScraper = require('cloudscraper');
var cheerio = require('cheerio');

var getChapters = function(mangaUrl) {
	var returnValue = {};
	returnValue = cloudScraper.get(mangaUrl, function(error, response, body) {
		if (error) {
			console.log("Error trying to get chaptesr for: " + mangaUrl);
		}
		else {
			var chapterList = {};
			var $ = cheerio.load(body);
			var len = $('table.listing tr td a').length;
			var list = $('table.listing tr td a');
			for(var i = 0; i < len; i++) {
				chapterList[i] = {name: $(list[i]).attr('title'), link: $(list[i]).attr('href')};
			}
			console.log(chapterList);
		}
	});
};

var getMangaDatabase = function() {

};

var getMangaChapterPages = function(mangaChapterUrl) {
	var returnValue = {};
	var pages = "1";
	mangaChapterUrl = "http://kissmanga.com/Manga/Rough-Sketch-Senpai/Vol-001-Ch-001--Why-Does-It-Have-to-Be-Me-?id=344254";
	returnValue = cloudScraper.post(mangaChapterUrl, {selectReadType: 1}, function(error,response,body) {
		if (error) {
			console.log("Error trying to get chaptesr for: " + mangaUrl);
		}
		else {
			//console.log(body);
			var $ = cheerio.load(body);
			console.log(
				$('#imgCurrent')
			);
			/*
			var chapterList = {};
			var $ = cheerio.load(body);
			var len = $('table.listing tr td a').length;
			var list = $('table.listing tr td a');
			for(var i = 0; i < len; i++) {
				chapterList[i] = {name: $(list[i]).attr('title'), link: $(list[i]).attr('href')};
			}
			console.log(chapterList);
			*/
		}

	});
};




exports.getChapters = getChapters;
exports.getMangaDatabase = getMangaDatabase;
exports.getMangaChapterPages = getMangaChapterPages;
