var kissManga = require('./kissMangaV2.js');
var batoto = require('./batoto.js');
var mangaDB = require('../config/mangaDB.js');
var mangaUserDB = require('../config/mangaUserDB')

var request = require('request')

var Jimp = require("jimp");

var Q = require('q');

//batoto.login();
//batoto.getChapters('http://bato.to/comic/_/rough-sketch-senpai-r20617');
// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });
    app.get('/batoto/manga/:mangaName', function(req,res) {
      console.log('User Accessed: ' + req.params.mangaName);
      req.params.mangaName = encodeURIComponent(req.params.mangaName);
      req.params.mangaName = req.params.mangaName.toLowerCase();
      console.log(encodeURIComponent(req.params.mangaName));

      if(req.query.fav == 'true') {
        console.log("Current UserID: " + req.user.google.id);
        console.log("Trying to add manga: " + req.params.mangaName)
        var tmp = { userID : req.user.google.id, mangaName : req.params.mangaName}
        mangaUserDB.addNewManga(tmp)
        .then(function(manga) {
          if(manga === null) throw new Error('No manga was found');
          res.redirect('/batoto/manga/' + req.params.mangaName);
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
          res.send('404 Error URL does not exist', 404);
        })
        .done(function(manga) {
          console.log('Finished sending request');
        })
      }
      else {
        console.log('Looking for manga');
        mangaDB.getManga(req.params.mangaName)
        .then(function(manga) {
          if(manga === null) throw new Error('No manga was found');
          return manga;
        })
        .then(function(manga) {
          if(manga.genres.length > 0) {
            console.log('Sending this Manga to client: ' + manga);
            res.render('mangaPage.ejs', {
              manga : manga,
              user : req.user
            });
          }
          else {
            batoto.getMangaInfoAndChaptersLive('http://bato.to/comic/_/' + req.params.mangaName, function(manga) {
              console.log("Send this manga to client LIVE: " + manga);
              res.render('mangaPage.ejs', {
                manga : manga,
                user : req.user
              });
            })
          }
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
          res.send('404 Error URL does not exist', 404);
        })
        .done(function(manga) {
          console.log('Finished sending request');
        })
        //batoto.getChapters('http://bato.to/comic/_/' + req.params.mangaName);
      }
    });

    var jimpRender = function(originalData, currentPageNum, newPages, cb) {
      //console.log('JIMP');
      var currentPage = originalData.firstImage.split('img0000')[0];
      currentPage = currentPage + 'img0000';
      var zeroLen = 'img0000';
      if(currentPageNum < 10) 
        {
          currentPage = currentPage + '0';
          zeroLen = zeroLen + '0';
        }
      var filetype = originalData.firstImage.split('.')[3];
      var r = request(currentPage + currentPageNum + '.' + filetype)
      r.on('response', function(resp) {
        //console.log("RESPONSE FOR " + currentPage + currentPageNum + '.' + filetype);
        //console.log(resp.statusCode);
        if(resp.statusCode == '404') filetype = 'png'; 
      Jimp.read(currentPage + currentPageNum + '.' + filetype)
        .then(function(img) {
          img.autocrop(.002, false)
            .write("public/" + originalData.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/M" + zeroLen + currentPageNum + '.png');
        })
        .then(function() {
          //var pageUrl = "http//minisharks.asuscomm.com:8095/public/M" + zeroLen + currentPageNum + '.' + filetype;
          //newPages.push(pageUrl);
          //console.log("Successful, current newPages: " + newPages);
          if(currentPageNum < originalData.pagesCount) {
            jimpRender(originalData, ++currentPageNum, newPages, cb);
          }
          else {
            originalData.firstImage = "http://minisharks.asuscomm.com:8095/public/" + originalData.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png";
            cb(originalData);
            console.log("Done");
          }
        })
        .catch(function (err) {
          console.log("Fail: " + err);
        })
      })
    }

    app.get('/batoto/manga/:mangaName/:chapterUrl', function(req,res) {
      console.log('User Accessed: ' + req.params.mangaName + ' ' + req.params.chapterUrl);
      batoto.getMangaChapterPages(req.params.chapterUrl, function(data) {
        if(req.query.mod == 'true') {
          console.log('mod activate');
          console.log('Trying:' + "http://minisharks.asuscomm.com:8095/public/" + data.chapterName + "/Mimg000001.png")
          console.log('Trying:' + "http://minisharks.asuscomm.com:8095/public/" + data.chapterName + "/Mimg000001.png")
          //data.firstModImage = "http://minisharks.asuscomm.com:8095/public/" + data.chapterName + "/Mimg000001.png";
          
          var newPages = [];
          var r = request("http://minisharks.asuscomm.com:8095/public/" + data.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png")
          r.on('response', function(resp) {
            //console.log("RESPONSE FOR " + currentPage + currentPageNum + '.' + filetype);
            //console.log(resp.statusCode);
            if(resp.statusCode == '404') { 
              jimpRender(data, 1, newPages, function(modData) {
                console.log('Done');
                console.log('tak' + data);
                res.render('mangaChapterPageMod.ejs', {
                data : modData 
                });
              })
            }
            else {
              data.firstImage = "http://minisharks.asuscomm.com:8095/public/" + data.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png";
              res.render('mangaChapterPageMod', {
                data: data
              });
            }
          });
        }
        else {
          res.render('mangaChapterPage.ejs', {
            data : data
          });
        }
      });
      /*
      Q.fcall(batoto.getMangaChapterPages(req.params.chapterUrl))
      .then(function (data) {
        console.log('then');
        console.log(data);
        return data;
      })
      .catch(function(err) {

      })
      .done(function(data) {
        res.render('mangaChapterPage.ejs', {
          data : data
        });
      });*/
    });

    app.get('/batoto/favorites', isLoggedIn, function(req,res) {
      mangaUserDB.getUserDB(req.user.google.id)
      .then(function(mangas) {
        console.log(mangas);
        mangas[0].mangas.forEach(function(item) {
          console.log(item);
        })
        res.render('favorites.ejs', {
          mangas : mangas[0].mangas
        });
      });
    })

    app.get('/batoto/mangalisting', function(req, res) {
        mangaDB.getMangas()
        .then(function(mangas) {
          console.log(mangas);
          return mangas;
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
        })
        .done(function(manga) {
          res.render('mangaListing.ejs', {
              manga : manga // get the user out of session and pass to template
          });
        });
    });

    app.get('/batoto/searchResults', function(req, res) {
      console.log("Search Results: " + req.query.searchKeyword);
      if(req.query.searchKeyword == '') {
        res.render('mangaSearchResults.ejs', {
          manga : [{}]
        });
      }
      else {
        mangaDB.getMangas(req.query.searchKeyword)
        .then(function(mangas) {
          console.log(mangas);
          return mangas;
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
        })
        .done(function(manga) {
          res.render('mangaSearchResults.ejs', {
              manga : manga // get the user out of session and pass to template
          });
        });
      }
    });

    app.get('/test', function(req, res) {
      Q.fcall(batoto.getMangaChapterPages('2e0b4adca36fa1ff'))
      .then(function (data) {

      })
      .catch(function(err) {

      })
      .done(function() {
        res.render('test.ejs');
      });

        //kissManga.getChapters('http://kissmanga.com/Manga/Rough-Sketch-Senpai');
        //kissManga.getMangaChapterPages('http://kissmanga.com/Manga/Rough-Sketch-Senpai/Vol-001-Ch-001--Why-Does-It-Have-to-Be-Me-?id=344254');
        //kissManga.getMangaDatabase('http://kissmanga.com/MangaList?page=');
        //batoto.getMangaDatabase('');
        //batoto.getChapters('http://bato.to/comic/_/comics/tsugumomo-r4271');
        /*
        mangaDB.getMangas()
        .then(function(mangas) {
          console.log(mangas);
          return mangas;
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
        })
        .done(function(manga) {
          res.render('mangaListing.ejs', {
              manga : manga // get the user out of session and pass to template
          });
          //mongoose.disconnect();
        });

        /*
        Q.fcall(function () {
          console.log('Stage 1');
        })
        .then(mangaDB.getAllManga())
        .then(function (value) {
          console.log('Stage 2');
          return value;
        })
        .then(function(value) {
          console.log('Finally: ');
          return value;
        })
        .catch(function (error) {

        })
        .done(function (value) {
          console.log("Done" + value);
          console.log("Done2");
          res.render('test.ejs'); // load the index.ejs file
        });
        console.log('When');

        /*
        var tmp = {
          mangaUrl : 'ahttp://kissmanga.com/Manga/Grand-Blue/Vol-002-Ch-008--Boycon?id=315193',
          mangaName: 'aGrand-Blue'
        };
        mangaDB.newMangaEntry(tmp);
        */

    });

    app.get('/ereader', function(req, res) {
        res.render('ereader.ejs'); // load the index.ejs file
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.redirect('/');
        /*res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });*/
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
