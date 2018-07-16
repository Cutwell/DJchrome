var setList = [];

// update active timestamp when playhead changes
function setByPlayhead() {
    // needs try to catch moment of getCurrentTime being NaN
    try {
        // round video timestamp in seconds down
        var seconds = Math.floor(decks[0].getCurrentTime());
        // convert seconds to HH:MM:SS
        var date = new Date(null);
        date.setSeconds(seconds);
        var timestamp = date.toISOString().substr(11, 8);
    } catch(err) {
        console.log(err)
        // set timestamp to zero as work around
        var timestamp = "00:00:00";
    }
    // determine the active timestamp
    if(activeTimestamp === 0) {
        // update #startTimestamp
        $("#startTimestamp").val(timestamp);
    } else {
        // update #endTimestamp
        $("#endTimestamp").val(timestamp);
    }
    // re-call this function every 1/10th of a second
    setTimeout(() => {
        setByPlayhead();
    }, 100);
}

function updatePlayhead(time) {
    // fixes bug where timestamp of form HH:MM:00
    // returns a value of HH:MM
    if((time.match(/:/g)||[]).length !== 2) {
        var time = time.concat(":00");
    }
    // convert HH:MM:SS to seconds
    var timestamp = time.split(':');
    var seconds = (+timestamp[0]) * 60 * 60 + (+timestamp[1]) * 60 + (+timestamp[2]);
    
    decks[0].seekTo(seconds);
}


function addToTracklist() {
    // get contents of input and reset it
    var video_url = $("#trackURL").val();
    $("#trackURL").val("");

    // get video url
    var video_id = video_url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }

    if(!($("#"+video_id).length)) {
        // get some data about the video
        $.getJSON("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+video_id+"&part=contentDetails&key=AIzaSyDygvBGKnc-d3MWje-RkwRRrIuWWai4GHs", function(data) {
            // get video title
            var title = data["items"]["0"]["snippet"]["title"]

            // add to select menu for mixer libary
            $("#trackSelect").append(
                "<option value="+video_id+">"+title+"</option>"
            );

            // update number of tracks in library
            $("#trackCount").text("Library - " + (document.getElementById("trackSelect").length-1) + " Tracks")
        });
    }
}

function loadVideo(track) {
    // get video id preemptively, may be overwritten by track object data
    var video_id = $("#trackSelect").val();
    // if track argument wasn't provided, load from #trackSelect
    if(typeof track === "undefined" && video_id !== "null") {
        // get video duration
        $.getJSON("https://www.googleapis.com/youtube/v3/videos?id="+video_id+"&part=contentDetails&key=AIzaSyDygvBGKnc-d3MWje-RkwRRrIuWWai4GHs", function(data) {
            // convert duration into seconds    
            var duration = data["items"]["0"]["contentDetails"]["duration"];
            var duration_seconds = moment.duration(duration).asSeconds();
            
            // load into player
            loadPlayer(video_id, 0, duration_seconds);
        });

    // otherwise load from the track object
    } else if(typeof track !== "undefined") {
        // load into player
        loadPlayer(track.id, track.start, track.end);
    }
}

function loadPlayer(video_id, start_seconds, end_seconds) {
    // try to destroy player if it exists
    try {
        decks[0].destroy();
    } catch(err) {console.log(err)}

    // load video into player
    decks[0] = new YT.Player('0', {
        width: '336',
        height: '189',
        videoId: video_id,
        events: {
            onReady: function() {
                // play video
                decks[0].playVideo();
                setByPlayhead();
            }
        },
        playerVars: { 
            'autoplay': 0,
            'controls': 1, 
            'rel' : 0,
            'fs' : 1,
            'modestbranding': 1,
            'start': start_seconds,
            'end': end_seconds,
        }
    });

    // make sure active timestamp is #startTimestamp
    activeTimestamp = 0;

    var start_time = new Date(null);
    var end_time = new Date(null);

    start_time.setSeconds(start_seconds);
    end_time.setSeconds(end_seconds);

    var start_timestamp = start_time.toISOString().substr(11, 8);
    var end_timestamp = end_time.toISOString().substr(11, 8);

    // update timestamps
    $("#startTimestamp").val(start_timestamp);
    $("#endTimestamp").val(end_timestamp);

    // set timestamps max value
    $("#startTimestamp").attr({"max" : end_timestamp});
    $("#endTimestamp").attr({"max" : end_timestamp});

    // display the mixer controls
    $("#0").css("display", "inline-block");
    $("#mixerControls").css("display", "block");
}

function addVideoToSetlist(track) {
    // convert start and end times to seconds
    var start_time = $("#startTimestamp").val();
    var start = start_time.split(':');
    var start_seconds = (+start[0]) * 60 * 60 + (+start[1]) * 60 + (+start[2]);

    var end_time = $("#endTimestamp").val();
    var end = end_time.split(':');
    var end_seconds = (+end[0]) * 60 * 60 + (+end[1]) * 60 + (+end[2]); 

    var video_id = $("#trackSelect").val();

    // check data is within valid ranges
    if(start_seconds <= end_seconds) {
        // if track object to save data to wasn't provided, create new
        if(typeof track === "undefined" && video_id !== "null") {
            // create track object with start and end times
            var track_object = {
                "id":video_id,
                "start":start_seconds,
                "end":end_seconds
            };
            // add to set list
            setList.push(track_object);

            // get the index of the track object
            var set_index = setList.length-1;

            $.getJSON("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+video_id+"&part=contentDetails&key=AIzaSyDygvBGKnc-d3MWje-RkwRRrIuWWai4GHs", function(data) {
                // get video title
                var title = data["items"]["0"]["snippet"]["title"]

                // add to select menu for mixer set list
                $("#setSelect").append(
                    "<option value="+set_index+">"+title+" - "+start_time+" : "+end_time+"</option>"
                );
                // update number of tracks in set list
                $("#setCount").text("Set - " + (document.getElementById("setSelect").length-1) + " Tracks")
            });

        // otherwise save to the track object
        } else if(typeof track !== "undefined") {
            track.start = start_seconds;
            track.end = end_seconds;

            var set_index = $("#setSelect").val();

            $.getJSON("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+track.id+"&part=contentDetails&key=AIzaSyDygvBGKnc-d3MWje-RkwRRrIuWWai4GHs", function(data) {
                // get video title
                var title = data["items"]["0"]["snippet"]["title"]
                // update set list timestamps
                $("option[value='"+set_index+"']").text(title+" - "+start_time+" : "+end_time);
            });
        }
        resetVideoPlayer();
    }
}

function resetVideoPlayer() {
    // unload videoPlayer object
    decks[0].destroy();

    // hide video controls
    $("#mixerControls").css("display", "none");
    
    // reset the select options
    $('#trackSelect').val("null");
    $('#setSelect').val("null");
}