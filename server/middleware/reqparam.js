module.exports = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin','*')
  req.once('end', function() {

    if (mime(req) === 'multipart/form-data')
      return next()

    req.body = req.body || ''

    if (req.chunks) {
      req.chunks.forEach(function(chunk) {
        req.body += chunk;
      })
    }

    try {
      if (req.body && req.body.length)
        JSON.parse(req.body)
      req.body = ''
    } catch (err) {
      return res.json({
        message: 'Malformed Body',
        error  : 'Invalid JSON format'
      })
    }

    next()
  })
}

var mime = function(req) {
  var str = req.headers['content-type'] || ''
  return str.split(';')[0]
}