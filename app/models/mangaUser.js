// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var mangaUserSchema = mongoose.Schema({
  userID          : String,
  mangas          : [{
    mangaUrl      : String,
    chapters      : [String]
  }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('MangaUser', mangaUserSchema);
