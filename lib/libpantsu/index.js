var utils = require('utils');
var imgur = require('imgur');
var Access = null;

var contexts = {};

function trampoline(irc, from, to, text, message)
{
	var cmd = text.split(" ")[0];
	commandHandler(contexts[cmd], irc, from, to, text, message);
}

// cmd - the .command to handle
// oauth - an oauth template, refer to oauth.json.template

	var Pantsu = function(cmd, oauth) 
	{
		this.cmd = cmd;
		this.oauth = oauth;
	}

	Pantsu.prototype.init = function(cc)
	{
		contexts[this.cmd] = this;
		Access = cc.getModule('access');
		cc.registerCommand(this.cmd, trampoline);
	}

	Pantsu.prototype.destroy = function(cc)
	{
		cc.unregisterCommand(cmd, trampoline);
		delete contexts[this.cmd];
	}

	var commandHandler = function(ctx, irc, from, to, text, message)
	{
		var images = utils.splitText(text);
		if(images.length > 0)
		{
			Access.userRegistration(message.user, message.host, function(res)
			{
				if(res && (res.permissions & Access.AccessEnum.USECOMMANDS))
				{
					executeCommand(ctx, irc, from, to, images);
				}
				else
				{
					irc.notice(from, "Permission denied");
				}
			});
		}
		else
		{
			irc.say(utils.reply(from,to), "Full album at http://imgur.com/a/" + ctx.oauth.album_id);
		}
	}

	var executeCommand = function(ctx, irc, from, to, images)
	{
		if(ctx.oauth.access_token == null || ctx.oauth.expire_time < Date.now())
		{
			imgur.requestAccessToken(ctx.oauth.refresh_token, ctx.oauth.client_id, ctx.oauth.client_secret, function(res)
			{
				if(res && res.access_token)
				{
					ctx.oauth.access_token = res.access_token;
					ctx.oauth.expire_time = Date.now() + (res.expires_in * 1000);

					uploadImages(ctx, irc, from, to, images);
				}
				else
				{
					irc.notice(from, "Operation failed: " + res.data.error);
				}
			});
		}
		else
		{
			uploadImages(ctx, irc, from, to, images);
		}
	}

	var uploadImages = function(ctx, irc, from, to, images)
	{
		var success = 0;
		var failed = [];
		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			(function(i)
			{
				imgur.uploadImage(image, ctx.oauth.album_id, ctx.oauth.access_token, function(res)
				{
					if(res.success)
					{
						success++;
						var text = "Image: "  + res.data.link + " uploaded";
						if(images.length > 1)
						{
							text += " (" + success + '/' + images.length + ')';							
						}
						else
						{
							text += " - Full album at http://imgur.com/a/" + ctx.oauth.album_id;
						}
						irc.notice(from, text);
						if(images.length > 1 && success + failed.length == images.length)
						{
							irc.notice(from, "(" + success + '/' + images.length + 
								") uploaded - Full album at http://imgur.com/a/" + ctx.oauth.album_id);
						}
					}
					else if(res.status == 403)
					{
						ctx.oauth.expire_time = 0;
						return uploadImages(ctx, irc, from, to, image);
					}
					else
					{
						console.log("Upload of: " + images[i] + " failed - " + JSON.stringify(res));
						failed.push(i);

						if(images.length > 1 )
						{
							irc.notice(from, "Upload of: " + images[i] + " failed");
							if(success + failed.length == images.length)
							{
								irc.notice(from, "(" + success + '/' + images.length + 
								") uploaded - Full album at http://imgur.com/a/" + ctx.oauth.album_id);
							}
						}
						else
						{
							irc.notice(from, "Upload failed: " + res.data.error);
						}
					}
				});
			})(i);
		};
	}
exports.Pantsu = Pantsu;