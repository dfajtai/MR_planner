function handle_event_creation_gui() {
    //event creation
    var picker = Object();

    var default_mask_calendar_name = "MR előjegyzés maszk";
    var default_calendar_name = "MR előjegyzés";

    var protocol_select = Object();
    var calendar_select = Object();
    var mask_calendar_select = Object();


    var search_params_form = Object();

    protocol_select = $("#examTypeSelect");
    calendar_select = $("#sourceCalendarSelect");
    mask_calendar_select = $("#maskingCalendarSelect");


    search_params_form = $("#searchParamsForm");

	$.each(protocols, function (index, protocol_info) {
		var opt = $("<option/>").html(protocol_info["protocol_name"]).attr("value", protocol_info["protocol_name"]);
		protocol_select.append(opt);
	})

	$.each(available_calendars, function (index, calendar_name) {
		var calendar_opt = $("<option/>")
			.html(calendar_name)
			.attr("value", calendar_name);
		calendar_select.append(calendar_opt);

		var mask_opt = $("<option/>")
			.html(calendar_name)
			.attr("value", calendar_name);
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
        css: ["https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css"],
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
        var protocol_name = values["examType"];
        var event_length = getEntryFieldWhere(
            protocols,
            "protocol_name",
            protocol_name,
            "protocol_duration"
        );

        $.ajax({
            type: "GET",
            url: "php/get_calendar_data.php",
            dataType: "json",
            data: {
                source_calendar: values["sourceCalendar"],
                mask_calendar: values["maskingCalendar"],
                start_date: start_date,
                end_date: end_date,
            },
            success: function (result) {
                var events = result["events"];
                var masks = result["masks"];
                var windows = search_free_time_windows(
                    events,
                    masks,
                    values["showCount"],
                    event_length
                );
                // console.log(windows);
                show_event_creation_modal(
                    $("#modalContainer"),
                    windows,
                    event_length,
                    function (start, end, name, success_callback = null) {
                        $.ajax({
                            type: "POST",
                            url: "php/post_new_event.php",
                            dataType: "json",
                            data: {
                                source_calendar: values["sourceCalendar"],
                                event_data: {
                                    start: new Date(start).toISOString(),
                                    end: new Date(end).toISOString(),
                                    text:
                                        moment(start).format("HH:mm") +
                                        ": " +
                                        name +
                                        " (" +
                                        protocol_name +
                                        ")",
                                },
                            },
                            success: function (result) {
                                if (success_callback) {
                                    success_callback();
                                }
                            },
                        });
                    }
                );
            },
        });
    });
}
