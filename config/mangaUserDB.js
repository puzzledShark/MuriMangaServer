// load up the user model
var MangaUser           = require('../app/models/mangaUser');
var Q = require('q');

var getUserDB = function(userID) {
  return Q(MangaUser.findOne({ "userID" : userID }).exec())
  .then(function(mangas) {
    return mangas;
  });
};

var createMangaUserDB = function(userID) {
  console.log('mangaDB updateMangaEntry');
  return Q(MangaUser.findOne({'userID' : userID}).exec())
  .then(function(manga) {
    if(manga) {
      return false;
    }
    else {
      console.log("USER did not own a DATABASE in MangaUserDB, thus making it");
      var newMangaUser = new MangaUser();
      newMangaUser.userID = userID;
      newMangaUser.save(function(err) {
        if(err)
          throw err;
      })
      return true;
    }
  })
  .then(function(manga) {
    if(manga) console.log("Database created");

  })
  .catch(function(err) {
    console.log("Ran into: " + err);
  })
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

var updateMangaChaptersRead = function( mangaURL, chapterURL, userID) {
  console.log('Trying to update Mangas Read with:');
  MangaUser.findOne({'userID' : userID}).exec()
  .then(function(userDB) {
    userDB.mangas.find(function(value,index) {
      if(value.mangaUrl == mangaURL) {
        var traversal =  "mangas." + index + ".chapters";
        var val1 = { userID : userID};
        var val2 = {};
        val2[traversal] = chapterURL;
        console.log(val2);
        var val3 = {};
        val3['$addToSet'] = val2;
        console.log(val3);
        
        MangaUser.updateOne(val1, val3, function(err, res) {
          if(err) throw err;
          console.log("1 Record updated");
        })
      }
    })
  })
  .catch(function(err) {
    console.log("Ran into: " + err);
  })
}

var getUserMangaChaptersRead = function( mangaURL, userID) {
  return Q(MangaUser.findOne({'userID' : userID}).exec())
  .then(function(userDB) {
    return userDB.mangas.find(function(value, index) {
      if(value.mangaUrl == mangaURL) {
        var arr = [];
        value.chapters.forEach(function(item) {
          arr.push(item);
        })
        return arr;
      }
    })
  })
}

var setWidth = function(width, id) {
  return  MangaUser.updateOne( { 'userID' : id} , { 'pageWidth' : width }, function(err, res) {
        if(err) throw err;
        console.log("Updated Width");
    })
}

exports.getUserDB = getUserDB;
exports.addNewManga = addNewManga;
exports.updateMangaChaptersRead = updateMangaChaptersRead;
exports.getUserMangaChaptersRead = getUserMangaChaptersRead;
exports.createMangaUserDB = createMangaUserDB;
exports.setWidth = setWidth;