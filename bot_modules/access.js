var mongoose = require('mongoose');

var accessSchema = mongoose.Schema(
{
	username: String,
	hostname: String,
	permissions: {type: Number, default: 0},
	allowedModules: [String]
})

var Access = mongoose.model('Access', accessSchema);

/* ********************************************************** */

var AccessEnum = 
{
	USECOMMANDS: 1,
	EDITUSERS: 2
}

var addUserHandler = function(irc, from, to, text, message)
{
	var commands = text.split(" ");
	var user = message.user;
	var host = message.host;

	userRegistered(user, host, function(result)
	{
		if(result != null && (result.permissions & AccessEnum.EDITUSERS))
		{
			if(commands[1].match(/^[a-zA-Z0-9|_]+\@[a-zA-Z0-9|_.]+$/))
			{
				var user = commands[1].split("@")[0];
				var host = commands[1].split("@")[1];
				registerUser(user, host, AccessEnum.USECOMMANDS, function(axx)
				{
					irc.say(to, "User " + commands[1] + " added.");
				});
			}
			else
			{

			}
		}
		else
		{
			irc.notice(from, "You don't have permission to do that.");
		}
	});
}

var registerUser = function(username, hostname, permissions, callback)
{
	var a = new Access({username: username, hostname: hostname, permissions: permissions});
	a.save(function(err, a)
	{
		if(err) return console.error(err);
		callback(a);
	})
}

exports.registerUser = registerUser;

var userRegistered = function(username, hostname, callback)
{
	Access.findOne({}, function(err, a)
	{
		if(err) return console.error(err);
		callback(!err ? a : null);
	});
};

exports.userRegistered = userRegistered;

exports.init = function(commandCenter)
{
	commandCenter.registerCommand('.adduser', addUserHandler);
}