var protocols_path = "protocols/mr_protocols.csv";
var protocols = [];

var font_paths = [
	{ type: "normal", path: "fonts/crimson/TTF/Crimson-Roman.ttf" },
	{ type: "bold", path: "fonts/crimson/TTF/Crimson-Bold.ttf" },
];

var start_time = Object();
var session_max_duration = moment.duration(30, "minutes");
var session_countdown = Object();

var default_mask_calendar_name = "MR előjegyzés maszk";
var default_calendar_name = "MR előjegyzés";

var modalities = ["MR", "PET/MR"];

var available_calendars = [];

var contingents = [
	{ category: "idegseb.", color: [255, 241, 0], label: "idegseb." },
	{ category: "3TP", color: [254, 203, 111], label: "3TP" },
	{ category: "FIZ", color: [85, 171, 229], label: "FIZ" },
	{ category: "PET/CT/MR", color: [255, 140, 0], label: "PET/CT/MR." },
	{ category: "", color: [255, 255, 255], label: "NA" },
];

// dom id's
var modal_container = "#modal_container";

var main_window_search_container = "#main_window_search_container";

var schedule_print_container = "#schedule_print_container";
var table_container = "#table_container";

var event_browser_container = "#event_browser_container";
