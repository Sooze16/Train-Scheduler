var firebaseConfig = {
    apiKey: "AIzaSyB6C9FdE30dxNDDkGB0ubJgRTy9I1VsNQI",
    authDomain: "trainschedule-2bb75.firebaseapp.com",
    databaseURL: "https://trainschedule-2bb75.firebaseio.com",
    projectId: "trainschedule-2bb75",
    storageBucket: "",
    messagingSenderId: "706920234766",
    appId: "1:706920234766:web:b7dd56af4b24111f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var trainName = "";

var destination = "";

var startTime = "";

var frequency = 0;

function time() {
    var currentTime = moment().format('LT');
    $("#time").html(currentTime);
    setTimeout(time, 1000);
};

$(".form-field").on("keyup", function() {
    var trainFld = $("#train-name").val().trim();
    var cityFld = $("#destination").val().trim();
    var timeFld = $("#first-train").val().trim();
    var freqFld = $("#frequency").val().trim();

    sessionStorage.setItem("train", trainFld);
    sessionStorage.setItem("city", cityFld);
    sessionStorage.setItem("time", timeFld);
    sessionStorage.setItem("freq", freqFld);
});

$("#train-name").val(sessionStorage.getItem("train"));
$("#destination").val(sessionStorage.getItem("city"));
$("#first-train").val(sessionStorage.getItem("time"));
$("#frequency").val(sessionStorage.getItem("freq"));

$("#submit").on("click", function(event) {
    event.preventDefault();

    if ($("#train-name").val().trim() === "" ||
        $("#destination").val().trim() === "" ||
        $("#first-train").val().trim() === "" ||
        $("#frequency").val().trim() === "") {

        alert("Please fill in all details to add new train");

    } else {

        trainName = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        startTime = $("#first-train").val().trim();
        frequency = $("#frequency").val().trim();

        $(".form-field").val("");

        database.ref().push({
            trainName: trainName,
            destination: destination,
            frequency: frequency,
            startTime: startTime,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        sessionStorage.clear();
    }

});

database.ref().on("child_added", function(childSnapshot) {
    var startTimeConverted = moment(childSnapshot.val().startTime, "HH:mm").subtract(1, "years");
    var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
    var timeRemain = timeDiff % childSnapshot.val().frequency;
    var minToArrival = childSnapshot.val().frequency - timeRemain;
    var nextTrain = moment().add(minToArrival, "minutes");
    var key = childSnapshot.key;

    var newrow = $("<tr>");
    newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
    newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
    newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
    newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
    newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
    newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));

    if (minToArrival < 6) {
        newrow.addClass("info");
    }

    $("#train-table-rows").append(newrow);

});

$(document).on("click", ".arrival", function() {
    keyref = $(this).attr("data-key");
    database.ref().child(keyref).remove();
    window.location.reload();
});

time();

setInterval(function() {
    window.location.reload();
}, 60000);