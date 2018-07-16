$(document).ready(function() {
    if (typeof(Storage) !== "undefined") {
        // load from localstorage
        try {
            // load saved data
            document.getElementById("trackSelect").innerHTML = localStorage.getItem("library");
            document.getElementById("setSelect").innerHTML = localStorage.getItem("set");
        } catch(err) {}
    } else {
        alert("Local Storage is not supported by this browser! Your set will not be saved!");
    }
});

function save() {
    library = document.getElementById("trackSelect").innerHTML;
    set = document.getElementById("setSelect").innerHTML;

    localStorage.setItem("library", library);
    localStorage.setItem("set", set);
}