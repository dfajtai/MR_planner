function handle_event_creation_gui() {
	//event creation
	var picker = Object();

	var default_mask_calendar_name = "MR előjegyzés maszk";
	var default_calendar_name = "MR előjegyzés";

	var protocol_select = Object();
	var search_logic_select = Object();
	var calendar_select = Object();
	var mask_calendar_select = Object();

	var search_params_form = Object();

	protocol_select = $("#protocolSelect");
	search_logic_select = $("#searchLogicSelect");

	calendar_select = $("#sourceCalendarSelect");
	mask_calendar_select = $("#maskingCalendarSelect");

	search_params_form = $("#searchParamsForm");

	$(protocol_select).flexdatalist({
		minLength: 0,
		selectionRequired: true,
		toggleSelected: true,
		searchIn: ["protocol_name", "modality"],
		visibleProperties: ["protocol_name"],
		valueProperty: "protocol_index",
		textProperty: "[{modality}] {protocol_name} ({protocol_duration} min)",
		searchContain: true,
		data: protocols,
		limitOfValues: 1,
	});

	// handle bugged validation popup location
	var val_dummy = $($(protocol_select).parent().find(".flexdatalist-set")[0]);
	var list_dummy = $($(protocol_select).parent().find(".flexdatalist-alias")[0]);
	val_dummy.css({ position: "absolute", top: "", left: "", zIndex: -1000 }).width(list_dummy.width()).position(list_dummy.position());

	$.each(contingents, function (index, contingent) {
		var _opt = $("<option/>")
			.html(contingent)
			.attr("value", "CONTINGENT#" + contingent);
		search_logic_select.append(_opt);
	});
	search_logic_select.append($("<option/>").html("[LOGIC] Inside all contingent time window").attr("value", "LOGIC#all"));
	search_logic_select.append($("<option/>").html("[LOGIC] Any free time").attr("value", "LOGIC#any"));

	$.each(available_calendars, function (index, calendar_name) {
		var calendar_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
		calendar_select.append(calendar_opt);

		var mask_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
		mask_calendar_select.append(mask_opt);
	});

	if (available_calendars.includes(default_calendar_name)) {
		calendar_select.val(default_calendar_name);
	}

	if (available_calendars.includes(default_mask_calendar_name)) {
		mask_calendar_select.val(default_mask_calendar_name);
	}

	picker = new easepick.create({
		element: document.getElementById("dateRangePicker"),
		css: ["css/easepicker.css", "libs/css/easepick-index.css"],

		plugins: ["LockPlugin", "AmpPlugin", "RangePlugin"],

		LockPlugin: {
			minDate: new Date(),
			minDays: 1,
			maxDays: 30,
		},
		AmpPlugin: {
			resetButton: true,
			darkMode: false,
		},
		zIndex: 10000,
	});

	picker.setStartDate(moment().add(1, "days").format("YYYY-MM-DD"));
	picker.setEndDate(moment().add(14, "days").format("YYYY-MM-DD"));

	$("#searchTimeWindowBtn").on("click", function () {
		if (!$(search_params_form)[0].checkValidity()) {
			$(search_params_form)[0].reportValidity();
		} else {
			search_params_form.trigger("submit", true);
		}
	});

	search_params_form.on("submit", function (e) {
		e.preventDefault();
		var values = {};
		$.each($(this).serializeArray(), function (index, field) {
			// values[field.name] = parse_val(field.value==""?null:field.value);
			values[field.name] = field.value;
		});
		// console.log(values);

		if (values["date"]) {
			var dates = values["date"].split(" - ");
			var start_date = dates[0];
			var end_date = dates[1];
		} else {
			var start_date = null;
			var end_date = null;
		}
		var protocol_index = values["protocol_index"];
		var protocol = getEntryWhere(protocols, "protocol_index", protocol_index);

		var search_logic = values["search_logic"].split("#");
		var search_type = search_logic[0];
		var search_role = search_logic[1];
		var search_by_contingent = search_type == "CONTINGENT";

		$.ajax({
			type: "GET",
			url: "php/get_calendar_data.php",
			dataType: "json",
			data: {
				source_calendar: values["sourceCalendar"],
				mask_calendar: values["maskingCalendar"],
				start_date: start_date,
				end_date: end_date,
				retrieve_body: true,
			},
			success: function (result) {
				var parsed_data = MR_Calendar_Event.parse_from_calendar_data(result);
				var events = parsed_data.events;
				var masks = parsed_data.masks;

				if (search_by_contingent) {
					var windows = search_free_time_windows_using_masks(events, masks, values["showCount"], protocol["protocol_duration"], search_role);
				} else {
					// search inside all
					if (search_role == "all") {
						var windows = search_free_time_windows_using_masks(events, masks, values["showCount"], protocol["protocol_duration"], null);
					} else {
					}
				}

				// console.log(windows);
				show_event_creation_modal($("#modalContainer"), "Create event", windows, protocol, null, function (event, success_callback = null) {
					$.ajax({
						type: "POST",
						url: "php/post_new_event.php",
						dataType: "json",
						data: { source_calendar: values["sourceCalendar"], event_data: event.to_PHP_event_data() },
						success: function (result) {
							if (success_callback) {
								success_callback();
							}
						},
					});
				});
			},
		});
	});
}
