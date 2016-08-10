var regex = /((WHERE'S|(WHERE IS)|WHERES){1} (ANNI|AUTISM|AUSTIN|ANNIHILATES){1})+/i;

function summon(irc, from, to, text, message)
{
	irc.say(to, "WHERE IS ANNIHILATES?");
}

function findSummon(irc, from, to, text, message)
{
	var match = regex.test(text);
	if(match)
	{
		summon(irc, from, to, text, message);
	}
}

function greetAustin (irc, channel, nick, message) {
	var austinregex = /(Annihilates|Austin|Anni)/i;
	if(austinregex.test(nick))
	{
		irc.say(channel, "Summoning complete");
	}
}

exports.init = function(cc)
{
	cc.registerCommand('.summon', summon)
	cc.hookMessage(findSummon);
	cc.hookJoin(greetAustin);
}

exports.destroy = function(cc)
{
	// unregister
	cc.unregister('.summon');
	cc.unhookMessage(findSummon);
	cc.unhookJoin(greetAustin);
}