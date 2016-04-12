// playlist button logic
$(function() {
    var listButton = document.getElementById('toggle-list');
    var list = document.getElementById('screen-wrapper');
    listButton.addEventListener('click', function(){
            if(listButton.classList.contains("hide-list")) {
                listButton.classList.remove("hide-list");
                list.classList.remove("hide-list");
            }else{
                listButton.classList.add("hide-list");
                list.classList.add("hide-list");
            }
    });
});

// resize canvas
$(function() {
    var canvas = document.getElementById("MainCanvas");
    var context = canvas.getContext("2d");
    var listButton = document.getElementById('toggle-list');
    var list = document.getElementById('screen-wrapper');
    window.onresize = resizeCanvas;
        initialize();
    function  initialize() {
        listButton.addEventListener('click', resizeCanvas);
        resizeCanvas();
    }
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        redraw();
    }
    function redraw() {
        var imageObj = new Image();
        imageObj.src = "images/Boose Boosington.jpg";
        imageObj.onload = function () {
        context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
        };
    }
    
});

// draw canvas
$(function() {
var imageObj = new Image();
imageObj.onload = function () {
    canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.width = canvas.height *
                    (canvas.clientWidth / canvas.clientHeight);
    context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
};
});

// global for playlist
var playlist = [];

// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});

// get index of current track playing
function get_playing() {
    var index = playlist.map(function(pTrack) {
        return pTrack.is_playing;
    }).indexOf(true);
    return index;
}

// get index of current track that is paused
function get_paused() {
    var index = playlist.map(function(pTrack) {
        return pTrack.is_paused;
    }).indexOf(true);
    return index;
}

// prototype for a track object
function track(id, uri, title, user, user_uri, art_uri) {
    this.id = id;
    this.uri = uri;
    this.title = title;
    this.user = user;
    this.user_uri = user_uri;
    this.art_uri = art_uri;
    this.is_playing = false;
    this.is_paused = false;
    this.player;
}

track.prototype.play = function(){
    
    // index of track calling play
    var index = this.index;
    console.log("play index", this.index);
    
    // stream track and set the playing track's attributes
    SC.stream('/tracks/' + playlist[this.index].id).then(function(player){
        playlist[index].player = player;
        player.play();
        playlist[index].is_playing = true;
        
        // play next song (if there is one) after the current is finished
        playlist[index].player.on('finish', function () {
            console.log("finished a song");
            var next_index = index + 1;
            if (next_index < playlist.length) {
                playlist[index].is_playing = false;
                console.log("next after finished", playlist);
                playlist[next_index].play();
            }
        });
    }).catch(function(){
        console.log(arguments);
    });
}

// autocomplete thingy
$("#search").autocomplete({
    source: function (request, response) {
        SC.get('/tracks', {q: request.term}).then(function (results) {
            //filtering results to only get streamable results
            results = results.filter(function(formatedResults){
                return formatedResults.streamable;
            //chaining methods to format filtered results and return a new array
            }).map(function(formatedResults){
                return {label: formatedResults.title, value: formatedResults.uri}; // whats sent when a track is selected
            });
            response(results); //list of tracks presented to user
        }).catch(function() {
            console.log("failed search", arguments);
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    // select is run when user selects a link
    select: function (event, ui) { 
        SC.resolve(ui.item.value).then(function(result){
            //console.log("result", result);
            selected_track = new track(result.id, result.uri, result.title, result.user.username, result.user.uri, result.artwork_url);
            playlist.push(selected_track);
            selected_track.index = playlist.length - 1;
            if (playlist.length == 1) {
                playlist[0].play(); // we know its the first track so use 0
            }
            $(".playlist").append('<div class="queued-song" id="'+selected_track.index
            +'"><li class="track-playlist"><img class="thumbnail" src='+result.artwork_url
            +'>'+result.title+'</li></div>');
        });
        return false; // so we won't have the value put in the search box after selected
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },
    close: function() {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
});
// end of autocomplete

// play and pause button
document.getElementById('button-play').addEventListener('click', function(){
    var index = get_playing();
    // if there are no tracks playing maybe one is paused. try looking for a paused track.
    if(index === -1) {
        index = get_paused();
    }
    
    var track = playlist[index];
    
    if (track.player && track.is_playing) {
        track.player.pause();
        track.is_playing = false;
        track.is_paused = true;
    }
    else if (track.player && track.is_paused) {
        track.player.play();
        track.is_playing = true;
        track.is_paused = false;
    }
});

// next button
document.getElementById('button-next').addEventListener('click', function(){
    var index = get_playing();
    if(index === -1) {
        index = get_paused();
    }
    var next_index = index + 1;
    console.log("next index is_playing", index);
    console.log("next playlist_length", playlist.length);

    if (next_index < playlist.length) {
        playlist[index].is_playing = false;
        playlist[index].is_paused = false;
        console.log("palylist", playlist);
        playlist[next_index].play();
    }
    else {
        console.log("no track next in playlist");
    }
});
      
// previous button
document.getElementById('button-previous').addEventListener('click', function(){
    var index = get_playing();
    if(index === -1) {
        index = get_paused();
    }
    var prev_index = index - 1;
    if (prev_index >= 0) {
        console.log("prev index is_playing", index);
        console.log("prev playlist_length", playlist.length);
        playlist[index].is_playing = false;
        playlist[index].is_paused = false;
        playlist[prev_index].play();
    }
    else {
        console.log("no previous track to play");
    }
});
      
// queued song listener to play track you click on in the playlist
$(document).on('click', ".queued-song", function(event) {
    var stopping_song = get_playing();
    
    if(stopping_song === -1) {
        stopping_song = get_paused();
        playlist[stopping_song].is_paused = false;
    }
    playlist[stopping_song].is_playing = false;
    
    playlist[parseInt(this.id)].play();
});
