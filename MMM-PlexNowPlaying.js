Module.register("MMM-PlexNowPlaying",{
    // Default module config.
    defaults: {
		//username: '',
		serverURL: '',
		updateInterval: 15 * 1000,
		delayCount: 5,
		delayInterval: 60 * 1000,
		animationSpeed: 1000,
    },
	getStyles: function() {
		return ['MMM-PlexNowPlaying.css']
	},
	start: function() {
		Log.info("Starting module: " + this.name);
		//set module data object
		this.songData = {playing: false};
		//prepare loading
		this.loaded = false;
		this.delay = this.config.updateInterval;
		this.failedCounter = 0;
		this.scheduleUpdate(0);
	},
    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = "Plex data...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if (this.config.serverURL == '') {
			wrapper.innerHTML = "Please check your config file: server URL is missing!";
			wrapper.className = "bright";
			return wrapper;
		}
		if(this.songData.playing){
			this.failedCounter = 0;
			this.delay = this.config.updateInterval;
			this.show(this.config.animationSpeed);
			var html = "<div class='player bright'><div class='album-art-container'><div class='album-art'><img src='"+ this.songData.image +"' width='200'></div></div><div class='meta'><table class='small'><tr class='track-name bright'><td>"+this.songData.title+"</td></tr><tr class='artist-name'><td>"+this.songData.artist +"</td></tr><tr class='album-name dimmed'><td>"+this.songData.album+"</td></tr></table></div></div>";
			wrapper.innerHTML = html;
		}
		else{
			this.hide(this.config.animationSpeed);
			this.failedCounter = this.failedCounter + 1;
			if(this.failedCounter > this.config.delayCount){
				this.delay = this.config.delayInterval;
			}
			this.songData = {playing:false};
			wrapper.innerHTML = "Not playing...";
		}
		this.scheduleUpdate(this.delay);
		return wrapper;
    },

	//  attrs: artist/album/title/thumb/state/device/deviceTitle/deviceVersion
	socketNotificationReceived: function(notification, payload){
		var self = this;
		if(notification == "PLEX_SUCCESS"){
			nowPlaying = payload;
			self.songData.playing = false;
			for (var i=0; i < nowPlaying.length; i++){
				track = nowPlaying[i];
				if(track.state != "playing") continue;

				self.songData = {}
				self.songData.title = track.title;
				self.songData.artist = track.artist;
				self.songData.album = track.album;
				self.songData.image = self.config.serverURL+track.thumb;
				self.songData.playing = true;
				break; ///  one song is enough for now
			}
		}
		else if(notification == "PLEX_FAIL"){
			Log.error(payload);
			self.songData = {playing:false};
			self.hide(1000);
		}
		self.loaded = true;
		self.updateDom(self.config.animationSpeed);
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.delay;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		//set update timeout
		var self = this;
		setTimeout(function() {
			//  ask for data
			self.sendSocketNotification('GETDATA', self.config.serverURL);
		}, nextLoad);
	}
});
