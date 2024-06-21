class MR_Calendar_Event {
	static param_keys = ["comment", "patient_name", "patient_phone", "physician", "reserved_at", "reserved_by", "protocol"];
	static response_keys = ["start", "end", "timezone", "subject", "body", "categories", "id"];

	static parse_from_PHP(response_row) {
		var start = new Date(response_row["start"]);
		var end = new Date(response_row["end"]);

		var parsed_categories = JSON.parse(response_row["categories"]);
		var valid_categories = [];
		$.each(parsed_categories, function (idx, cat) {
			if (contingents.includes(cat)) valid_categories.push(cat);
		});
		var contingent = valid_categories[0] || null;

		var params = MR_Calendar_Event.#parse_stored_data(response_row["body"]);
		return new MR_Calendar_Event(start, end, params, contingent, response_row["id"]);
	}

	static #parse_stored_data(body) {
		var params = {};

		function stripHtml(html) {
			let tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || "";
		}

		function clean_text(text) {
			return text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
		}

		var parsed_body = $("<div/>").append($.parseHTML(body));
		// $.each(parsed_body.find("td[data-key]"), function (idx, dom) {
		// 	var key = $(dom).attr("data-key");
		// 	if (MR_Calendar_Event.param_keys.includes(key)) {
		// 		params[key] = $(dom).html();
		// 	}
		// });

		$.each(parsed_body.find("tr"), function (idx, row) {
			var cells = $(row).find("td");
			var key = $(cells[0]).html() || "";
			var sanitized_key = clean_text(key);
			if (MR_Calendar_Event.param_keys.includes(sanitized_key)) {
				var val = $(cells.last()).html() || "";
				// lets be a littl less restrictive if it is the comment tag...
				if (sanitized_key != "comment") {
					var sanitized_val = clean_text(stripHtml(val));
					params[sanitized_key] = sanitized_val == "" ? null : sanitized_val;
				} else {
					const tempDiv = document.createElement("div");
					tempDiv.innerHTML = val;
					var sanitized_val = tempDiv.innerText || tempDiv.textContent;
					params[sanitized_key] = sanitized_val == "" ? null : sanitized_val;
				}
			}
		});

		return params;
	}

	static parse_from_form(form, params) {
		var event_params = {};
		var contingent = null;
		$.each($(form).serializeArray(), function (index, field) {
			if (MR_Calendar_Event.param_keys.includes(field.name)) event_params[field.name] = field.value;
			if (field.name == "contingent") contingent = field.value;
		});
		event_params["protocol"] = params.protocol.protocol_name;

		var event = new MR_Calendar_Event(params.start, params.end, event_params, contingent);
		return event;
	}

	static parse_from_calendar_data(calendar_data) {
		var events = [];
		$.each(calendar_data["events"], function (index, response_row) {
			events.push(MR_Calendar_Event.parse_from_PHP(response_row));
		});
		var masks = [];
		$.each(calendar_data["masks"], function (index, response_row) {
			masks.push(MR_Calendar_Event.parse_from_PHP(response_row));
		});

		return { events: events, masks: masks };
	}

	constructor(start, end, params, contingent = null, id = null) {
		this.start = start;
		this.end = end;
		this.params = params;
		this.contingent = contingent;
		this.id = id;
	}

	to_stored_html() {
		var styles =
			"table { width: 100%; } table, th {  border: 1px solid black;  border-collapse: collapse;} th { background-color: Black; color: White; font-weight:bold } td { border-collapse: collapse; }";
		var template = "<html><head><style>" + styles + "</style></head><body>#CONTENT#</body></html>";

		var container = $("<div/>");
		var table = $("<table/>");

		function to_row(label, value, key = "", is_header = false) {
			var row = $("<tr/>");
			if (is_header) {
				row.append(
					$("<th/>")
						.html("<strong><b>" + label + "</b></strong>")
						.css({ width: "20%" })
						.attr("colspan", "2")
				);

				row.append($("<th/>").html("<strong><b>" + value + "</b></strong>"));
			} else {
				// hidden key
				row.append(
					$("<td/>").html(key).css({
						"background-color": "lightgray",
						"font-size": "0%",
						color: "lightgray",
						border: "1px solid black",
						"border-right": "none",
						"white-space": "nowrap",
					})
				);
				// visible label
				row.append(
					$("<td/>")
						.html("<strong><b>" + label.trim() + "</b></strong>")
						.css({ "background-color": "lightgray", border: "1px solid black", "border-left": "none", "white-space": "nowrap" })
					// .attr("data-key", key)
				);
				// stored value
				if (key == "comment") {
					if (value) row.append($("<td/>").append($("<pre>/").html(value)));
					else row.append($("<td/>").html(value));
					row.css({ border: "1px solid black" });
				} else {
					row.append($("<td/>").html(value).css({ border: "1px solid black" }));
				}
			}
			return row;
		}

		table.append(to_row("Property", "Value", "", true));
		table.append(to_row("Patient name", this.params.patient_name, "patient_name"));
		table.append(to_row("Protocol", this.params.protocol, "protocol"));
		table.append(to_row("Contingent", this.contingent, "contingent"));
		table.append(to_row("Phone number", this.params.patient_phone, "patient_phone"));
		table.append(to_row("Referring physician", this.params.physician, "physician"));
		table.append(to_row("Reserved at", this.params.reserved_at, "reserved_at"));
		table.append(to_row("Reserved by", this.params.reserved_by, "reserved_by"));
		table.append(to_row("Comment", this.params.comment, "comment"));
		container.append(table);

		var html_text = template.replace("#CONTENT#", container.prop("outerHTML"));

		return html_text;
	}

	to_PHP_event_data() {
		var php_event_data = {
			start: new Date(this.start).toISOString(),
			end: new Date(this.end).toISOString(),
			subject: this.params.patient_name + " (" + this.params.protocol + ")",
			body: this.to_stored_html(),
			category: this.contingent,
		};
		return php_event_data;
	}

	to_schedule_row() {}

	get start_string() {
		return this.start.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
	}

	get end_string() {
		return this.end.toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
	}

	get duration() {
		return moment(this.end).diff(moment(this.start), "minutes");
	}

	get start_time_string() {
		return moment(this.start).format("HH:mm");
	}

	get end_time_string() {
		return moment(this.end).format("HH:mm");
	}

	get start_date_string() {
		return moment(this.start).format("YYYY.MM.DD");
	}

	get end_date_string() {
		return moment(this.end).format("YYYY.MM.DD");
	}
}
