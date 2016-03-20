// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});


lazyDj = function () {
    var currentPlayer, isPlaying, currentIndex, tracks;
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
                songs = songs.filter(function(streamCheck){
                    return streamCheck.streamable;
                }).map(function(streamCheck){
                    return {label: streamCheck.title, value: streamCheck.uri};
                });
                response(songs);
            });

        },
        maxResults: 10,
        minLength: 3, //min input length needed to fire source anon func
        // select is run when user selects a link
        select: function (event, ui) {
            // ui variable is from the jquery autocomplete spec. We know it will have
            // the value of the item selected in the drop down list.
            console.log(ui.item.value);
            SC.resolve(ui.item.value).then(streamTrack).catch(function(){
                console.log("error playing 1 track in playlist");
                currentIndex = 0;
            $(".playlist").append('<div class="queued-song"><li class="track-playlist"><img class="thumbnail" src='+tracks[songIndex].artwork_url+'>'+tracks[songIndex].title+'</li></div>');
                
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