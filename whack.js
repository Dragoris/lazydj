// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});

lazyDj = function () {
    var currentPlayer, isPlaying, currentIndex, titleIndex;
    var playlist = [];
    var trackNames= [];
    
    var streamTrack = function(track){
        return SC.stream('/tracks/' + track.id).then(function(player){
          currentPlayer = player;
          player.play();
          isPlaying = 1;
          currentTitle();
          console.log(currentIndex);
            }).catch(function(){
          console.log(arguments);
        }); //end of return
        };
    //trying to set title-box to show the current song. 
    function currentTitle() {
        if (currentIndex !== titleIndex){
            console.log("title check");
            titleIndex = currentIndex;
        $('#title-box').html(trackNames[titleIndex]);
        }
    }
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
        select: function (event, ui) {
            // ui variable is from the jquery autocomplete spec. We know it will have
            // the lable and value returned in source:.
            playlist.push(ui.item.value);
            console.log(playlist); // add selected song to the paylist
            //accessing the selected songs JSON properties to add them to the side menu.
            SC.resolve(ui.item.value).then(function (appendHTML){
                console.log(appendHTML);
                // sending HTML to the side menu
                $(".playlist").append('<div class="queued-song"><div class="track-playlist"><img class="thumbnail" src='+ appendHTML.artwork_url+'>'+ appendHTML.title+'<a href='+appendHTML.user.permalink_url+ ' target="_blank"><img class=user src ='+ appendHTML.user.avatar_url+' </a></div></div>');
                $('img').error(function(){ //back img if .artwork_url=null
                    $(this).attr('src', 'http://gfm.fm/assets/img/default-albumart.png');
                }).then(function (appendHTML){
                        trackNames.push(appendHTML.title);
                        console.log(trackNames);
                        

                    });
            });
            if (playlist.length == 1) { // play the first song only
                SC.resolve(ui.item.value).then(streamTrack).catch(function(){
                    console.log("error playing 1 track in playlist");
                    currentIndex = 0;
                    currentTitle();
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
    
    // play and pause button
    document.getElementById('play').addEventListener('click', function(){
        if (currentPlayer && isPlaying == 1) {
            console.log("paused clicked");
            currentPlayer.pause();
            isPlaying = 0;
        }
        else if (currentPlayer && isPlaying === 0) {
            currentPlayer.play();
            isPlaying = 1;
        }
      });


    // next button
    document.getElementById('next').addEventListener('click', function(){
        console.log("currentIndex next", currentIndex);
        console.log("playlist.length", playlist.length);
        if (currentIndex < playlist.length) {
            currentIndex ++;
            currentTitle();
            console.log(playlist[currentIndex]);
            SC.resolve(playlist[currentIndex]).then(streamTrack).catch(function() {
                console.log("caught error when playing to play next song in playlist.");
                currentIndex --;
                currentTitle();
            });
            
        }
        else {
            console.log("No songs next in playlist");
        }
      });
      
    // previous button
    document.getElementById('last').addEventListener('click', function(){
        if (playlist.length >= 2 && currentIndex < playlist.length) {
            console.log("currentIndex prev", currentIndex);
            console.log("playlist.length prev", playlist.length);
            currentIndex --;
            currentTitle();
            SC.resolve(playlist[currentIndex]).then(streamTrack).catch(function() {
               console.log("caught an error when trying to play the previous song.");
               currentIndex ++;
               currentTitle();
            });
        }
        else {
            console.log("Something went wrong...");
        }
      });
      
    // queued song listener to play song you click on in playlist
    $(document).on('click', ".queued-song", function(event) {
        console.log("I was clicked");
        var targetElement = $(event.target);
        console.log(targetElement);
        var indexx = target.index();
        console.log(target.text());
        console.log(playlist, indexx);
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