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

// globals for playlist
var playlist = [];

// stream track plus some globals to help out
var currentPlayer, isPlaying, currentIndex;
var streamTrack = function(track){
    return SC.stream('/tracks/' + track.id).then(function(player){
      currentPlayer = player;
      player.play();
      isPlaying = 1;
	  console.log("streamTrack");
    }).catch(function(){
      console.log(arguments);
    }); //end of return
};

// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});

// prototype for a track object
function track(id, uri, title, user, user_uri, art_uri) {
	this.id = id;
	this.uri = uri;
	this.title = title;
	this.user = user;
	this.user_uri = user_uri;
	this.art_uri = art_uri;
	this.play = SC.stream('/tracks/' + this.id).then(function(player){
		currentPlayer = player;
		player.play();
		isPlaying = 1;
		console.log("track play");
		console.log(player);
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
                return {label: formatedResults.title, value: formatedResults.uri}; // whats sent when a song is selected
            });
            response(results); //list of songs presented to user
        }).catch(function() {
            console.log("failed search", arguments);
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    // select is run when user selects a link
    select: function (event, ui) { 
		SC.resolve(ui.item.value).then(function(result){
			console.log("result", result);
			playlist.push(new track(result.id, result.uri, result.title, result.user.username, result.user.uri, result.artwork_url));
		    if (playlist.length == 1) {
				console.log("playlist length = 1")
				playlist[0].play
			}
			$(".playlist").append('<div class="queued-song" id="'+result.id+'"><li class="track-playlist"><img class="thumbnail" src='+result.artwork_url+'>'+result.title+'</li></div>');
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
        if (currentPlayer && isPlaying == 1) {
            console.log("paused clicked");
            currentPlayer.pause();
            isPlaying = 0;
        }
        else if (currentPlayer && isPlaying == 0) {
            currentPlayer.play();
            isPlaying = 1;
        }
      });

// next button
document.getElementById('button-next').addEventListener('click', function(){
        console.log("currentIndex next", currentIndex);
        console.log("playlist.length", playlist.length);
        if (currentIndex < playlist.length) {
            currentIndex ++;
            console.log(playlist[currentIndex]);
            SC.resolve(playlist[currentIndex]).then(streamTrack).catch(function() {
                console.log("caught error when playing to play next song in playlist.");
                currentIndex --;
            });
            
        }
        else {
            console.log("No songs next in playlist");
        }
      });
      
// previous button
document.getElementById('button-previous').addEventListener('click', function(){
        if (playlist.length >= 2 && currentIndex < playlist.length) {
            console.log("currentIndex prev", currentIndex);
            console.log("playlist.length prev", playlist.length);
            currentIndex --;
            SC.resolve(playlist[currentIndex]).then(streamTrack).catch(function() {
               console.log("caught an error when trying to play the previous song.");
               currentIndex ++;
            });
        }
        else {
            console.log("no previous song to play");
        }
      });
      
// queued song listener to play song you click on in playlist
$(document).on('click', ".queued-song", function(event) {
    console.log("I was clicked");
	console.log("id", this.id);
	console.log(playlist);
});
$('#title-box').html($('#track-playlist').html());

