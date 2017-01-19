/* Magic Mirror
 * Node Helper: MMM-PlexNowPlaying
 *
 * By Bryan Youse
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var parseString = require('xml2js').parseString;

module.exports = NodeHelper.create({
	//  Subclass start method
	start: function() {
		console.log("Started node_helper.js for MMM-PlexNowPlaying");
	},

	extractData: function(xmlobj){
		playlist = []
		//console.dir(xmlobj);
		var tracks = parseInt(xmlobj.MediaContainer.$.size, 10);
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
		return playlist;
	},

	socketNotificationReceived: function(notification, payload) {
		if ( notification == "GETDATA" ){
			var self = this;
			var plexURL = payload+'/status/sessions';
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
					self.sendSocketNotification('PLEX_FAIL', body);
				}
			});
		}
	}

});
