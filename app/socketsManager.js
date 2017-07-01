var mangaUserDB = require('../config/mangaUserDB')
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
	});
}