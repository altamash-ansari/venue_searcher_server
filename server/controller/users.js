var usermodel  = require('../model/users')
var buildmodel = require('../model/buildmodel')
var gapi       = require('../model/gapi')

// var uparams    = '';

module.exports = {
	before: [
		function() {
			//To get user wappers
			if (!this.req.body)
				return arguments[arguments.length - 1]()

			if (!this.req.body.user)
				return this.res.json({
					message: 'Send request is user wapper',
					error  : 'Invalid JSON format'
				})

			// uparams = this.req.body.user
			arguments[arguments.length - 1]()
		}
	],

	//To fetch all users
	get: function() {
		var self = this

		usermodel.getAll() //Fetch user from db
			.then(function(users) {
				self.res.json(users)
			}, function(err) {
				self.res.json({
					message: 'Cannot Fetch Users',
					error  : err
				})
			})

	},

	//To register the user
	post: function() {
		var self  = this
		var uparams = this.req.body.user
		var email = uparams.email
		var pass  = uparams.pass

		if (!(email && pass))
			return self.res.json({
				message: 'Email or Password cannot be blank',
				error  : 'Invalid data'
			})

		usermodel.registeruser(email, pass) //Save user in db
			.then(function(user) {
				user = user.toJSON()
				self.res.json({
					message :'Thank you ' + email + ' for creating id, login to comments'
				})
			}, function(err) {
				self.res.json(err.entity)
			})

	},

	//To login
	'/login': {
		//Traditional Login
		post: function() {
			var self  = this
			var uparams = this.req.body.user
			var email = uparams.email
			var pass  = uparams.pass

			if (!(email && pass))
				return self.res.json({
					message: 'Email or Password cannot be blank',
					error  : 'Invalid data'
				})

			usermodel.loginUser(email, pass) //Check user is valid in db
				.then(function(user) {
					self.res.setHeader('Set-Cookie', 'mycookie=test')
					self.res.json({
						message  : 'Welcome ' + email,
						uid      : user.data.uid,
						authtoken: user.data.authtoken
					})
				}, function(err) {
					self.res.json(err.entity)
				})

		},

		//Google login
		'/google': {
			get: function() {
				this.res.redirect(gapi.url)
				//this.res.end(gapi.url)
			}

		},

		//Google callback after sign-in
		'/oauth2callback': {
			get: function() {
				var self = this
				var code = this.req.query.code //received from google

				gapi.client.getToken(code, function(err, tokens) {

					if (err) return self.res.json({
						message: 'Invalid token',
						error  : 'Access denied.'
					})

					usermodel.loginGoogle(tokens.access_token) //upsert the user in db
						.then(function(user) {
							//self.res.redirect('file:///home/altamesh/Desktop/altamash/flatirondemo/task_built_google/client/index.html')
							self.res.json({
								message  : 'Welcome ' + user.data.email,
								uid      : user.data.uid,
								authtoken: user.data.authtoken
							})
						}, function(err) {
							self.res.json(err.entity)
						})
				})

			}

		}

	},

	//To logout the user
	'/logout': {
		delete: function() {
			var self = this
			var authtoken = this.req.headers['authtoken']

			// if (!buildmodel.user.isAuthenticated())
			// 	return self.res.json({
			// 		message: 'User not logged in',
			// 		error  : 'Access denied.'
			// 	})
			if(!authtoken)
				return self.res.json({
					message: 'User not logged in',
					error  : 'Access denied.'
				})
			
			usermodel.logoutUser(authtoken) //Remove the authtoken from db
				.then(function() {
					self.res.json({
						message: 'Logout Successfully'
					})
				}, function(err) {
					self.res.json(err.entity)
				})

		}

	},

	//Request forgot password
	'/forgotpassword': {
		post: function() {
			var self = this

			usermodel.forgot(uparams.email)
				.then(function() {
					self.res.json({
						message: 'Reset Password request send to email'
					})
				}, function(err) {
					self.res.json(err.entity)
				})

		}

	}

}