var when       = require('when')
var node       = require('when/node')
var buildmodel = require('./buildmodel')

exports.getAll = function() {
	var deferred = when.defer()

	var userquery = buildmodel.builtApp.setMasterKey('bltf8bba1eae2b6380c')
		.Class('built_io_application_user').Query()

	userquery.toJSON()
		.exec()
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

exports.registeruser = function(email, pass) {
	var deferred = when.defer()

	buildmodel.user()
		.register(email, pass, pass)
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

exports.loginUser = function(email, pass) {
	var deferred = when.defer()

	buildmodel.user()
		.login(email, pass)
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

exports.loginGoogle = function(access_token) {
	var deferred = when.defer()

	buildmodel.user()
		.loginWithGoogle(access_token)
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

exports.logoutUser = function(authtoken) {
	var deferred = when.defer()

	try {
		buildmodel.user()
			.setHeader('authtoken', authtoken)
			.logout()
			.then(deferred.resolve, deferred.reject)
	} catch (e) {
		deferred.resolve({
			entity: {
				message: 'Logout Successfully'
			}
		})
	}

	return deferred.promise
}

exports.forgot = function(email) {
	var deferred = when.defer()

	buildmodel.user()
		.forgotPassword(email)
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}