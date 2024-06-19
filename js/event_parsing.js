class Event {
	static parseFromPHPData(start, end, subject, text = null, category = null) {
		var event_start = new Date(start);
		var event_end = new Date(end);

		var event_start_string = event_start.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
		var event_end_string = event_end.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });

		var event_start_date = moment(event_start).format("YYYY.MM.DD");
		var event_end_date = moment(event_end).format("YYYY.MM.DD");
	}
}
