// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});


lazyDj = function () {
    var currentPlayer, isPlaying, currentIndex;
    var playlist = [];
    
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
    // autocomplete
    $("#search").autocomplete({
        source: function (request, response) {
            SC.get('/tracks', {q: request.term}).then(function (songs) {
                //filtering results to only get streamable songs
                songs = songs.filter(function(streamCheck){
                    return streamCheck.streamable;
                //chaining methods to format filtered songs and return a new array
                }).map(function(streamCheck){
                    return {label: streamCheck.title, value: streamCheck.uri}; // whats sent when a song is selected
                });
                response(songs); //list of songs presented to user
            });
        },
        maxResults: 10,
        minLength: 3, //min input length needed to fire source anon func
        // select is run when user selects a link
        select: function (event, ui) {
            // ui variable is from the jquery autocomplete spec. We know it will have
            // the lable and value returned in source:.
            playlist.push(ui.item.value); // add selected song to the paylist
            //accessing the selected songs JSON properties to add them to the side menu.
            SC.resolve(ui.item.value).then(function (append){
                console.log(append);
                $(".playlist").append('<div class="queued-song"><div class="track-playlist"><img class="thumbnail" src='+ append.artwork_url+'>'+ append.title+'<a href='+append.user.permalink_url+ ' target="_blank"><img class=user src ='+ append.user.avatar_url+' </a></div></div>');
            });

            if (playlist.length == 1) { // play the first song only
                SC.resolve(ui.item.value).then(streamTrack).catch(function(){
                    console.log("error playing 1 track in playlist");
                    currentIndex = 0;
                });
            }
            return false; // so we won't have the value put in the search box after selected
           
           
        },
        open: function () {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function() {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });
}();








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