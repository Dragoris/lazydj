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

// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});

// initializing imgur
//1c7add0ada51fdb3fab779ea91de1c979d69291f - secret
//741e9e3e85ee15d - client id
$.ajax({
   url: 'https://api.imgur.com/oauth2/authorize?client_id=741e9e3e85ee15d&response_type=token' ,
   success: function(data, status, xhr) {
       console.log(xhr.getResponseHeader("Set-Cookie"));
    }
})
// some globals to help out
var currentPlayer, isPlaying, currentIndex, playlist = [];
var tracks = [];
// stream track variable and function - starts a stream for a song
var streamTrack = function(track){
    return SC.stream('/tracks/' + track.id).then(function(player){
      player.seek(0);
      player.play();
      currentPlayer = player;
      isPlaying = 1;
      console.log("streamTrack");
    }).catch(function(){
      console.log(arguments);
    }); //end of return
};

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
            response(display_results);
            tracks = songs;
        }).catch(function() {
            console.log("failed search", arguments);
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    // select is run when user selects a link
    select: function (event, ui) {
        /*
           ui variable is from the jquery autocomplete spec. We know it will have
           the value of the item selected in the drop down list.
           in source we add data to the value of the items in the drop down list.
           we are using the ui variable as a sort of package to send strings.
           to extract the meaningful data from the package we are spliting the sting.
        */
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

}); // end of autocomplete

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
    // TODO don't allow spamming of this button
    if (currentIndex < playlist.length - 1) {
        currentIndex ++;
        SC.resolve(playlist[currentIndex]).then(streamTrack);
    }
    else {
        console.log("No songs next in playlist");
    }
    //console.log("currentIndex next", currentIndex);
    //console.log("playlist.length next", playlist.length);
});
      
// previous button
document.getElementById('previous').addEventListener('click', function(){
    // TODO don't allow spamming of this button
    if (playlist.length >= 2 && currentIndex < playlist.length) {
        currentIndex --;
        SC.resolve(playlist[currentIndex]).then(streamTrack);
    }
    else {
        console.log("No songs previous in playlist");
    }
    //console.log("currentIndex prev", currentIndex);
    //console.log("playlist.length prev", playlist.length);
});