class App{
    constructor(){
        let app = this;

        this.autoplay = true;
        this.replay = false;
        this.origin = 'get_track.php'; // origin of the tracks
        this.currentTrack = null;
        this.currentTrackMetadata = {};

        document.addEventListener("DOMContentLoaded", function(){
            let player = document.getElementById('player');

            player.addEventListener('ended', function() {
                if(app.autoplay){
                    if(app.replay){
                        app.play(app.currentTrack);
                    } else {
                        app.playRandom();
                    }
                }
            }, true);
        });

        document.addEventListener("metadataChange", function(){
            document.getElementById('artistTitle').innerHTML = app.currentTrackMetadata.tags.artist;
            document.getElementById('songTitle').innerHTML = app.currentTrackMetadata.tags.title;
            document.getElementById('albumTitle').innerHTML = app.currentTrackMetadata.tags.album;
            //console.log(app.currentTrackMetadata.tags);

            if (Notification.permission !== "granted")
                Notification.requestPermission();
            else {
                let notification = new Notification('Now playing', {
                    icon: './notification_button.png',
                    body: app.currentTrackMetadata.tags.artist+' - '+app.currentTrackMetadata.tags.title,
                    requireInteraction: false,
                    priority: 0,
                });

                notification.onclick = function(event) {
                    event.preventDefault();
                    app.playRandom();
                    notification.close();
                }

                setTimeout(function() {
                    notification.close();
                }, 5000);
            }

        });
    }
    /**
     * Create a get request
     * @param {*} url 
     * @param {*} callbackFunction 
     */
    request(url, callbackFunction = false){
        let app = this;

        var r = new XMLHttpRequest();
        r.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if(callbackFunction){
                    //ovo smece izbaci van
                    window.jsmediatags.read(this.response, {
                        onSuccess: function(tag) {
                            let event = new Event('metadataChange');
                            app.currentTrackMetadata = tag;
                            document.dispatchEvent(event);
                        },
                        onError: function(error) {
                            app.currentTrackMetadata = {tags:{title:'',album:'',artist:''}};
                        }
                    });

                    app.currentTrack = this.response;
                    callbackFunction(this.response);
                }
            }
        };
        r.open("GET", url, true);
        r.responseType = 'blob';
        r.send();
    }
    /**
     * Startup the random player
     */
    playRandom(){
        this.request(this.origin, this.play);
    }
    /**
     * Play a track
     * @param {*} track 
     */
    play(track){
        let trackURL = window.URL.createObjectURL(track)
        let player = document.getElementById('player');
        player.src = trackURL;
        player.play();
    }
    /**
     * Console log a message
     * @param {*} message 
     */
    log(message){
        console.log(message);
    }
    /**
     * Toggle autoplaying
     * @param {*} input 
     */
    toggleAutoplay(input){
        this.autoplay = input.checked;
    }
    toggleReplay(input){
        this.replay = input.checked;
    }
    changeVolume(input){
        let player = document.getElementById('player');
        player.volume = input.value;
    }
}

const app = new App;

// Bind click and change events
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('start').onclick = function() {
        app.playRandom();
    };
    document.getElementById('autoplayToggle').onchange = function() {
        app.toggleAutoplay(this);
    }
    document.getElementById('replayToggle').onchange = function() {
        app.toggleReplay(this);
    }
    document.getElementById('volumeRange').onchange = function(){
        app.changeVolume(this);
    }
});
