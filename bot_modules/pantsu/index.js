var https = require('https');
var querystring = require('querystring');
var fs = require('fs');
var utils = require('utils');
var imgur = require('imgur');

var oauth = require(__dirname + '/oauth.json');

function pantsuCommand(irc, from, to, url)
{
	if(oauth.access_token == null || oauth.expire_time < Date.now())
	{
		imgur.requestAccessToken(oauth.refresh_token, oauth.client_id, oauth.client_secret, function(res)
		{
			if(res)
			{
				oauth.access_token = res.access_token;
				oauth.expire_time = Date.now() + (res.expires_in * 1000);

				imgur.uploadImage(url, oauth.album_id, oauth.access_token, function(res)
					{
						if(res.success)
						{
							irc.say(utils.reply(from,to), "Image uploaded " + res.data.link + " - Full album at http://imgur.com/a/" + oauth.album_id );
						}
						else
						{
							irc.say(utils.reply(from,to), "Upload failed: " + res.data.error);
							console.log("Upload failed: " + JSON.stringify(res));
						}
					});
			}
		});
	}
	else
	{
		imgur.uploadImage(url, oauth.album_id, function(res)
			{
				if(res.success)
				{
					irc.say(utils.reply(from,to), "Image uploaded " + res.data.link + " - Full album at http://imgur.com/a/" + oauth.album_id);
				}
				else
				{
					irc.say(utils.reply(from,to), "Upload failed: " + res.data.error);
					console.log("Upload failed: " + JSON.stringify(res));
				}
			});
	}
}

function pantsuHandler (irc, from, to, text, message)
{
	var commands = utils.splitText(text);
	if(commands.length > 0)
	{
		Access.userRegistration(message.user, message.host, function(res)
		{
			if(res && (res.permissions & Access.AccessEnum.USECOMMANDS))
			{
				pantsuCommand(irc, from, to, commands[0]);
			}
			else
			{
				irc.notice(from, "Permission denied");
			}
		});
	}
	else
	{
		irc.say(utils.reply(from,to), "Full album at http://imgur.com/a/" + oauth.album_id);
	}
}

var Access = null;

exports.init = function(cc)
{
	Access = cc.getModule('access');
	cc.registerCommand('.pantsu', pantsuHandler);
}