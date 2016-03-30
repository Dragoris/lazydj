// initializing soundcloud (SC object)
SC.initialize({
    client_id: 'b11dd654670362e6d5b12263d9f51b78'
});


var currentPlayer, isPlaying, currentIndex, titleIndex;
var playlist = [];
var SongCollection= {};

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

function views (){
    console.log('im viewed');
    events.on('Song Added', renderSideMenu);
    events.on('Song Added', renderTextBox);
    function renderSideMenu(JSONsong){
        console.log('im rendered');
        // sending HTML to the side menu
         $(".playlist").append('<div class="queued-song"><div class="track-playlist"><img class="thumbnail" src='+
            JSONsong.artwork_url+'>'+ JSONsong.title+'<a href='+JSONsong.user.permalink_url+ ' target="_blank"><img class=user src ='+
            JSONsong.user.avatar_url+' </a></div></div>');
        $('img').error(function(){ //back img if .artwork_url=null
            $(this).attr('src', 'http://gfm.fm/assets/img/default-albumart.png');
        });
    }
    function renderTextBox(JSONsong){
        console.log(JSONsong);
        $("#title-box").text(JSONsong.title);
    }
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
                return {label: formatedResults.title, value: formatedResults.uri}; // whats sent when a song is selected
            });
            response(results); //list of songs presented to user
        });
    },
    maxResults: 10,
    minLength: 3, //min input length needed to fire source anon func
    select: function (event, ui) {
        // ui variable is from the jquery autocomplete spec. We know it will have
        // the lable and value returned in source:.
        //accessing the selected songs JSON properties to add them to the side menu.
            views();
            SC.resolve(ui.item.value).then(function (JSONsong){
                console.log(JSONsong);
                playlist.push(JSONsong);
                console.log(playlist);
                events.emit('Song Added', JSONsong);

                console.log(events.events);
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
        console.log("play list search", playlist[1].uri, typeof(playlist));
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