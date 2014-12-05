var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect('mongodb://localhost/nightbot');

var db = mongoose.connection;

autoIncrement.initialize(db);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    // yay!
    console.log("mongoose loaded");
    var axx = require('./bot_modules/access');
      axx.registerUser(process.argv[2], process.argv[3], axx.AccessEnum.ADMIN | axx.AccessEnum.USECOMMANDS | axx.AccessEnum.EDITUSERS, null, function(res){
        if(res != null)
        {
           console.log("Successfully seeded root user");
           process.exit(0);
        }
        else
        {
          console.log("Failed to seed root user");
          process.exit(1);
        }
      });
});


