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

// stream track plus some globals to help out
var currentPlayer, isPlaying, currentIndex;
var streamTrack = function(track){
    return SC.stream('/tracks/' + track.id).then(function(player){
      currentPlayer = player;
      player.seek(0);
      player.play();
      isPlaying = 1;
      console.log("streamTrack");
      // add an event listener to the SC player to play the next song
      currentPlayer.on('finish', function() {
        console.log("the song has finished");
        document.getElementById('next').click();
    });
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
        // play the first song only
        if (playlist.length == 1) {
            SC.resolve(songUri).then(streamTrack);
            currentIndex = 0;
        }
        $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[songIndex].artwork_url+'>'+tracks[songIndex].title+'</li></div>');
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
document.getElementById('play').addEventListener('click', function(){
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
document.getElementById('next').addEventListener('click', function(){
    console.log("currentIndex", currentIndex);
    console.log("playlist.length", playlist.length);
    if (currentIndex < playlist.length) {
        currentIndex ++;
        console.log(playlist[currentIndex]);
        SC.resolve(playlist[currentIndex]).then(streamTrack);
        
    }
    else {
        console.log("No songs next in playlist");
    }
});
      
// previous button
document.getElementById('previous').addEventListener('click', function(){
    if (playlist.length >= 2 && currentIndex < playlist.length) {
        console.log("currentIndex prev", currentIndex);
        console.log("playlist.length prev", playlist.length);
        currentIndex --;
        SC.resolve(playlist[currentIndex]).then(streamTrack);
    }
    else {
        console.log("Something went wrong...");
    }
});