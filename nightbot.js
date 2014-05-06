var config = 
{
	channels: ["#flux"],
	server: "irc.flux.cd",
	botName: "Nightbot"
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
		if(commands[0] == "!addquote")
		{
			quotes.add(text.substr(commands[0].length + 1));
			bot.say(to, "Quote added");
		}
		else if(commands[0] == "!quote")
		{
			console.log()
			quotes.get(new RegExp(text.substr(commands[0].length +1)), function(result)
				{
					bot.say(to, result.quote);
				});
		}
	}
});