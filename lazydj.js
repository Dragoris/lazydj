//event emitter
var events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};
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
function track(id, uri, title, user, user_uri, art_uri, avatar_url, permalink_url){
	this.id = id;
	this.uri = uri;
	this.title = title;
	this.user = user;
	this.user_uri = user_uri;
	this.art_uri = art_uri;
    this.avatar_url = avatar_url;
    this.permalink_url = permalink_url;
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
        player.seek(0);
        player.play();
        playlist[index].is_playing = true;
        var songTitle = playlist[index].title;
        events.emit('CurrentSong', songTitle);
        if(events.events.SongPlaying.length===0){
            events.emit('SongPlaying');
        }
        
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
};
// rendering html when notified
events.on('SongAdded', renderSideMenu);
events.on('CurrentSong', renderTitleBox);
events.on('PlayPauseClicked', togglePlayPause);
events.on('SongPlaying', renderimage);
events.on('StartImages', renderimage);

function renderSideMenu(song){
    console.log('im rendered', song);
    // sending HTML to the side menu
     $(".playlist").append('<div class="queued-song" id ='+song.index+'><img class="album-art" src='+
        song.art_uri+'>'+'<div class= "song-title">'+
        song.title+'</div>'+'<div class ="user-avatar"> <a href ='+
        song.permalink_url+ ' target="_blank"><img src ='+
        song.avatar_url+' </a><div class ="user-name"> Upladed by: '+song.user+ '</div></div>');
    $('img').error(function(){ //back up img if .artwork_url=null
        $(this).attr('src', 'http://gfm.fm/assets/img/default-albumart.png');
        console.log(this);
    });
}
function renderTitleBox(songTitle){
    $(".title-box").text(songTitle);
    console.log('titlebox', songTitle);
}
function togglePlayPause(toggle){
    var file= "http://dragoris.github.io/lazydj/images/";
    if (document.getElementById('play-pause').src ===file +"pause.svg"){
        document.getElementById('play-pause').src = file +"play.svg";
        console.log("2");
    }else{
        document.getElementById('play-pause').src = file + "pause.svg";
    }

}
function renderimage(change){
    var file= "images/Backgrounds/";
    var backgoundImages = [file+'1.jpg', file+'2.jpg', file+'3.jpg', file+'4.jpg', file+'5.jpg',
     file+'6.jpg', file+'7.jpg', file+'8.jpg', file+'9.jpg', file+'10.jpg', file+'11.jpg',
     file+'12.jpg', file+'13.jpg', file+'14.jpg', file+'15.jpg', file+'16.jpg', file+'17.jpg',
     file+'18.jpg', file+'19.jpg', file+'20.jpg'];
    var imageIndex;

    function cycleImage(){
        console.log('im cycling', backgoundImages[imageIndex]);

        $(".main-background").fadeOut( "slow", "linear", function(){
            imageIndex = Math.floor(Math.random() * (backgoundImages.length - 1)) + 1;
            $(".main-background").css("background", "url("+backgoundImages[imageIndex]+")no-repeat center center fixed");
            $(".main-background").fadeIn('slow', "linear");
        });
        if(events.events.SongPlaying.length===0){
            console.log('paused images');
            clearInterval(cycling);
        }
    }
        var cycling = setInterval(cycleImage, 5000);


}
// autocomplete
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
        SC.resolve(ui.item.value).then(function (JSONsong){
            var song = new track(JSONsong.id, JSONsong.uri, JSONsong.title, JSONsong.user.username, JSONsong.user.uri,
                JSONsong.artwork_url, JSONsong.user.avatar_url, JSONsong.user.permalink_url);
            playlist.push(song);
            console.log("song", song);
            song.index= playlist.length -1;
            events.emit('SongAdded', song);
                if (playlist.length == 1) {
				playlist[0].play(); // we know its the first track so use 0
                events.emit('StartImages');
                
			}
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
document.getElementById('play-pause').addEventListener('click', function(){
    events.emit('PlayPauseClicked');
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

        events.off('SongPlaying', renderimage);
    }
    else if (track.player && track.is_paused) {
        track.player.play();
        track.is_playing = true;
        track.is_paused = false;
        events.on('SongPlaying', renderimage);
        events.emit('SongPlaying');
    }
});

// next button
document.getElementById('next').addEventListener('click', function(){
    var index = get_playing();
    if(index === -1) {
        index = get_paused();
        events.emit('PlayPauseClicked');
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
document.getElementById('previous').addEventListener('click', function(){
    var index = get_playing();
    if(index === -1) {
        index = get_paused();
        events.emit('PlayPauseClicked');
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
//play when song in side menu is clicked
$(document).on('click', ".queued-song", function(event) {
    var stopping_song = get_playing();
    if(stopping_song === -1) {
        stopping_song = get_paused();
        playlist[stopping_song].is_paused = false;
        events.emit('PlayPauseClicked');
        events.emit('SongPlaying');
    }
    playlist[stopping_song].is_playing = false;
    playlist[parseInt(this.id)].play();
});

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
