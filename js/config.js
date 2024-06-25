var protocols_path = "protocols/mr_protocols.csv";
var protocols = [];

var font_path = "fonts/crimson/TTF/Crimson-Roman.ttf";

var start_time = Object();
var session_max_duration = moment.duration(30, "minutes");
var session_countdown = Object();

var default_mask_calendar_name = "MR előjegyzés maszk";
var default_calendar_name = "MR előjegyzés";

var modalities = ["MR", "PET/MR"];

var available_calendars = [];

var contingents = ["idegseb.", "3TP", "FIZ", "PET/CT/MR"];

// dom id's
var modal_container = "#modal_container";

var main_window_search_container = "#main_window_search_container";

var schedule_print_container = "#schedule_print_container";
var table_container = "#table_container";

var event_search_container = "#event_search_container";
