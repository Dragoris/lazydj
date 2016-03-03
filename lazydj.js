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
/*$(function() {

    function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

        var result = { width: 0, height: 0, fScaleToTargetWidth: true };

        if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
            return result;
        }

        // scale to the target width
        var scaleX1 = targetwidth;
        var scaleY1 = (srcheight * targetwidth) / srcwidth;

        // scale to the target height
        var scaleX2 = (srcwidth * targetheight) / srcheight;
        var scaleY2 = targetheight;

        // now figure out which one we should use
        var fScaleOnWidth = (scaleX2 > targetwidth);
        if (fScaleOnWidth) {
            fScaleOnWidth = fLetterBox;
        }
        else {
           fScaleOnWidth = !fLetterBox;
        }

        if (fScaleOnWidth) {
            result.width = Math.floor(scaleX1);
            result.height = Math.floor(scaleY1);
            result.fScaleToTargetWidth = true;
        }
        else {
            result.width = Math.floor(scaleX2);
            result.height = Math.floor(scaleY2);
            result.fScaleToTargetWidth = false;
        }
        result.targetleft = Math.floor((targetwidth - result.width) / 2);
        result.targettop = Math.floor((targetheight - result.height) / 2);

        return result;
    }
});
*/
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
// globals for tracks and playlists.
var tracks, playlist = [];

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

// autocomplete thingy
$("#search").autocomplete({
    source: function (request, response) {
        SC.get('/tracks', {q: request.term}).then(function (songs) {
            //clean out the display_results array. to be shown to the user by autocomplete.
            var display_results = [];
            console.log(songs);
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
        // we are using the made ui variable have 2 numbers.
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

//play and pause button
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
document.getElementById('button-previous').addEventListener('click', function(){
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