// load up the user model
var Manga           = require('../app/models/manga');
var Q = require('q');


var newMangaEntry = function(newManga) {
  console.log('Trying to insert ' + newManga.length + ' mangas');
  Manga.insertMany(newManga, function(error, docs) {});

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

var getManga = function(batotoEndingUrl) {
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
  console.log('mangaDB updateMangaEntry');
  return Q(Manga.findOne({'mangaUrl' : newData.mangaUrl}).exec())
  .then(function(manga) {
    console.log('Trying to update: ' + manga);
    console.log('genres?' + newData.mangaInfo.genre);
    manga['genres'] = newData.mangaInfo.genre;
    manga['mangaDesc'] = newData.mangaInfo.desc;
    manga['artist'] = newData.mangaInfo.artist;
    manga['mangaImageUrl'] = newData.mangaInfo.mangaImageUrl;
    var i = 0;
    var chapterList = [{}];
    while(newData[i]) {
      //console.log(newData[i]);
      chapterList.push(newData[i++]);
      //manga['chapters'].push(newData[i++]);
    }
    chapterList.shift();
    manga['chapters'] = chapterList;
    return manga;
    //console.log("AFTER" + manga);
  })
  .then(function(manga) {
    console.log("Attempting to override");
    //Manga.replaceOne( {"_id" : manga._id}, manga);

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
  return Q(Manga.find({}).exec())
  .then(function(mangas) {
    return mangas
  });
}
var getMangas = function(keyword) {
  return Q(Manga.find({ "mangaName" : { "$regex" : keyword , "$options" : "i"}}).exec())
  .then(function(mangas) {
    return mangas
  });
}



exports.newMangaEntry = newMangaEntry;
exports.getAllManga = getAllManga;
exports.getMangas = getMangas;
exports.getManga = getManga;
exports.updateMangaEntry = updateMangaEntry;
