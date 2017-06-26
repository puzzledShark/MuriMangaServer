// load up the user model
var MangaUser           = require('../app/models/mangaUser');
var Q = require('q');

var getUserDB = function(userID) {
  return Q(MangaUser.find({ "userID" : userID }).exec())
  .then(function(mangas) {
    return mangas;
  });
};

var addNewManga = function(newData) {
  console.log('mangaDB updateMangaEntry');
  return Q(MangaUser.findOne({'userID' : newData.userID}).exec())
  .then(function(manga) {
    console.log('Trying to update: ' + manga);
    if(manga) {
      if(manga.mangas) {
        console.log('Mangas Exist in database');
        console.log(manga.mangas);
        var exists = 0;
        manga.mangas.forEach(function(item) {
          if(item.mangaUrl == newData.mangaName) {
            exists++;
          }
        })
        if(!exists) {
          console.log('Does not exist in database so adding it');
          manga.mangas.push({ mangaUrl: newData.mangaName });
        }
      }
      else {
        console.log('Users MangaUserDB does not have any elements in MANGA');
        manga.mangas = [];
        manga.mangas.push({ mangaUrl: newData.mangaName });
      }
      return manga;
    }
    else {
      console.log("USER did not own a DATABASE in MangaUserDB, thus making it");
      var newMangaUser = new MangaUser();
      newMangaUser.userID = newData.userID;
      newMangaUser.mangas = [];
      newMangaUser.mangas.push({ 'mangaUrl': newData.mangaName });
      return newMangaUser;
    }
  })
  .then(function(manga) {
    console.log("Attempting to override");
    console.log(manga);
    manga.save(function(err) {
        if (err)
            throw err;
    });
    return manga;
  })
  .catch(function(err) {
    console.log("Ran into: " + err);
  })
};

exports.getUserDB = getUserDB;
exports.addNewManga = addNewManga;