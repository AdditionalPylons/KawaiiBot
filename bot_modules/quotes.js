var mongoose = require('mongoose');

var utils = require('utils');

var autoIncrement = require('mongoose-auto-increment');

var quoteSchema = mongoose.Schema(
{
	quote: String,
	date: { type: Date, default: Date.now }
});

quoteSchema.plugin(autoIncrement.plugin, 'Quote');

var Quote = mongoose.model('Quote', quoteSchema);

var add = function(quoteMsg, callback)
	{
		var q = new Quote({quote: quoteMsg});
		q.save(function(err, q) {
			if(err) return console.error(err);
			callback(q);
		});
	}

var get = function(expr, callback)
	{
		if(expr[0] == "#")
		{
			Quote.findById(expr.substr(1), function(err, result)
			{
				if(err) return console.error(err);
				callback(result);
			});
		}
		else
		{
			var idmatch = expr.match(/[0-9]+$/);
			expr = expr.replace(/^\s+|\s+$/g,'');
			expr = new RegExp(expr, 'i');
			Quote.find({$or : [{quote: expr}, {_id: (idmatch ? idmatch[0] : null)}]}, function(err, results) 
				{
					if(err) return console.error(err);
					if(results && results.length > 0)
						callback(results[Math.floor(Math.random()*results.length)]);
					else
						callback(null);
				});		
		}

	}

exports.get = get;
exports.find = exports.get;

var remove = function(id, callback)
{
	Quote.findByIdAndRemove(id, function(err, removed)
	{
		if(err) console.error(err);
		callback(removed);
	})
}

var reset = function(callback)
{
	Quote.remove({}, function(err) {
		console.log('collection removed');
		callback();
	});
}

var addQuoteHandler = function(irc, from, to, text, message)
{
	Access.userRegistration(message.user, message.host, function(registration)
	{
		var commands = utils.splitText(text);
		if(registration && (registration.permissions & Access.AccessEnum.USECOMMANDS))
		{
			add(utils.trimCommandFromText(text), function(q)
				{
					if(q)
					{
						irc.say(utils.reply(from,to), "Quote #" + q.id + " added.");
					}
				});
		}
		else
		{
			irc.notice(from, "You don't have access to that.");
		}
	});
}

var quoteHandler = function(irc, from, to, text, message)
{
	var commands = utils.splitText(text);
	get(utils.trimCommandFromText(text), function(quote)
	{
		if(quote)
			irc.say(utils.reply(from,to), "#" + quote.id + ": " + quote.quote);
		else
		{
			irc.say(utils.reply(from,to), "No results.");
		}
	});
}

var deleteQuoteHandler = function(irc, from, to, text, message)
{
	var commands = utils.splitText(text);
	Access.userRegistration(message.user, message.host, function(access)
	{
		if(access && (access.permissions & Access.AccessEnum.USECOMMANDS))
		{
			var id = commands[0].match(/[0-9]+$/)[0];
			if(id != null)
			{
				remove(id, function(result)
				{
					if(result)
					{
						irc.say(utils.reply(from,to), "Quote #" + id + " deleted.");
					}
					else
					{
						irc.say(utils.reply(from,to), "Quote #" + id + " does not exist.");
					}
				});	
			}
			else
			{
				irc.say(utils.reply(from,to), "Invalid id.");
			}
		}
	})
}

var Access;

exports.init = function(commandCenter)
{
	Access = commandCenter.getModule('access');
	commandCenter.registerCommand('.addquote', addQuoteHandler);
	commandCenter.registerCommand('.quote', quoteHandler);
	commandCenter.registerCommand('.delquote', deleteQuoteHandler);
}

exports.destroy = function(commandCenter)
{

}