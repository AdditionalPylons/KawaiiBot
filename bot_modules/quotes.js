var mongoose = require('mongoose');

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

exports.get = function(regex, callback)
	{
		regex = regex.replace(/^\s+|\s+$/g,'');
		regex = new RegExp(regex);
		Quote.find({quote: regex}, function(err, results) 
			{
				if(err) return console.error(err);
				callback(results[Math.floor(Math.random()*results.length)]);
			});
	};

exports.find = exports.get;

exports.reset = function(callback)
{
	Quote.remove({}, function(err) {
		console.log('collection removed');
		callback();
	});
}

exports.init = function(commandCenter)
{
	
}