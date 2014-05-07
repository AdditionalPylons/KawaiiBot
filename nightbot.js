var config = 
{
	channels: ["#flux"],
	server: "irc.flux.cd",
	botName: "KawaiiBot"
}

var irc = require("irc");
var quotes = require("./quotes");


var bot = new irc.Client(config.server, config.botName,{
	channels: config.channels
});

bot.addListener("message#", function(from, to, text, message)
{
	if(from == "Nighthawk")
	{
		var commands = text.split(" ");
		var cmd = commands[0];
		switch(cmd)
		{
			case ".addquote":
			{
				if(commands.length > 1)
				{
					quotes.add(text.substr(commands[0].length + 1));
					bot.say(to, "Quote added");
				}
			}break;
			case ".quote":
			{
				console.log()
				quotes.get(text.substr(commands[0].length +1), function(result)
					{
						if(result != null)
						{
							bot.say(to, result.quote);
						}
						else
						{
							bot.say(to, "No matches found");
						}
					});
			}break;
			case ".nuke":
			{
				switch(commands[1])
				{
					case "quotes":
					{
						quotes.reset(function() 
						{
							bot.say(to, "Existing quotes have been vaporized.");
						})
					}break;
					default:
					{
					}
				}
			}break;
		}
	}
});