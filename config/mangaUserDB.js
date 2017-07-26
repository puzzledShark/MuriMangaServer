// load up the user model
var MangaUser           = require('../app/models/mangaUser');
var Q = require('q');
var debug = require('debug')('Muri:MangaUserDB') 

var getUserDB = function(userID) {
  debug('getUserDB');
  return Q(MangaUser.findOne({ "userID" : userID }).exec())
  .then(function(mangas) {
    return mangas;
  });
};

var createMangaUserDB = function(userID) {
  debug('createMangaUserDB')
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

var addNewManga = function(newData, id) {
  debug('addNewManga')
  console.log('mangaDB updateMangaEntry');
  return Q(MangaUser.findOne({'userID' : id}).exec())
  .then(function(manga) {
    //console.log('Trying to update: ' + manga);
    if(manga) {
      if(manga.mangas) {
        console.log('Mangas Exist in database');
        //onsole.log(manga.mangas);
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
    //console.log("Attempting to override");
    //console.log(manga);
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

var favNewManga = function(newData, id) {
  debug('favNewManga')
  console.log('mangaDB updateMangaEntry');
  return Q(MangaUser.findOne({'userID' : id}).exec())
  .then(function(manga) {
    //console.log('Trying to update: ' + manga);
    if(manga) {
      if(manga.mangas) {
        console.log('Mangas Exist in database');
        //onsole.log(manga.mangas);
        var exists = 0;
        manga.mangas.forEach(function(item) {
          if(item.mangaUrl == newData) {
            exists++;
          }
        })
        if(!exists) {
          console.log('Does not exist in database so adding it');
          manga.mangas.push({ mangaUrl: newData });
        }
      }
      else {
        console.log('Users MangaUserDB does not have any elements in MANGA');
        manga.mangas = [];
        manga.mangas.push({ mangaUrl: newData });
      }
      return manga;
    }
    else {
      console.log("USER did not own a DATABASE in MangaUserDB, thus making it");
      var newMangaUser = new MangaUser();
      newMangaUser.userID = id;
      newMangaUser.mangas = [];
      newMangaUser.mangas.push({ 'mangaUrl': newData });
      return newMangaUser;
    }
  })
  .then(function(manga) {
    //console.log("Attempting to override");
    //console.log(manga);
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
  debug('updateMangaChaptersRead')
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
    //Adding to a list of mangas previously read
    if(userDB.recentlyRead) {
      console.log("Exists");
      if(userDB.recentlyRead.indexOf(mangaURL) > -1) {
        console.log('already exists');
        userDB.recentlyRead.splice(userDB.recentlyRead.indexOf(mangaURL), 1);
        userDB.recentlyRead.unshift(mangaURL);
      }
      else if(userDB.recentlyRead.length < 20) {
        console.log("Less than 20")
        userDB.recentlyRead.unshift(mangaURL);
      }
      else {
        console.log('More than 20')
        userDB.recentlyRead.pop(mangaURL);
        userDB.recentlyRead.unshift(mangaURL); 
      }
    }
    else {
      console.log("Making it");
      userDB.recentlyRead = [mangaURL];
    }
    userDB.save(function(err) {
      if (err)
          throw err;
    })
  })
  .catch(function(err) {
    console.log("Ran into: " + err);
  })
}

var getUserMangaChaptersRead = function( mangaURL, userID) {
  debug('getUserMangaChaptersRead')
  return Q(MangaUser.findOne({'userID' : userID}).exec())
  .then(function(userDB) {
    return userDB.mangas.find(function(value, index) {
      if(value.mangaUrl == mangaURL) {
        return value;
      }
    })
  })
}

var setWidth = function(width, id) {
  debug('setWidth')
  return  MangaUser.updateOne( { 'userID' : id} , { 'pageWidth' : width }, function(err, res) {
        if(err) throw err;
        console.log("Updated Width");
    })
}

var getUserChaptersDB = function(userID) {
  debug('getUserChaptersDB')
  return Q(MangaUser.find().exec())
  .then(function(mangas) {
    var mangaList = [];
    mangas.forEach(function(userDB) {
      //console.log("ForEach" + userDB);
      userDB.mangas.forEach(function(manga) {
        if(mangaList.indexOf(manga.mangaUrl) == -1)
          mangaList.push(manga.mangaUrl);
      })
    })
    return mangaList;
  });
};

exports.getUserDB = getUserDB;
exports.addNewManga = addNewManga;
exports.updateMangaChaptersRead = updateMangaChaptersRead;
exports.getUserMangaChaptersRead = getUserMangaChaptersRead;
exports.createMangaUserDB = createMangaUserDB;
exports.setWidth = setWidth;
exports.getUserChaptersDB = getUserChaptersDB;
exports.favNewManga = favNewManga;