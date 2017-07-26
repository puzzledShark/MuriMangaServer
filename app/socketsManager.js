var mangaUserDB = require('../config/mangaUserDB')
var mangaDB = require('../config/mangaDB')
var UserDB = require('../config/userDB')


exports.start = function(io) {
	io.on('connection', function(socket) {
		socket.on('chapterRead', function(chapterData, id) {
			console.log('Trying to update chapters read database');
			console.log(chapterData);
			console.log(id);
			chapterData = chapterData.split('?')[0];
			mangaUserDB.updateMangaChaptersRead(chapterData.split('/')[5],chapterData.split('/')[6].split('#')[0],id)
		});

		socket.on('widthChange', function(width, id) {
			console.log("Changing default width");
			UserDB.setWidth(parseInt(width), id);
		})

		socket.on('fav', function(mangaUrl, id) {
			console.log('Trying to favorite: ' + mangaUrl.split('/')[5].split('#')[0]);
			mangaUrl = mangaUrl.split('/')[5].split('#')[0];
			mangaDB.getManga(mangaUrl)
				.then(function(result) {
					if(result) {
						mangaUserDB.favNewManga(result.mangaUrl, id)
							.then(function(manga) {
								socket.emit('fav','true');
							})
					}
					else 
						socket.emit('fav', 'false');
				})
			
			/*
			mangaDB.getManga(mangaUrl)
				.then(function(result) {
					mangaUserDB.addNewManga(mangaUrl, id)
				        .then(function(manga) {
				          if(manga === null) {
				          	socket.emit('fav','false');
				           	throw new Error('No manga was found');
				       		}
				        })
				        .then(function(manga) {
				        	socket.emit('fav', 'true');
				        })
				        .catch(function(err) {
				          console.error('Something went wrong: ' + err);
				          res.send('404 Error URL does not exist', 404);
				        })
				        .done(function(manga) {
				          console.log('Finished sending request');
				        })
			    )}*/
		});
	});
}