var flatiron = require('flatiron')
var fs       = require('fs')
var app      = flatiron.app

app.use(flatiron.plugins.http, {
	before: [
		require('./middleware/cors'),
		require('./middleware/reqparam'),
		require('./middleware/requestlog'),
		require('./middleware/poweredby')
	]
})

app.use(flatiron.plugins.static, {
	root: __dirname
})

//Server starting
var server = app.listen(process.env.PORT || 8888, function(err) {
	console.log('Server started at', server.address().port)
})

app.router.get('/', function() {
	this.res.end('Hello!')
})

app.router.get('/readme', function() {
	var self = this
	fs.readFile('readme.md', function(err, data) {
		if (err) return self.res.json(err)
		self.res.end(data)
	})
})

app.router.mount(require('./routes'))