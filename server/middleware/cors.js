var cors    = require('connect-cors')


module.exports = function(req, res, next) {
  var requestedHeaders = req.headers['access-control-request-headers']
  var headers = (requestedHeaders && requestedHeaders.split(', ')) || Object.keys(req.headers)

  return cors({
    origins: [],
    methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    headers: headers
  })(req, res, next) 
}