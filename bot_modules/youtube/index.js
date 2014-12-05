var regex = /(?:youtu\.be\/|youtube.com\/(?:watch\?.*\bv=|embed\/|v\/)|ytimg\.com\/vi\/)(.+?)(?:[^-a-zA-Z0-9]|$)/;
var api = "" + require(__dirname + '/api.json').key + "&part=snippet,contentDetails,statistics,status";
var https = require('https');

function parseYoutube(irc, replyTarget, text)
{
	var youtubeId = text.match(regex);
	if(youtubeId != null)
	{
		youtubeId = youtubeId[1];
		https.get("https://www.googleapis.com/youtube/v3/videos?id=" + youtubeId + "&key=" + api, function(res) {
		 	console.log("Got response: " + res.statusCode);
		 	var data = "";
		 	res.on('data', function(chunk)
		 	{
		 		data += chunk;
		 	});
		 	res.on('end', function()
		 	{
		 		var obj = JSON.parse(data);
		 		if(obj != null && obj.items != null && obj.items.length > 0)
		 		{
		 			irc.say(replyTarget, "\x02YouTube:\x02 " + obj.items[0].snippet.title + " | \x02" + obj.items[0].statistics.viewCount + "\x02 views |\x02\x033 " + obj.items[0].statistics.likeCount 
		 				+ "\x03\x02 likes |\x02\x034 " + obj.items[0].statistics.dislikeCount + "\x03\x02 dislikes");
		 		}
		 	});
		}).on('error', function(e) {
		 	console.log("Got error: " + e.message);
		});
	}
}

function findURLs(irc, from, to, text, message)
{
	var words = text.split(" ");
	for(var i = 0; i < words.length; i++)
	{
		parseYoutube(irc, to, words[i]);
	}
}

exports.init = function(cc)
{
	cc.hookMessage(findURLs);
}

exports.destroy = function(cc)
{
	// umhook message
}