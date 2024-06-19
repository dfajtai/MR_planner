var protocols_path = "protocols/mr_protocols.csv";
var protocols = [];

var start_time = Object();
var session_max_duration = moment.duration(30, "minutes");
var session_countdown = Object();

var modalities = ["MR", "PET/MR"];

var available_calendars = [];

var contingents = ["idegseb.", "3TP", "FIZ", "PET/CT/MR"];
