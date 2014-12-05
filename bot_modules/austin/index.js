var regex = /((WHERE'S|(WHERE IS)){1} (AUSTIN|ANNIHILATES){1})+/ig;

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

exports.init = function(cc)
{
	cc.registerCommand('.summon', summon)
	cc.hookMessage(findSummon);
}

exports.destroy = function(cc)
{
	// unregister
}