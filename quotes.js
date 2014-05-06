var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/quotes');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});

var quoteSchema = mongoose.Schema(
{
	quote: String,
	date: { type: Date, default: Date.now }
})

var Quote = mongoose.model('Quote', quoteSchema);

exports.add = function(quoteMsg)
	{
		var q = new Quote({quote: quoteMsg});
		q.save(function(err, q) {
			if(err) return console.error(err);
		});
	};

exports.get =  function(regex, callback)
	{
		Quote.find({quote: regex}, function(err, results) 
			{
				if(err) return console.error(err);
				callback(results[Math.floor(Math.random()*results.length)]);
			});
	};

exports.find = exports.get;