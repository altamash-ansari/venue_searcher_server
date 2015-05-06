var multiparty = require('multiparty')
var when       = require('when')
var buildmodel = require('./buildmodel');

//to list all venues
exports.getAll = function(uid, authtoken) {
	var deferred = when.defer()

	buildmodel.venuequery
		.setHeader('authtoken', authtoken)
		.where('app_user_object_uid', uid || undefined)
		.toJSON()
		.exec()
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

//insert new venue
exports.updateVenue = function(venuedata, authtoken) {
	var deferred = when.defer()

	buildmodel.venueobj(venuedata)
		.setHeader('authtoken', authtoken)
		.save()
		.then(function(result) {
			deferred.resolve(result.toJSON())
		}, function(err) {
			deferred.reject(err)
		})

	return deferred.promise
}

//remove venue based on ID
exports.removeVenue = function(vid, authtoken) {
	var deferred = when.defer()

	buildmodel.venueobj({
			uid: vid
		})
		.setHeader('authtoken', authtoken)
		.delete()
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

//find venues based on name,location or type
exports.searchVenues = function(venuename, venuelocation, catagory) {
	var deferred = when.defer()
	
	var query    = []
	venuename 		? query.push(buildmodel.venuequery.where('venuename', {"$regex": venuename,"$options":"i"})):null
	venuelocation ? query.push(buildmodel.venuequery.where('venuelocation', {"$regex": venuelocation,"$options":"i"})): null
	catagory			? query.push(buildmodel.venuequery.where('catagory', {"$regex": catagory,"$options":"i"})):null

	buildmodel.venuequery
		.or(query)
		.toJSON()
		.exec()
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

//find venue based on ID
exports.findVenuebyID = function(vid) {
	var deferred = when.defer()

	buildmodel.venuequery
		.where('uid', vid)
		.toJSON()
		.exec()
		.then(deferred.resolve, deferred.reject)

	return deferred.promise
}

//write new comments
exports.writeComment = function(venues, useruid, authtoken) {
	var deferred = when.defer()

	this.findVenuebyID(venues.vid)
		.then(function(venue) {

			buildmodel.venueobj({
					'uid' : venues.vid
				})
				.setHeader('authtoken', authtoken)
				.pushValue('comments', {
					cid   : venue[0].comments ? venue[0].comments[venue[0].comments.length - 1].cid + 1 : 0,
					cname : useruid,
					cmsg  : venues.comment.cmsg,
					rating: venues.comment.rating || 0
				})
				.save()
				.then(deferred.resolve, deferred.reject)

		}, deferred.reject)

	return deferred.promise
}

//edit existing comment
exports.editComment = function(venue, cname, authtoken) {
	var self     = this
	var deferred = when.defer()

	this.findVenuebyID(venue.vid)
		.then(function(doc) {

			doc.forEach(function(indoc) {

				var arr          = indoc.comments
				var length       = arr.length
				var foundComment = false

				for (var i = 0; i < length; i++) {
					if (arr[i].cid == venue.comment.cid && arr[i].cname == cname) {
						arr[i].cmsg   = venue.comment.cmsg || arr[i].cmsg
						arr[i].rating = venue.comment.rating || arr[i].rating
						foundComment  = true
						break
					}
				}

				if (!foundComment)
					deferred.resolve(0)

				delete indoc.images
				self.updateVenue(indoc, authtoken)
					.then(deferred.resolve, deferred.reject)

			})

		}, deferred.reject)

	return deferred.promise
}

//remove existing comment
exports.removeComment = function(venue, cname) {
	var self     = this
	var deferred = when.defer()

	this.findVenuebyID(venue.vid)
		.then(function(doc) {

			doc.forEach(function(indoc) {

				var arr          = indoc.comments
				var length       = arr.length
				var foundComment = false

				for (var i = 0; i < length; i++) {
					if (arr[i].cid == venue.comment.cid && arr[i].cname == cname) {
						arr.splice(i, 1)
						foundComment = true
						break
					}
				}

				if (!foundComment)
					deferred.resolve(0)

				delete indoc.images
				self.updateVenue(indoc)
					.then(deferred.resolve, deferred.reject)

			})

		}, deferred.reject)

	return deferred.promise
}

//view user comment
exports.viewComment = function(useruid, authtoken) {
	var deferred   = when.defer()
	var self       = this
	var uservenues = []

	this.getAll('', authtoken)
		.then(function(venues) {
			venues.map(function(venue) {

				var usercomment = []
				venue.comments.map(function(comment) {

					if (comment.cname == useruid) {
						usercomment.push(comment)
					}

				})

				if (usercomment[0]) {
					uservenues.push({
						uid      : venue.uid,
						venuename: venue.venuename,
						comments : usercomment
					})
				}
			})

			deferred.resolve(uservenues)
		}, deferred.reject)

	return deferred.promise
}

//upload the multiple image
exports.saveImage = function(vid, req) {
	var deferred   = when.defer();
	
	var form       = new multiparty.Form()	
	form.uploadDir = 'images';

	form.parse(req, function(err, fields, files) {

		if (err) return deferred.reject(err)

		if (!Object.keys(files).length)
			return deferred.reject('Send images in upload wrapper')

		for (var file in files) {

			var count = 0;
			buildmodel.upload
				.setFile(files[file][0].path)
				.save()
				.then(function(img) {

					fs.unlink('images/' + img.params.filename)

					buildmodel.venueobj({
							uid: vid,
						})
						.pushValue('images', img.toJSON().uid)
						.save()
						.then(function(result) {
							count++
							if (count == Object.keys(files).length)
								deferred.resolve(result)
						}, deferred.reject)

				}, deferred.reject)

		}

	})

	return deferred.promise
}