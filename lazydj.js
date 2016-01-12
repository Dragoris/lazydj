var canvas = document.getElementById("MainCanvas");
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var imageObj = new Image();
imageObj.onload = function () {
    var wRatio = canvas.width / imageObj.width;
    var hRatio = canvas.height / imageObj.height;
    var ratio = Math.min(wRatio, hRatio);
    context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
};
imageObj.src = "images/Boose Boosington.jpg";

// globals for tracks and playlists.
var tracks, playlist = [];

// play/pause button logic
var currentPlayer, isPlaying;
var nextIndex = 0;
var streamTrack = function(track){
    console.log("track", track);
    return SC.stream('/tracks/' + track.id).then(function(player){
      currentPlayer = player;
      player.play();
      isPlaying = 1;
      nextIndex ++;
    }).catch(function(){
      console.log(arguments);
    }); //end of return
};

// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});

// autocomplete thingy
$("#search").autocomplete({
    source: function (request, response) {
        SC.get('/tracks', {q: request.term}).then(function (songs) {
            //clean out the display_results array. to be shown to the user by autocomplete.
            var display_results = [];
            //console.log(songs);
            for (var i = 0; i < songs.length; i++) {
                var songObj = songs[i];
                var index = i.toString() + " ";
                var uri = " " + songObj.uri;
                if(songObj.streamable) {
                    display_results.push({
                        label: songObj.title,
                        value: index + songObj.id + uri
                    });
                }
                else {
                    songs.splice(i,1);
                }
            } // end of for loop
            tracks = songs;
            //console.log("track", tracks);
            response(display_results);
        }).catch(function() {
            console.log("failed search", arguments);
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    // select is run when user selects a link
    select: function (event, ui) {
        // ui variable is from the jquery autocomplete spec. We know it will have
        // the value of the item selected in the drop down list.
        // we are using the made the ui variable have 2 numbers.
        // to extract the meaningful numbers we are spliting the sting.
        var split = ui.item.value.split(" ");
        var songIndex = split[0];
        var sondID = split[1];
        var songUri = split[2];
        // add selected song to playlist array
        playlist.push(songUri);
        if (nextIndex == 0) {
            SC.resolve(songUri).then(streamTrack);
        }
        $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[songIndex].artwork_url+'>'+tracks[songIndex].title+'</li></div>');
        /*
        SC.stream("/tracks/"+ songId).then(function(player){
            player.play();
            // inject html - will always do when a song is selected
            $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[songIndex].artwork_url+'>'+tracks[songIndex].title+'</li></div>');
        }).catch(function() {
            console.log("failed streaming", arguments);
        });
        */
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

// play and pause button on cli
document.getElementById('play').addEventListener('click', function(){
        if (currentPlayer && isPlaying == 1) {
            console.log("YAYYAYAYA", currentPlayer);
            currentPlayer.pause();
            isPlaying = 0;
        }
        else if (currentPlayer && isPlaying == 0) {
            currentPlayer.play();
            isPlaying = 1;
        }
      });
      
document.getElementById('next').addEventListener('click', function(){
        console.log("nextIndex", nextIndex);
        console.log("playlist.length", playlist.length);
        console.log(playlist);
        if (nextIndex <= playlist.length) {
            console.log(playlist[nextIndex]);
            SC.resolve(playlist[nextIndex]).then(streamTrack);
        }
        else {
            console.log("No songs next in playlist");
        }
      });
