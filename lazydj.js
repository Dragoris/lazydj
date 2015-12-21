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
var current_player;

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
            console.log(songs);
            for (var i = 0; i < songs.length; i++) {
                var song_obj = songs[i];
                var id = i.toString() + " ";
                if(song_obj.streamable) {
                    display_results.push({
                        label: song_obj.title,
                        value: id + song_obj.id
                    });
                }
                else {
                    songs.splice(i,1);
                }
            } // end of for loop
            tracks = songs;
            console.log("track", tracks);
            response(display_results);
        }).catch(function() {
            console.log("failed search", arguments);
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    // select is run when user selects a link
    select: function (event, ui) {
        
        var split = ui.item.value.split(" ");
        var streamplayer = streamsc(split[1]);
        console.log(streamplayer);
        streamplayer.play();
        $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[split[0]].artwork_url+'>'+tracks[split[0]].title+'</li></div>');
        SC.stream("/tracks/"+ split[1]).then(function(player){
        if (current_player) {
            current_player.pause();
        }
        current_player = player;
        console.log(current_player,"current");
        console.log(player);
        player.play();
        // inject html - will always do when a song is selected
        $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[split[0]].artwork_url+'>'+tracks[split[0]].title+'</li></div>');
        }).catch(function() {
            console.log("failed streaming", arguments);
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
