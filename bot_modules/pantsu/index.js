var https = require('https');
var querystring = require('querystring');
var fs = require('fs');
var utils = require('utils');

var oauth = require(__dirname + '/oauth.json');

function requestAccessToken(callback)
{
	var post_data = querystring.stringify(
	{
		'refresh_token' : oauth.refresh_token,
		'client_id' : oauth.client_id,
		'client_secret' : oauth.client_secret,
		'grant_type' : 'refresh_token'
	});

	var post_options = {
		host: 'api.imgur.com',
		path: '/oauth2/token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
        	'Content-Length': post_data.length
		}
	}

	var post_req = https.request(post_options, function(res)
	{
		res.setEncoding('utf8');
		res.on('data', function(data)
		{
			callback(JSON.parse(data));
		})
	});

	post_req.write(post_data);
	post_req.end();
}

exports.requestAccessToken = requestAccessToken;

function uploadImage (url, callback) {
	var post_data = querystring.stringify({
		'image' : url,
		'album' : oauth.album_id,
		'type' : 'URL'
	});

	var post_options = {
		host: 'api.imgur.com',
		path: '/3/image',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
        	'Content-Length': post_data.length,
        	'Authorization' : 'Bearer ' + oauth.access_token
		}
	}

	var post_req = https.request(post_options, function(res)
	{
		res.setEncoding('utf8');
		res.on('data', function(data)
		{
			callback(JSON.parse(data));
		})
	});

	post_req.write(post_data);
	post_req.end();
}

function pantsuCommand(irc, from, to, url)
{
	if(oauth.access_token == null || oauth.expire_time < Date.now())
	{
		requestAccessToken(function(res)
		{
			if(res)
			{
				oauth.access_token = res.access_token;
				oauth.expire_time = Date.now() + (res.expires_in * 1000);

				uploadImage(url, function(res)
					{
						if(res.success)
						{
							irc.say(utils.reply(from,to), "Image uploaded " + res.data.link + " - Full album at http://imgur.com/a/" + oauth.album_id );
						}
						else
						{
							irc.say(utils.reply(from,to), "Upload failed");
							console.log("Upload failed: " + res.error);
						}
					});
			}
		});
	}
	else
	{
		uploadImage(url, function(res)
			{
				if(res.success)
				{
					irc.say(utils.reply(from,to), "Image uploaded " + res.data.link + " - Full album at http://imgur.com/a/" + oauth.album_id);
				}
				else
				{
					irc.say(utils.reply(from,to), "Upload failed");
					console.log("Upload failed: " + res.error);
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