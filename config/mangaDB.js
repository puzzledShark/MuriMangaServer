// load up the user model
var Manga  = require('../app/models/manga');
var Q = require('q');
var debug = require('debug')('Muri:MangaDB')  


var newMangaEntry = function(newManga) {
  debug('newMangaEntry');
  //console.log('Trying to insert ' + newManga.length + ' mangas');
  Manga.insertMany(newManga,{ ordered: false}, function(error, docs) {});

  /*
  Manga.findOne({ 'mangaUrl' : newManga.mangaUrl}, function(err, manga) {
    if(err)
      return false;
    if(manga) {
      console.log("Tried adding entry that already existed");
      return false;
    }
    else {
      //console.log('Trying to add new entry');
      //console.log(newManga.mangaUrl);
      //console.log(newManga.mangaName);
      var newMangaEntry = new Manga();
      newMangaEntry.mangaUrl = newManga.mangaUrl;
      newMangaEntry.mangaName = newManga.mangaName;

      newMangaEntry.save(function(err) {
        if(err)
          throw err;
        return true;
      })
    }
  })
  */
};

var insertOneManga = function(newManga) {
  debug('insertOneManga');
  console.log('insertOneManga')
  Manga.insertOne( {'mangaUrl' : newManga.mangaUrl,
    'mangaName' : newManga.mangaName,
    'author' : newManga.author })

}

var getManga = function(batotoEndingUrl) {
  debug('getManga');
  console.log('Comparing:' + batotoEndingUrl + ')');
  //var fullBatotoUrl = "http://bato.to/comic/_/" + batotoEndingUrl;
  return Q(Manga.findOne({'mangaUrl': batotoEndingUrl}).exec())
  .then(function(manga) {
    return manga;
  })
  .catch(function(err) {
    console.error('Something went wrong: ' + err);
  });
}

var getAllManga = function() {
  debug('getAllManga');
  console.log('getAllManga');
  var arr = [];
  Manga.find({},function(err, mangas) {
      if (err)
          return err;
      //console.log(mangas);
      arr = mangas;
      return arr;
  });
  //return arr;
}

var updateMangaEntry = function(newData) {
  debug('updateMangaEntry');
  //console.log('mangaDB updateMangaEntry');
  return Q(Manga.findOne({'mangaUrl' : newData.mangaUrl}).exec())
  .then(function(manga) {
    //console.log('Trying to update Manga Entry of: ' + manga.mangaName);
    //console.log('genres?' + newData.mangaInfo.genre);
    manga['genres'] = newData.mangaInfo.genre;
    manga['mangaDesc'] = newData.mangaInfo.desc;
    manga['artist'] = newData.mangaInfo.artist;
    manga['mangaImageUrl'] = newData.mangaInfo.mangaImageUrl;
    manga['lastUpdated'] = newData.lastUpdated;
    manga['lastChapter'] = newData.lastChapter;
    manga['lastChapterUrl'] = newData.lastChapterUrl;
    var i = 0;
    var chapterList = [{}];
    while(newData[i]) {
      //console.log(newData[i]);
      chapterList.push(newData[i++]);
    }
    chapterList.shift();
    if(manga['chapters'].length < chapterList.length) {
      console.log(manga['mangaName'] + " Appears to have new chapters");
    }
    manga['chapters'] = chapterList;
    return manga;
  })
  .then(function(manga) {
    manga.save(function(err) {
        if (err)
            throw err;
    });
    return manga;
  })
  .catch(function(err) {
    console.log("Ran into: " + err);
  })
}

var getMangas = function() {
  debug('getMangas');
  return Q(Manga.find({}).exec())
  .then(function(mangas) {
    return mangas
  });
}

var getMangas = function(keyword) {
  debug('newMangaEntry:%s', keyword);
  return Q(Manga.find({ "mangaName" : { "$regex" : keyword , "$options" : "i"}}).exec())
  .then(function(mangas) {
    return mangas
  });
}


var getRecentlyUpdated = function() {
  debug('getRecentlyUpdated');
  return Q(Manga.find().sort({"lastUpdated": -1}).limit(100).exec())
  .then(function(mangas) {
    return mangas;
  });
}
var getFavouriteMangas = function(favourites) {
  debug('getFavouriteMangas');
  //console.log('Server Trying to ');
  //console.log(favourites);
  var favArr = [];
  favourites.forEach(function(item) {
    favArr.push(item.mangaUrl);
  })
  return Q(Manga.find( {
    mangaUrl: {
      $in: favArr
    }
  }));
}

var getFavouriteMangasSorted = function(favourites) {
  debug('getFavouriteMangasSorted');
  //console.log('Trying to find favourites');
  //console.log(favourites);
  var favArr = [];
  favourites.forEach(function(item) {
    favArr.push(item.mangaUrl);
  })
  return Q(Manga.find({ mangaUrl: {$in: favArr}}).sort({"lastUpdated": -1}));
}


exports.getRecentlyUpdated = getRecentlyUpdated;
exports.newMangaEntry = newMangaEntry;
exports.getAllManga = getAllManga;
exports.getMangas = getMangas;
exports.getManga = getManga;
exports.updateMangaEntry = updateMangaEntry;
exports.getFavouriteMangas = getFavouriteMangas;
exports.getFavouriteMangasSorted = getFavouriteMangasSorted;
exports.insertOneManga = insertOneManga;
