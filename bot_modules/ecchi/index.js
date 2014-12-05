var utils = require('utils');

var oauth = require(__dirname + '/oauth.json');
var libpantsu = require('libpantsu');

var pantsu = new libpantsu.Pantsu('.ecchi', oauth);

exports.init = function(cc)
{
	pantsu.init(cc)
}

exports.destroy = function(cc)
{
	pantsu.destroy(cc);
}