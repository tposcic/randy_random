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
}

const app = new App;

document.addEventListener("DOMContentLoaded", function(){
    let start = document.getElementById('start');
    let autoplayToggle = document.getElementById('autoplayToggle');
    let replayToggle = document.getElementById('replayToggle');

    start.onclick = function() {
        app.playRandom();
    };

    autoplayToggle.onchange = function() {
        app.toggleAutoplay(this);
    }

    replayToggle.onchange = function() {
        app.toggleReplay(this);
    }
});
