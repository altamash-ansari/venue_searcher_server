var built      = require('built.io');

var builtApp   = built.App('blt6422b64d1bf7e26d')
	.setHost('code-bltdev.cloudthis.com')
	// .persistSessionWith(built.Session.COOKIE);
var user       = builtApp.User;
var venue      = builtApp.Class('venues');
var venueobj   = venue.Object;
var venuequery = venue.Query();
var upload     = builtApp.Upload();

module.exports.builtApp   = builtApp;
module.exports.user       = user;
module.exports.venue      = venue;
module.exports.venueobj   = venueobj;
module.exports.venuequery = venuequery;
module.exports.upload     = upload;