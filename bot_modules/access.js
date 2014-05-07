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
				registerUser(user, host, AccessEnum.USECOMMANDS, commands.slice(2), function(axx)
				{
					if(axx)
						irc.say(to, "User " + commands[1] + " added.");
					else
					{
						irc.say(to, "User " + commands[1] + " is already registered.");
					}
				});
			}
			else
			{
				irc.whois(commands[1], function(whois)
				{
					if(whois.user != null && whois.host != null)
					{
						var user = whois.user;
						var host = whois.host;

						registerUser(user, host, AccessEnum.USECOMMANDS, commands.slice(2), function(axx)
						{
							if(axx)
								irc.say(to, "User " + user + "@" + host + " added.");
							else
							{
								irc.say(to, "User " + user + "@" + host + " is already registered.");
							}
						});
					}
					else
					{
						irc.say(to, "User '" + whois.nick + "'' not found.");
					}

				});
			}
		}
		else
		{
			irc.notice(from, "You don't have permission to do that.");
		}
	});
}

var deleteUserHandler = function(irc, from, to, text, message)
{
	var commands = text.split(" ");
	userRegistered(message.user, message.host, function(res)
	{
		if(res && (res.permissions & AccessEnum.EDITUSERS))
		{
			if(commands[1].match(/^[a-zA-Z0-9|_]+\@[a-zA-Z0-9|_.]+$/))
			{
				var user = commands[1].split("@")[0];
				var host = commands[1].split("@")[1];
				registerUser(user, host, function(axx)
				{
					if(axx)
					{
						irc.say(to, "User " + commands[1] + " deleted.");						
					}
					else
					{
						irc.say(to, "User matching " + commands[1] + " not found.");
					}
				});
			}
			else
			{
				irc.whois(commands[1], function(whois)
				{
					if(whois.user != null && whois.host != null)
					{
						var user = whois.user;
						var host = whois.host;

						unregisterUser(user, host, function(axx)
						{
							if(axx)
							{
								irc.say(to, "User " + user + "@" + host + " deleted.");
							}
							else
							{
								irc.say(to, "User " + whois.nick + " is not registered.")
							}
						});
					}
					else
					{
						irc.say(to, "User " + whois.nick + " not found.");
					}

				});
			}
		}
	});
}

var unregisterUser = function(username, hostname, callback)
{
	if(username == "*" && hostname == "*")
	{
		callback(null);
	}
	if (username == "*")
		username = /.*/;
	if(hostname == "*")
		hostname = /.*/;
	Access.findOneAndRemove({username: username, hostname: hostname}, function(err, res)
	{
		if(err) 
			console.error(err);
		callback(!err ? res : null);
	})
}

exports.unregisterUser = unregisterUser;

var registerUser = function(username, hostname, permissions, allowedModules, callback)
{
	if(allowedModules == null)
		allowedModules = [];

	userRegistered(username, hostname, function(res)
	{
		if(!res)
		{
			var a = new Access({username: username, hostname: hostname, permissions: permissions, allowedModules: allowedModules});
			a.save(function(err, a)
			{
				if(err) 
					console.error(err);
				callback(!err ? a : null);
			});
		}
		else
		{
			callback(null); // user already exists
		}
	});
}

exports.registerUser = registerUser;

var userRegistered = function(username, hostname, callback)
{
	Access.findOne({username: username, hostname: hostname}, function(err, a)
	{
		if(err) return console.error(err);
		callback(!err ? a : null);
	});
};

exports.userRegistered = userRegistered;

var nukeHandler = function(irc, from, to, text, message)
{
	if(text.split(" ")[1] == "access")
	{
		userRegistered(message.user, message.host, function(res)
		{
			if(res && (res.permissions & AccessEnum.EDITUSERS))
			{
				seedAccess();
				irc.say(to, "Access list has been obliterated.");
			}
			else
			{
				irc.notice(from, "Can't let you do that StarFox.");
			}
		});
	}
}

exports.init = function(commandCenter)
{
	commandCenter.registerCommand('.adduser', addUserHandler);
	commandCenter.registerCommand('.deluser', deleteUserHandler);
	commandCenter.hookCommand('.nuke', nukeHandler);
}

exports.AccessEnum = AccessEnum;

exports.destroy = function(commandCenter)
{

}

var seedAccess = function()
{
	Access.remove({}, function(err) 
		{
			console.log("access reset");
		});
	registerUser('Nighthawk', 'phusion.io', AccessEnum.USECOMMANDS | AccessEnum.EDITUSERS, null, function(r)
		{
			console.log("Access db seeded");
		});
}

exports.seedAccess = seedAccess;