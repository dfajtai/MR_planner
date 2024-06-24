var protocols_path = "protocols/mr_protocols.csv";
var protocols = [];

var start_time = Object();
var session_max_duration = moment.duration(30, "minutes");
var session_countdown = Object();

var default_mask_calendar_name = "MR előjegyzés maszk";
var default_calendar_name = "MR előjegyzés";

var modalities = ["MR", "PET/MR"];

var available_calendars = [];

var contingents = ["idegseb.", "3TP", "FIZ", "PET/CT/MR"];

// and some global variable
var main_free_window_search = null;
var main_event_creation = null;
