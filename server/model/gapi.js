var google        = require('googleapis')
var OAuth2Client  = google.auth.OAuth2

var CLIENT_ID     = '979748879451-ll93pain6jeol7ldu624apimte1668et.apps.googleusercontent.com'
var CLIENT_SECRET = 'FHF9XfalTNzLbIrlvFaV_UIb'
var REDIRECT_URL  = 'http://localhost:8888/users/login/oauth2callback'

var oauth2Client  = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

var url           = oauth2Client.generateAuthUrl({
											access_type: 'offline',
											scope: 'https://www.googleapis.com/auth/userinfo.email'
										})

module.exports.client = oauth2Client
module.exports.url    = url