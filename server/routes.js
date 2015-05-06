var users  = require('./controller/users')
var venues = require('./controller/venues')

var routes = {
	'/users' : users, //user routes	
	'/venues': venues //venue routes
}

module.exports = routes