var activeTimestamp = 0;
var activeList = 0;
var playing = false;

function changeTab(tab_id) {
    // hide all tabs
    $("#mixer").css("display", "none");
    $("#export").css("display", "none");

    // show selected tab
    $(tab_id).css("display", "block");

    // remove 'active-tab' class from all tabs
    $("#mixerTab").removeClass("active-tab");
    $("#exportTab").removeClass("active-tab");

    // add 'active-tab' class to current tab
    $(tab_id+"Tab").addClass("active-tab");
}

$(document).ready(function() {
    // add to track list
    $("#addButton").click(function() {
        addToTracklist();
    });

    // add to set list
    $("#setButton").click(function() {
        var index = $("#setSelect").val();
        var track = setList[index];

        if(typeof track !== "undefined") {
            addVideoToSetlist(track);
        } else {
            addVideoToSetlist();
        }
    });

    $("#removeButton").click(function() {
        if(activeList === 0) {
            var video_id = $("#trackSelect").val();
            $("option[value='"+video_id+"']").remove();
            $("#trackCount").text("Library - " + (document.getElementById("trackSelect").length-1) + " Tracks")
            resetVideoPlayer();
        } else {
            var index = $("#setSelect").val();
            setList.splice(index, 1);
            $("option[value='"+index+"']").remove();
            $("#setCount").text("Set - " + (document.getElementById("setSelect").length-1) + " Tracks")
            resetVideoPlayer();
        }
    });

    // tabs
    $("#mixerTab").click(function() {
        changeTab("#mixer");
    });
    $("#exportTab").click(function() {
        changeTab("#export");
    });

    // select track from library
    $("#trackSelect").change(function() {
        if(!playing) {
            $("#removeButton").text("Remove from Library");
            activeList = 0;
            $('#setSelect').val("null");
            loadVideo();
        } else {
            $('#trackSelect').val("null");
        }
    });

    // select track from set list
    $("#setSelect").change(function() {
        if(!playing) {
            $("#removeButton").text("Remove from Set");
            activeList = 1;
            // load the track from setList array
            var index = $("#setSelect").val();
            var track = setList[index];
    
            $('#trackSelect').val("null");
            loadVideo(track);
        } else {
            $('#setSelect').val("null");
        }
    });

    // play set
    $("#playSet").click(function() {
        try {
            resetVideoPlayer();
        } catch(err){}
        playing = true;
        trackNumber = 0;
        nextTrack(0);
    });

    // update active timestamp
    $("#startTimestamp").focus(function() {
        // 0 indicated #startTimestamp is active
        activeTimestamp = 0;
    });
    $("#endTimestamp").focus(function() {
        // 1 indicated #endTimestamp is active
        activeTimestamp = 1;
    });

    // update playhead when timestamp changes
    $("#startTimestamp").change(function() {
        // update the playhead to #startTimestamp value
        time = $("#startTimestamp").val();
        updatePlayhead(time);
    });
    $("#endTimestamp").change(function() {
        // update the playhead to #endTimestamp value
        time = $("#endTimestamp").val();
        updatePlayhead(time);
    });
});