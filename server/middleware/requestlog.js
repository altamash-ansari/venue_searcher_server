module.exports = function(req, res, next) {
	var url    = req.url	
	var header = req.headers['x-forwarded-for'] || req.connection.remoteAddress
	var method = req.method
	var id     = Math.floor(Math.random() * 100000)

	console.log(header, '- [', new Date, ']', method, url)

	next()
}