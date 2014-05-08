var mongoose = require('mongoose');

var accessSchema = mongoose.Schema(
{
	username: String,
	hostname: String,
	permissions: {type: Number, default: 0},
	allowedModules: [mongoose.Schema.Types.Mixed]
})

accessSchema.methods.getModulePermissions = function(moduleName)
{
	var mod = null;
	for (var i = this.allowedModules.length - 1; i >= 0; i--) {
		if(this.allowedModules[i].key == moduleName)
		{
			mod = this.allowedModules[i];
			break;
		}
	};

	return mod.object;
}

accessSchema.methods.setModulePermissions = function(moduleName, object)
{
	var idx = null;
	for (var i = this.allowedModules.length - 1; i >= 0; i--) {
		if(this.allowedModules[i].key == moduleName)
		{
			idx = i;
			break;
		}
	};
	if(idx != null)
	{
		this.allowedModules[i].object = object;
	}
	else
	{
		this.allowedModules.push({key: moduleName, object: object});
	}

	this.save(function(err, res) {
		if(err) console.error(err);
	});
}

var Access = mongoose.model('Access', accessSchema);

/* ********************************************************** */

var AccessEnum = 
{
	USECOMMANDS: 1,
	EDITUSERS: 2,
	ADMIN: 0x80000000
}

function isChan (argument) {
	return argument[0] == "#"
}

var addUserHandler = function(irc, from, to, text, message)
{
	var commands = text.split(" ");
	var user = message.user;
	var host = message.host;

	userRegistration(user, host, function(result)
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
						irc.say(isChan(to) ? to : from, "User " + commands[1] + " added.");
					else
					{
						irc.say(isChan(to) ? to : from, "User " + commands[1] + " is already registered.");
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
								irc.say(isChan(to) ? to : from, "User " + user + "@" + host + " added.");
							else
							{
								irc.say(isChan(to) ? to : from, "User " + user + "@" + host + " is already registered.");
							}
						});
					}
					else
					{
						irc.say(isChan(to) ? to : from, "User '" + whois.nick + "'' not found.");
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
	userRegistration(message.user, message.host, function(res)
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
						irc.say(isChan(to) ? to : from, "User " + commands[1] + " deleted.");						
					}
					else
					{
						irc.say(isChan(to) ? to : from, "User matching " + commands[1] + " not found.");
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
								irc.say(isChan(to) ? to : from, "User " + user + "@" + host + " deleted.");
							}
							else
							{
								irc.say(isChan(to) ? to : from, "User " + whois.nick + " is not registered.")
							}
						});
					}
					else
					{
						irc.say(isChan(to) ? to : from, "User " + whois.nick + " not found.");
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

	userRegistration(username, hostname, function(res)
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

var userRegistration = function(username, hostname, callback)
{
	Access.findOne({username: username, hostname: hostname}, function(err, a)
	{
		if(err) return console.error(err);
		callback(!err ? a : null);
	});
};

exports.userRegistration = userRegistration;

var nukeHandler = function(irc, from, to, text, message)
{
	if(text.split(" ")[1] == "access")
	{
		userRegistration(message.user, message.host, function(res)
		{
			if(res && (res.permissions & AccessEnum.EDITUSERS))
			{
				seedAccess();
				irc.say(isChan(to) ? to : from, "Access list has been obliterated.");
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
	commandCenter.unregisterCommand('.adduser');
	commandCenter.unregisterCommand('.deluser');
	commandCenter.unhookCommand('.nuke', nukeHandler);
}

var seedAccess = function()
{
	Access.remove({}, function(err) 
		{
			console.log("access reset");
		});
	registerUser('Nighthawk', 'phusion.io', AccessEnum.USECOMMANDS | AccessEnum.EDITUSERS | AccessEnum.ADMIN, null, function(r)
		{
			console.log("Access db seeded");
		});
}

exports.seedAccess = seedAccess;