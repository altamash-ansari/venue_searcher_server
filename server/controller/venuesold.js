var venuemodel = require('../model/venues')
var buildmodel = require('../model/buildmodel')

var vparams = ''

module.exports = {
	before : [
		function (){

			if(!this.req.body)
				return arguments[arguments.length-1]()

			if(!this.req.body.venue)
				return this.res.json({
					message : 'Send request is venue wapper',
					error 	: 'Invalid JSON format'
				})

			vparams = this.req.body.venue				
			arguments[arguments.length-1]()
		}
	],

	//To Get all venues
	get: function() {
		var self = this

		venuemodel.getAll() //Fetch all venues from db
		.then(function(venues) {
			self.res.json(venues)
		}, function(err) {
			self.res.json({
				message : 'Cannot fetch venues',
				error   : err
			})
		})
	},

	//To insert new venue
	post: function() {
		var self 					= this

		if (!buildmodel.user.isAuthenticated())
	 		return self.res.end('Login to Add Venue')
			
		if (!(vparams.venuename && vparams.address && vparams.venuelocation && vparams.catagory))
			return self.res.end('venuename, address, venuelocation or catagory cannot be empty')

		venuemodel.updateVenue(vparams) //Insert the venue in db
		.then(function(result) {
			self.res.json({
				message : 'Added Successfully',
				venue 	: result
			})
		}, function(err) {
			self.res.json({
				message : 'Cannot Add Venue',
				error   : err
			})
		})	

	},

	//To edit venue
	put: function() {
		var self 					= this

		if (!buildmodel.user.isAuthenticated())
	 		return self.res.end('Login to Add Venue')

	 	if (!vparams.vid)
	 		return self.res.end('Cannot find Venue')
			
		if (!(vparams.venuename || vparams.address || vparams.venuelocation || vparams.catagory))
			return self.res.end('venuename, address, venuelocation or catagory cannot be empty')

		venuemodel.updateVenue(vparams) //update the veune in db
		.then(function(result) {
			self.res.json({
				message : 'Updated Successfully',
				venue 	: result
			})
		}, function(err) {
			self.res.json({
				message : 'Cannot Update Venue',
				error   : err
			})
		})	

	},

	//To remove venue
	delete: function (){
		var self = this

		if (!buildmodel.user.isAuthenticated())
	 		return self.res.end('Login to Remove Venue')

		if (!vparams.vid)
			return self.res.end('Cannot find Venue')

		venuemodel.removeVenue(vparams.vid) //Remove the venue from db
		.then(function (result){
			self.res.json({
				message : vparams.vid + ' Deleted successfully'
			})	
		},function (err){
			self.res.json({
				message : 'Cannot Remove Venue',
				error   : err
			})
		})		

	},

	//Find a particular venue
	'/search': {
		get: function (){
			var self 				 	= this
			var venuename 		= this.req.query.venuename
			var catagory 			= this.req.query.catagory
			var venuelocation = this.req.query.venuelocation

			if (!(venuename || catagory || venuelocation))
				return self.res.end('No search result')

			venuemodel.searchVenues(venuename, venuelocation, catagory) //Find the venues
			.then(function (venues){		
				self.res.json(venues)
			},function (err){
				self.res.json({
					message : 'Cannot find Venue',
					error   : err
				})
			})

		}

	},

	//Comment on venue
	'/comments': {
		//To get logged in user comments
		get: function () {
			var self = this

			if (!buildmodel.user.isAuthenticated())
				return self.res.end('Login to view comment')

			buildmodel.user.getSession() //To get the current logged user
			.then(function (user){

				venuemodel.viewComment(user.data.uid) //Fetch the comment of current user
				.then(function(venues) {
					self.res.json(venues)
				}, function(err) {
					self.res.json({
						message : 'Cannot find User Comments',
						error   : err
					})
				})
			}, function(err){
				self.res.json({
					message : 'Invalid Session',
					error   : err
				})
			})
				
		},

		//To add new comment on venue
		post: function (){
			var self 		= this

			if (!buildmodel.user.isAuthenticated())
				return self.res.end('Login to comment')

			if (!(vparams.vid && vparams.comment.cmsg))
				return self.res.end('Cannot find Venue')

			buildmodel.user.getSession() //To get the current logged user
			.then(function (user){

				venuemodel.writeComment(vparams, user.data.uid) //Insert the new comment in venue
				.then(function(result) {
					self.res.json(result)
				}, function(err) {
					self.res.json({
						message : 'Failed to write Comment',
						error   : err
					})
				})
			}, function(err){
				self.res.json({
					message : 'Invalid Session',
					error   : err
				})
			})					
				
		},

		//To edit comment on venue
		put: function (){
			var self = this
			var cid	 = vparams.comment.cid

			if (!buildmodel.user.isAuthenticated())
				return self.res.end('Login to comment')

			if (!(vparams.vid && cid))
				return self.res.end('Cannot find venue')

			buildmodel.user.getSession() //To get the current logged user
			.then(function (user){
				//Update the comment of current user
				venuemodel.editComment(vparams, user.data.uid)
				.then(function(result) {	
					if (result === 0)
						return self.res.end('Not your comment')
					
					self.res.json({
						message : 'Comment of user ' + user.data.uid + ' At position ' + cid + ' Editted successfully',
						venue   : result
					})
				}, function(err) {
					self.res.json({
						message : 'Cannot Edit Comment',
						error   : err
					})
				})
			}, function(err){
				self.res.json({
					message : 'Invalid Session',
					error   : err
				})
			})				
				
		},

		//To remove comment on venue
		delete: function () {
			var self 			= this
			var cid 			= vparams.comment.cid
				
			if (!buildmodel.user.isAuthenticated())
				return self.res.end('Login to delete comment')

			if (!(vparams.vid && cid))
				return self.res.end('Cannot find venue')

			buildmodel.user.getSession() //To get the current logged user
			.then(function (user){
				//Remove the comment of current user
				venuemodel.removeComment(vparams, user.data.uid)
				.then(function(result) {
					if (result === 0)
						return self.res.end('Not your comment')
					
					self.res.json({
						message : 'Comment of user ' + user.data.uid + ' At position ' + cid + ' Deleted successfully',
						venue   : result
					})
				}, function(err) {
					self.res.json({
						message : 'Cannot Remove Comment',
						error   : err
					})
				})
			}, function(err){
				self.res.json({
					message : 'Invalid Session',
					error   : err
				})
			})

		}
	},

	//To upload images for venue
	'/upload/:vid': {
		post: function (vid) {
			var self = this

			if (!buildmodel.user.isAuthenticated())
				return self.res.end('Login to upload')
				
			if (!vid) 
				return self.res.end('Cannot find venue')
			//Insert the image for venue
			venuemodel.saveImage(vid, self.req, self.res)
			.then(function (result){
				self.res.json(result)
			},function (err){
				self.res.json({
					message : 'Failed to upload image',
					error   : err
				})
			})	
				
		}

	}
}

//upload the single image (venue model function)
/*exports.saveImage = function(vid, req) {
	var deferred = when.defer();
	var self = this

	var form = new multiparty.Form()	

	savePath 			 = 'images';
	form.uploadDir = savePath;

	form.parse(req, function(err, fields, files) {
		//deferred.resolve(savePath)
		if (err) return deferred.reject(err)
	
		if(!(files && files.upload)){
			for (var file in files) {
				fs.unlink(files[file][0].path)
			}
			return deferred.reject('Send image in upload wrapper')
		}

		saveFilename 	 = new Date().getTime() + '.jpg';
		filepath = savePath + '/' + saveFilename
		
		fs.rename(files.upload[0].path, filepath, function(err) {
			
			if (err) {
				fs.unlink(files.upload[0].path)
				return deferred.reject(err)
			}
			
			buildmodel.upload
			.setFile(filepath)
			.save()
			.then(function (img){
				
				fs.unlink(filepath)
				buildmodel.venueobj({
					uid: vid,					
				})
				.pushValue('images', img.toJSON().uid)
				.save()
				.then(deferred.resolve, deferred.reject)

			}, deferred.reject)
		})
	})

	return deferred.promise
}*/