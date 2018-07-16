var trackNumber = 0;

var deck_one;
var deck_two;
var decks = [deck_one, deck_two];

function nextTrack(index) {
    // try to load the next track
    try {
        var set_object = setList[trackNumber];
        trackNumber++;

        decks[index] = new YT.Player(index.toString(), {
            width: '336',
            height: '189',
            videoId: set_object.id,
            
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            },
            playerVars: { 
                'autoplay': 0,
                'controls': 0, 
                'rel' : 0,
                'fs' : 0,
                'modestbranding': 1,
                'start': set_object.start,
                'end': set_object.end,
            }
        });
    } catch(err) {console.log(err)}
}

// autoplay video
function onPlayerReady(event) {
    if(decks[0].getPlayerState() === 5 && decks[1] == null) {
        $("#playSet").css("display", "none");
        $("#leftdisc").addClass("spin-animation");
        decks[0].playVideo();
        nextTrack(1);
    } else if(event.target.getPlayerState() === 5) {
        // force player to buffer video by playing for half a second then pausing and returning playhead to correct position
        var time = event.target.getCurrentTime();
        event.target.mute();
        event.target.playVideo();
        setTimeout(() => {
            resetPlayhead(event, time)
        }, 500);
    }
}

function resetPlayhead(player, time) {
    player.target.pauseVideo();
    player.target.unMute();
    player.target.seekTo(time);
}

// when video ends
function onPlayerStateChange(event) {
    try {
        if(event.target.getPlayerState() === 0) {
            var deck_index = decks.indexOf(event.target);
            event.target.destroy();
            decks[deck_index] = null;
            if(deck_index === 0) {
                $("#leftdisc").removeClass("spin-animation");
                $("#rightdisc").addClass("spin-animation");
                nextTrack(0);
                decks[1].playVideo();
            } else {
                $("#rightdisc").removeClass("spin-animation");
                $("#leftdisc").addClass("spin-animation");
                nextTrack(1);
                decks[0].playVideo();
            }
        }
    } catch(err) {
        console.log(err)
        var empty = true;
        for(var i = decks.length; i--;) {
            if(decks[i] !== null && decks[i] !== undefined) {
                empty = false;
            }
        }
        if(empty) {
            trackNumber = 0;
            $("#leftdisc").removeClass("spin-animation");
            $("#rightdisc").removeClass("spin-animation");
            $("#playSet").css("display", "inline-block");
            playing = false;
        }
    }
}