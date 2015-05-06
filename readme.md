/**************************************************************************
*	Name   		 = Yelp Demo Task																							*
*	Author 		 = Altamash	Ansari																						*
*	Desciption = To simulate the yelp api server using Nodejs and Flatiron	*
**************************************************************************/

Routes Availables
-------------------------------------------
-----------------------
-			Users calls			-
-----------------------

/users (post call)
	- To register the user
	- JSON Parameters
		{
	    "user": {
        "email": "email",
        "pass": "pass"
	    }
		}	

/users/login (post call)
	- To login in the application
	- JSON Params
		{
	    "user": {
        "email": "email",
        "pass": "pass"
	    }
		}	

/users/login/google (get call)
	- To login in the application with google

/users/logout (delete call)
	- Header
		- authtoken
	- To Logout

-----------------------
-			Venues calls		-
-----------------------

/venues (get call)
	- To View All Veunes

/venues (post call)
	- Add the Veune in application
	- Header
		- authtoken
	- JSON Params
		{
	    "venue": {
	      "vid": "vid",
	      "venuename": "venuename",
	      "address":"address",
	      "venuelocation":"venuelocation",
	      "catagory":"catagory"
	    }
		}

/venues/:vid (put call)
	- Add the Veune in application
	- Header
		- authtoken
	- JSON Params
		{
	    "venue": {
	      "venuename": "venuename",
	      "address":"address",
	      "venuelocation":"venuelocation",
	      "catagory":"catagory"
	    }
		}

/venues/:vid (delete call)
	- Remove the Veune in application
	- Header
		- authtoken

/venues/search (get call)
	- To search the Veune based on name or location
	- Query Params
		- venuename or  venuelocation

/venues/comments (get call)
	- To View current user comments
	- Header
		- authtoken
		- uid

/venues/comments (post call)
	- To Write Comment on Venue, u need to login to comment
	- Header
		- authtoken
		- uid
	- JSON Params
		{
	    "venue": {
        "vid": "vid",
        "comment": {
          "cmsg":"cmsg",
          "rating":"rating"
        }
	    }
		}

/venues/comments (put call)
	- To Edit ur comments
	- Header
		- authtoken
		- uid
	- JSON Params
		{
	    "venue": {
        "vid": "vid",
        "comment": {
        	"cid": cid,
          "cmsg":"cmsg",
          "rating":"rating"
	        }
	    }
		}

/venues/comments (delete call)
	- To remove ur comment
	- Header
		- authtoken
		- uid
	- JSON Params
		{
	    "venue": {
        "vid": "vid",
        "comment": {
        	"cid": cid
        }
	    }
		}

/venues/upload/:vid (post call)
	- To upload images on Venue
	- Header
		- authtoken
	- Form data
		- upload (image file)