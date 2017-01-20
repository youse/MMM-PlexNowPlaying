# MMM-PlexNowPlaying
This is an extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). It displays the currently playing music of your [Plex Media Server](plex.tv).

It works & looks exactly like [MMM-Scrobbler](https://github.com/PtrBld/MMM-Scrobbler).  The PMS actually can scrobble to last.fm, but unfortunately it doesn't implement the "now playing" feature of last.fm.  Hence, this module was born :)

## Installation

Navigate into your MagicMirror's `modules` folder:

```
git clone https://github.com/youse/MMM-PlexNowPlaying.git
cd MMM-PlexNowPlaying
npm install
```

The last part is to pull in the lovely [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) XML parser.

##Module Usage
The entry in the `module array` in your `config.js` can look as follows. The serverURL field is **mandatory**. All other fields have default values.

```
        {   
            module: 'MMM-PlexNowPlaying',
            disabled: false,
            position: 'top_left',
            config: {
                serverURL: 'http://your-plex-server-address:32400',
                updateInterval: 10 * 1000,  // how often to poll for song change while listening (default 10s) 
                delayCount: 5,  // how many empty queries before deciding we aren't listening
                delayInterval: 60 * 1000,  // how often to poll for new listening activity (default 60s)
                animationSpeed: 1000
            }
        }
```
