var config = 
{
	channels: ["#flux"],
	server: "irc.flux.cd",
	botName: "Nightbot"
}

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName,{
	channels: config.channels
});

bot.addListener("message#", function(from, to, text, message)
{
	console.log(from);
	console.log(to);
	console.log(text);
	console.log("%j", message);
});