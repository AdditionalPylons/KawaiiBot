function reply (from, to) {
	// body...
	return to[0] == "#" ? to : from; 
}

exports.reply = reply;

function splitText(text)
{
	return text.split(" ").slice(1);
}

exports.splitText = splitText;

function trimCommandFromText(text)
{
	return splitText(text).join(" ");
}

exports.trimCommandFromText = trimCommandFromText;