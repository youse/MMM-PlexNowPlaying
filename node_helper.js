/* Magic Mirror
 * Node Helper: MMM-PlexNowPlaying
 *
 * By Bryan Youse
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var parseString = require('xml2js').parseString;
//const util = require("util");

module.exports = NodeHelper.create({
	//  Subclass start method
	start: function() {
		console.log("Started node_helper.js for MMM-PlexNowPlaying");
	},

	extractData: function(xmlobj){
		playlist = []
		//console.dir(xmlobj);

		var tracks = 0;
		if ( xmlobj.MediaContainer.Track !== undefined )
			tracks = parseInt(xmlobj.MediaContainer.Track.length, 10);
		for(var i = 0; i < tracks; i++){
			out = {}

			var track = xmlobj.MediaContainer.Track[i];
			var trackAttrs = track.$;

			out.artist = trackAttrs.grandparentTitle;
			out.album = trackAttrs.parentTitle;
			out.title = trackAttrs.title;
			out.thumb = trackAttrs.thumb;

			player = track.Player[0].$;
			out.state = player.state;  //  namely "playing", "paused"
			out.device = player.device;
			out.deviceTitle = player.title;
			out.deviceVersion = player.version;

			playlist.push(out);
		}

		var videos = 0;
		if ( xmlobj.MediaContainer.Video !== undefined )
			videos = parseInt(xmlobj.MediaContainer.Video.length, 10);
		for(var i = 0; i < videos; i++){
			out = {}

			var video = xmlobj.MediaContainer.Video[i];
			var videoAttrs = video.$;

			//  get the year as line 2
			fulldate = videoAttrs.originallyAvailableAt;
			if ( fulldate === undefined )
				out.artist = '';
			else{
				var date = new Date(fulldate);
				out.artist = date.getFullYear();
			}

			//  get the tagline as line 3
			var tagline = videoAttrs.tagline;
			if ( tagline !== undefined )
				out.album = videoAttrs.tagline;
			else
				out.album = '';
			out.title = videoAttrs.title;
			out.thumb = videoAttrs.thumb;

			player = video.Player[0].$;
			out.state = player.state;  //  namely "playing", "paused"
			out.device = player.device;
			out.deviceTitle = player.title;
			out.deviceVersion = player.version;

			playlist.push(out);
		}

		return playlist;
	},

	socketNotificationReceived: function(notification, payload) {
		if ( notification == "GETDATA" ){
			var self = this;
			var plexURL = payload+'/status/sessions';
			if(payload.token){
				plexURL += "?X-Plex-Token=" + payload.token;
			}
			request({ url: plexURL, method: 'GET' }, function(error, response, body) {
				//console.log(error);
				//console.log(response);
				//console.log(body);
				if(!error && response.statusCode == 200){
					parseString(body, function ( err, result ) {
						extracted = self.extractData(result);
						//console.dir(extracted);
					});
					self.sendSocketNotification('PLEX_SUCCESS', extracted);
				}
				else{
					var error = body.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|'); // turns html response into readable format in console
					self.sendSocketNotification('PLEX_FAIL', "PLEX_FAIL: " + error);
				}
			});
		}
	}

});
