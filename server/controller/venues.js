var venuemodel = require('../model/venues')
var buildmodel = require('../model/buildmodel')

// var vparams    = ''

module.exports = {
	before: [
		function() {
			//To get venue wappers
			if (!this.req.body)
				return arguments[arguments.length - 1]()

			if (!this.req.body.venue)
				return this.res.json({
					message: 'Send request is venue wapper',
					error  : 'Invalid JSON format'
				})

			// vparams = this.req.body.venue
			arguments[arguments.length - 1]()
		}
	],

	//To Get all venues
	get: function() {
		var self = this
		var uid = this.req.headers['uid']

		venuemodel.getAll(uid) //Fetch all venues from db
			.then(function(venues) {
				self.res.json(venues)
			}, function(err) {
				self.res.json({
					message: 'Cannot fetch venues',
					error  : err
				})
			})
	},

	//To insert new venue
	post: function() {
		var self      = this
		var vparams   = this.req.body.venue
		var authtoken = this.req.headers['authtoken']

		if (!authtoken)
			return self.res.json({
				message: 'Login to Add Venue',
				error  : 'Access denied.'
			})

		if (!(vparams.venuename && vparams.address && vparams.venuelocation && vparams.catagory))
			return self.res.json({
				message: 'venuename, address, venuelocation or catagory cannot be empty',
				error  : 'Invalid data'
			})

		venuemodel.updateVenue(vparams, authtoken) //Insert the venue in db
			.then(function(result) {
				self.res.json({
					message: 'Added Successfully',
					venue  : result
				})
			}, function(err) {
				self.res.json({
					message: 'Cannot Add Venue',
					error  : err
				})
			})

	},

	//Find a particular venue
	'/search': {
		get: function() {
			var self          = this
			var venuename     = this.req.query.venuename
			var catagory      = this.req.query.catagory
			var venuelocation = this.req.query.venuelocation

			if (!(venuename || catagory || venuelocation))
				return self.res.json({
					message: 'No search result',
					error  : 'Invalid data.'
				})

			venuemodel.searchVenues(venuename, venuelocation, catagory) //Find the venues
				.then(function(venues) {
					self.res.json(venues)
				}, function(err) {
					self.res.json({
						message: 'Cannot find Venue',
						error  : err
					})
				})

		}

	},

	//Comment on venue
	'/comments': {
		//To get logged in user comments
		get: function() {
			var self      = this
			var authtoken = this.req.headers['authtoken']
			var uid       = this.req.headers['uid']

			if(!(authtoken && uid))
				return self.res.json({
					message: 'Login to view comments',
					error  : 'Access denied.'
				})

			venuemodel.viewComment(uid, authtoken)
				.then(function(venues) {
					self.res.json(venues)
				}, function(err) {
					self.res.json({
						message: 'Cannot find User Comments',
						error  : err
					})
				})

		},

		//To add new comment on venue
		post: function() {
			var self      = this
			var vparams   = this.req.body.venue
			var authtoken = this.req.headers['authtoken']
			var uid       = this.req.headers['uid']

			if(!(authtoken && uid))
				return self.res.json({
					message: 'Login to view comments',
					error  : 'Access denied.'
				})

			if (!(vparams.vid && vparams.comment.cmsg))
				return self.res.json({
					message: 'vid and cmsg is required',
					error  : 'Invalid data'
				})

			// 	Insert the new comment in venue
			venuemodel.writeComment(vparams, uid, authtoken)
				.then(function(result) {
					self.res.json({
						message: 'Comment of user ' + uid + 'Saved successfully',
						venue  : result
					})
				}, function(err) {
					self.res.json({
						message: 'Failed to write Comment',
						error  : err
					})
				})

		},

		//To edit comment on venue
		put: function() {
			var self      = this
			var vparams   = this.req.body.venue			
			var authtoken = this.req.headers['authtoken']
			var uid       = this.req.headers['uid']
			var cid       = vparams.comment.cid

			if(!(authtoken && uid))
				return self.res.json({
					message: 'Login to view comments',
					error  : 'Access denied.'
				})

			if (!(vparams.vid && cid))
				return self.res.json({
					message: 'vid and cid is required',
					error  : 'Invalid data'
				})

			
			//Update the comment of current user
			venuemodel.editComment(vparams, uid, authtoken)
				.then(function(result) {
					if (result === 0)
						return self.res.json({
							message: 'Not your comment',
							error  : 'Access denied.'
						})

					self.res.json({
						message: 'Comment of user ' + uid + ' At position ' + cid + ' Editted successfully',
						venue  : result
					})
				}, function(err) {
					self.res.json({
						message: 'Cannot Edit Comment',
						error  : err
					})
				})

		},

		//To remove comment on venue
		delete: function() {
			var self      = this
			var vparams   = this.req.body.venue
			var authtoken = this.req.headers['authtoken']
			var uid       = this.req.headers['uid']
			var cid       = vparams.comment.cid

			if(!(authtoken && uid))
				return self.res.json({
					message: 'Login to view comments',
					error  : 'Access denied.'
				})

			if (!(vparams.vid && cid))
				return self.res.json({
					message: 'vid and cid is required',
					error  : 'Invalid data'
				})

		
			//Remove the comment of current user
			venuemodel.removeComment(vparams, uid)
				.then(function(result) {
					if (result === 0)
						return self.res.json({
							message: 'Not your comment',
							error  : 'Access denied.'
						})

					self.res.json({
						message: 'Comment of user ' + uid + ' At position ' + cid + ' Deleted successfully',
						venue  : result
					})
				}, function(err) {
					self.res.json({
						message: 'Cannot Remove Comment',
						error  : err
					})
				})

		}
	},

	//To upload images for venue
	'/upload/:vid': {
		post: function(vid) {
			var self = this
			var authtoken = this.req.headers['authtoken']

			if(!authtoken)
				return self.res.json({
					message: 'Login to view comments',
					error  : 'Access denied.'
				})

			if (!vid)
				return self.res.json({
						message: 'vid is required',
						error  : 'Invalid data'
					})

			//Insert the image for venue
			venuemodel.saveImage(vid, self.req)
				.then(function(result) {
					self.res.json(result)
				}, function(err) {
					self.res.json({
						message: 'Failed to upload image',
						error  : err
					})
				})

		}

	},

	'/:vid': {
		get: function(vid) {
			var self = this

			venuemodel.findVenuebyID(vid) //Fetch all venues from db
				.then(function(venues) {
					self.res.json(venues)
				}, function(err) {
					self.res.json({
						message: 'Cannot fetch venues',
						error  : err
					})
				})
		},

	//To edit venue
		put: function(vid) {
			var self = this
			var vparams = this.req.body.venue
			var authtoken = this.req.headers['authtoken']

			if (!authtoken)
				return self.res.json({
					message: 'Login to Add Venue',
					error  : 'Access denied.'
				})

			if (!vid)
				return self.res.json({
					message: 'vid is required',
					error  : 'Invalid data'
				})

			if (!(vparams.venuename || vparams.address || vparams.venuelocation || vparams.catagory))
				return self.res.json({
					message: 'venuename, address, venuelocation or catagory cannot be empty',
					error  : 'Invalid data'
				})

			vparams.vid = vid
			venuemodel.updateVenue(vparams, authtoken) //update the veune in db
				.then(function(result) {
					self.res.json({
						message: 'Updated Successfully',
						venue  : result
					})
				}, function(err) {
					self.res.json({
						message: 'Cannot Update Venue',
						error  : err
					})
				})
		},

		//To remove venue
		delete: function(vid) {
			var self      = this
			var authtoken = this.req.headers['authtoken']

			if (!authtoken)
				return self.res.json({
					message: 'Login to Delete Venue',
					error  : 'Access denied.'
				})

			if (!vid)
				return self.res.json({
					message: 'vid is required',
					error  : 'Invalid data'
				})

			venuemodel.removeVenue(vid, authtoken) //Remove the venue from db
				.then(function(result) {
					self.res.json({
						message: vid + ' Deleted successfully'
					})
				}, function(err) {
					self.res.json({
						message: 'Cannot Remove Venue',
						error  : err
					})
				})
		}
		
	}
}