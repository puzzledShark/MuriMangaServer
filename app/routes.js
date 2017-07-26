var kissManga = require('./kissMangaV2.js');
var batoto = require('./batoto.js');
var mangaDB = require('../config/mangaDB.js');
var mangaUserDB = require('../config/mangaUserDB')
var request = require('request')
var Jimp = require("jimp");
var Q = require('q');

var debug = require('debug')('Muri:routes')  


batoto.firstLogin();
//batoto.getOneManga();
//batoto.login();
//batoto.getChapters('http://bato.to/comic/_/rough-sketch-senpai-r20617');
// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
      debug('/ Requested');
      //console.log("Running for / :" + req.originalUrl);
      if(req.user) {
        //console.log("Logged In as: " + req.user);
      }
      else console.log("Not Logged in");
        res.render('index.ejs', {
          user : req.user
        }); // load the index.ejs file
    });
    app.get('/batoto/manga/:mangaName', function(req,res) {
      debug('Manga: %s was requested', req.params.mangaName);
      req.params.mangaName = encodeURIComponent(req.params.mangaName);
      req.params.mangaName = req.params.mangaName.toLowerCase();

      console.log("REQUEST");
      if(req.user) {
        console.log(req.user.google.name + " accessing " + req.params.mangaName);
      }
      else console.log('Client accessing' + req.params.mangaName);

      mangaDB.getManga(req.params.mangaName)
        .then(function(mangaSkeleton) {
          if(mangaSkeleton === null) throw new Error('No manga was found');
          return mangaSkeleton;
        })
        .then(function(mangaSkeleton) {
          //We refer to the information we attained as a skeleton because we do not know if we're dealing with an entire manga entity yet
          
          //If the mangaSkeleton has any chapters at all, it must have been filled in previously so lets continue on with the request
          if(mangaSkeleton.chapters.length > 0) {
            //Now that we have the mangaSkeleton for the link determine if more info needs to be sent(if user is logged in)
            if(req.user) {
              //Lets go grab the users manga database
              mangaUserDB.getUserMangaChaptersRead(req.params.mangaName, req.user.google.id)
                .then(function(userMangaDB) {
                  //The user always has a database linked to them so no need to double check
                  console.log("What is in here" + userMangaDB);
                  if(userMangaDB) {
                    res.render('mangaPage.ejs', {
                      user : req.user,
                      manga : mangaSkeleton,
                      userManga : userMangaDB
                    });
                  }
                  else {
                    res.render('mangaPage.ejs', {
                      user : req.user,
                      manga : mangaSkeleton
                    });
                  }
                })
                .catch(function(err) {
                  console.error('Error in getUserMangaChaptersRead@manga/' + req.params.mangaName + ' : ' + err);
                  res.send('404 Not actually a 404 issue i am just to lazy to fix it, poke me about it', 404);
                })
            }
            else {
              res.render('mangaPage.ejs', {
                    manga : mangaSkeleton
                });
            }
          }
          //Looks like the information we got back was a skeleton, so lets go fetch the info for the client
          else {
            batoto.getMangaInfoLive(req.params.mangaName, function(manga) {
              if(req.user) {
                res.render('mangaPage.ejs', {
                  user : req.user,
                  manga : manga
                })
              }
              else {
                res.render('mangaPage.ejs', {
                  manga : manga
                })
              }
            })
          }
        })
        .catch(function(err) {
          console.error('My best guess is that the manga does not exist: ' + err);
          res.send('404 Error Manga does not exist', 404);
        })
/*
      if(req.query.fav == 'true') {
        console.log(">>>>>>>>>>>>>>>>>>>>> USER TRYING TO FAVOURITE")
        console.log("Current UserID: " + req.user.google.id);
        console.log("Trying to add manga: " + req.params.mangaName)
        var tmp = { userID : req.user.google.id, mangaName : req.params.mangaName}
        mangaUserDB.addNewManga(tmp)
        .then(function(manga) {
          //console.log(manga);
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
      */
      /*
      else {

        console.log('Looking for manga');
        mangaDB.getManga(req.params.mangaName)
        .then(function(manga) {
          if(manga === null) throw new Error('No manga was found');
          return manga;
        })
        .then(function(manga) {
          if(manga.genres.length > 0) {
            console.log("Sending Manga to client");
            //console.log('Sending this Manga to client: ' + manga);
            if(req.user) {
            //console.log('Logged in');
             mangaUserDB.getUserMangaChaptersRead(req.params.mangaName, req.user.google.id)
              .then(function(userMangaChapterDB) {
                if(userMangaChapterDB) {
                  //console.log("User has chapters to fill" + userMangaChapterDB.chapters);
                  res.render('mangaPage.ejs', {
                    manga : manga,
                    user : req.user,
                    read : userMangaChapterDB.chapters
                  });
                }
                else {
                  res.render('mangaPage.ejs', {
                    manga : manga,
                    user : req.user
                  });
                }
              })
              .catch(function(err) {
                console.error('Something went wrong: ' + err);
                res.send('404 Error URL does not exist', 404);
              })
            }
            else {
              res.render('mangaPage.ejs', {
                    manga : manga,
                    user : req.user
                  });
            }
          }
          */
          /*
          else {
            batoto.getMangaInfoLive(req.params.mangaName, function(manga) {
              console.log("Sending Manga to client LIVE");
              //console.log("Send this manga to client LIVE: " + manga);
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
          if(req.user) {
            //console.log(req.user);
          }
          console.log('Finished sending request');
        })
      }
      */
    });
    
    var personalize = function(mangaURL, userID) {
     
      }

  

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
        console.log("RESPONSE FOR " + currentPage + currentPageNum + '.' + filetype);
        //console.log(resp.statusCode);
        if(resp.statusCode == '404') {
          if(filetype == 'png') filetype = 'jpg';
          else filetype = 'png'; 
        }
      Jimp.read(currentPage + currentPageNum + '.' + filetype)
        .then(function(img) {
          img.autocrop(.002, false)
            .write("public/" + originalData.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/" + originalData.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/M" + zeroLen + currentPageNum + '.png');
        })
        .then(function() {
          console.log(originalData.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/M" + zeroLen + currentPageNum + '.png Has been processed');
          //var pageUrl = "http//minisharks.asuscomm.com:8095/public/M" + zeroLen + currentPageNum + '.' + filetype;
          //newPages.push(pageUrl);
          //console.log("Successful, current newPages: " + newPages);
          if(currentPageNum < originalData.pagesCount) {
            jimpRender(originalData, ++currentPageNum, newPages, cb);
          }
          else {
            originalData.firstImage = "http://dokidoki.duckdns.org:8080/public/" + originalData.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/" + originalData.chapterName.replace(/[^a-zA-Z0-9]/g, "") +"/Mimg000001.png";
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
      debug('Manga: %s Chapter: %s was requested', req.params.mangaName, req.params.chapterurl);
      console.log('User Accessed: ' + req.params.mangaName + ' ' + req.params.chapterUrl);
      //console.log("Running for batoto/manga/manganame/chapterurl :" + req.originalUrl);

      //Running Check



      batoto.getMangaChapterPages(req.params.chapterUrl, function(data) {
        if(req.query.mod == 'true') {
          data.mangaName = req.params.mangaName;
          console.log('mod activate');
          console.log('Trying:' + "http://dokidoki.duckdns.org:8080/public/" + data.chapterName + "/Mimg000001.png")
          console.log('Trying:' + "http://dokidoki.duckdns.org:8080/public/" + data.chapterName + "/Mimg000001.png")
          //data.firstModImage = "http://minisharks.asuscomm.com:8095/public/" + data.chapterName + "/Mimg000001.png";
          var firstImageOg = data.firstImage;
          data.firstImage = "http://dokidoki.duckdns.org:8080/public/" + data.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/" + data.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png";
          res.render('mangaChapterPageMod.ejs', {
                data : data,
                user : req.user
            });

          data.firstImage = firstImageOg;

          var newPages = [];
          var r = request("http://dokidoki.duckdns.org:8080/public/" + data.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/" + data.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png")
          r.on('response', function(resp) {
            //console.log("RESPONSE FOR " + currentPage + currentPageNum + '.' + filetype);
            //console.log(resp.statusCode);
            if(resp.statusCode == '404') { 
              jimpRender(data, 1, newPages, function(modData) {
                console.log('Done');
                console.log('tak' + data);
                /*
                res.render('mangaChapterPageMod.ejs', {
                data : modData 
                });
                */
              })
            }
            else {
              data.firstImage = "http://dokidoki.duckdns.org:8080/public/" + data.mangaName.replace(/[^a-zA-Z0-9]/g, "") + "/" + data.chapterName.replace(/[^a-zA-Z0-9]/g, "") + "/Mimg000001.png";
              res.render('mangaChapterPageMod', {
                data: data,
                user : req.user
              });
            }
          });
        }
        else {
          res.render('mangaChapterPage.ejs', {
            data : data,
            user : req.user
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
      debug('%s requested their favorites page', req.user.google.name);
      mangaUserDB.getUserDB(req.user.google.id)
      .then(function(userMangaDB) {
        mangaDB.getFavouriteMangas(userMangaDB.mangas)
        .then( function(favourites) {
          //console.log('Returned favourites:' + favourites);
          //console.log('Does userMangaChapterDB' + userMangaDB)
          res.render('favorites.ejs', {
            userDB : userMangaDB,
            fullMangas : favourites
          });
        })
        
      });
    })

    app.get('/batoto/favoritesRecentlyUpdated', isLoggedIn, function(req,res) {
      debug('%s requested their favoritesRecentlyUpdated page', req.user.google.name);
      mangaUserDB.getUserDB(req.user.google.id)
      .then(function(userMangaDB) {
        mangaDB.getFavouriteMangasSorted(userMangaDB.mangas)
        .then( function(favourites) {
          //console.log('Returned favourites:' + favourites);
          //console.log('Does userMangaChapterDB' + userMangaDB)
          res.render('favorites.ejs', {
            userDB : userMangaDB,
            fullMangas : favourites
          });
        })
        
      });
    })

    app.get('/batoto/mangalisting', function(req, res) {
        debug('someone requested mangalisting');
        mangaDB.getRecentlyUpdated()
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
    app.get('/batoto/recentlyUpdated', function(req, res) {
        debug('Someone requested recentlyUpdated');
        mangaDB.getRecentlyUpdated()
        .then(function(mangas) {
          //console.log(mangas);
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
      debug('someone requeted searchResults');
      console.log("Search Results: " + req.query.searchKeyword);
      if(req.query.searchKeyword == '') {
        res.render('mangaSearchResults.ejs', {
          manga : [{}]
        });
      }
      else {
        mangaDB.getMangas(req.query.searchKeyword)
        .then(function(mangas) {
          //console.log(mangas);
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
        //batoto.updateBatotoUserMangaDatabase();
        //batoto.updateBatotoFullMangaDatabase();

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
      debug('%s logged in', req.user.google.name);
      mangaUserDB.createMangaUserDB(req.user.google.id);
      console.log('Redirecting from /profile');
        if(req.header('Referer')) {
          console.log("Referer was: " + req.header('Referer'))
          res.redirect(req.header('Referer'));
        }
        else res.redirect('/');
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
  debug('checking if user is logged in');
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    if(req.header('Referer')) {
          console.log("Referer was: " + req.header('Referer'))
          res.redirect(req.header('Referer'));
    }
    else res.redirect('/');
}
