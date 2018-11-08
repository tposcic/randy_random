class App{
    constructor(){
        let app = this;

        this.routes = {
            randomTrack: './scripts/random.php',
            singleTrack: './scripts/single.php'
        }
        this.autoplay = true;
        this.replay = false;
        this.currentTrack = null;
        this.player = null;
        this.seeker = null;
        this.timerDisplay = null;
        this.currentTrackMetadata = {};

        document.addEventListener("DOMContentLoaded", function(){
            app.initPlayer();
        });

        document.addEventListener("metadataChange", function(){
            app.showMetadata();
            app.showNotification(app);
        });
    }
    /**
     * Initialize the player
     */
    initPlayer(){
        let app = this;
        app.player = document.getElementById('player');
        app.setDefaults();
        app.seeker = document.getElementById('seeker');
        app.timerDisplay = document.getElementById('timerDisplay');

        app.player.addEventListener('ended', function() {
            if(app.autoplay){
                if(app.replay){
                    app.play(app.currentTrack);
                } else {
                    app.playRandom();
                }
            }
        }, true);

        app.player.ontimeupdate = function(){
            if(!isNaN(app.player.currentTime) && !isNaN(app.player.duration)){
                app.seeker.value = app.player.currentTime/app.player.duration;
                app.timerDisplay.innerHTML = app.toHHMMSS(app.player.currentTime)+' / '+app.toHHMMSS(app.player.duration);
            } else {
                app.seeker.value = 0;
                app.timerDisplay.innerHTML = '00:00 / 00:00';
            }
        }
        app.seeker.onclick = function(e){
            app.player.currentTime = ((e.pageX - this.offsetLeft) * this.max / this.offsetWidth) * app.player.duration;
        }
    }
    setDefaults(){
        this.autoplay = JSON.parse(localStorage.getItem('autoplay')) || true;//not working yet, fix pls
        document.getElementById('autoplayToggle').checked = this.autoplay;//not working yet, fix pls
        //this.replay = input.checked;
        this.player.volume = localStorage.getItem('volume') || '0.5';
        document.getElementById('volumeRange').value = this.player.volume;

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
     * Show current track metadata
     */
    showMetadata(){
        document.getElementById('trackInfo').innerHTML = 
        '<h3 class="trackMetaSnippet artistTitle">'+this.currentTrackMetadata.tags.artist+'</h3>'+
        '<h3 class="trackMetaSnippet trackTitle">'+this.currentTrackMetadata.tags.title +'</h3>'+
        '<h3 class="trackMetaSnippet albumTitle">'+this.currentTrackMetadata.tags.album+'</h3>';
    }
    /**
     * Show notification of the current track playing
     * @param {App} app 
     */
    showNotification(app){
        if (Notification.permission !== "granted"){
            Notification.requestPermission();
        } else {
            let notification = new Notification('Now playing', {
                icon: './assets/img/notification_button.png',
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
    }
    /**
     * Startup the random player
     */
    playRandom(){
        this.request(this.routes.randomTrack, this.play);
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
     * @param {HTMLElement} input 
     */
    toggleAutoplay(input){
        this.autoplay = input.checked;
        localStorage.setItem('autoplay', input.checked);
    }
    /**
     * Toggle replaying of the current track
     * @param {HTMLElement} input 
     */
    toggleReplay(input){
        this.replay = input.checked;
        localStorage.setItem('replay', input.checked);
    }
    /**
     * Change the volume of the player
     * @param {HTMLElement} input 
     */
    changeVolume(input){
        let player = document.getElementById('player');
        player.volume = input.value;
        localStorage.setItem('volume', input.value);
    }
    /**
     * Format seconds string to HHMMSS
     * @param {String} time 
     */
    toHHMMSS(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if(hours > 0){
            if (hours   < 10) {hours   = "0"+hours+':';}
        } else {
            hours = '';
        }
        
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+minutes+':'+seconds;
    }
}

const app = new App;
const startText = ["My body is ready", "Just click it!", "Are you oiled up properly?", "Just do it!", "Clickity click", "The hills are alive with the sound of..."];

// Bind click and change events
document.addEventListener("DOMContentLoaded", function(){
    let startButton = document.getElementById('start');
    startButton.onclick = function() {
        app.playRandom();
        //remove the start button once clicked
        let wrapper = this.parentNode;
        wrapper.parentNode.removeChild(wrapper);
    };
    startButton.innerHTML = startText[Math.floor(Math.random() * startText.length)]
    document.getElementById('random').onclick = function() {
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

