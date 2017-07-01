var User            = require('../app/models/user');


var setWidth = function(width, id) {
  return  User.updateOne( { 'google.id' : id} , { 'pageWidth' : width }, function(err, res) {
        if(err) throw err;
        console.log("Updated Width");
    })
}

exports.setWidth = setWidth;