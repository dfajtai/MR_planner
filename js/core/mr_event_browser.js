class MR_event_browser {
	constructor(container, success_callback = null) {
		this.container = container;
		this.success_callback = success_callback;

		this.gui = Object();

		this.search_form = null;

		this.event_editor_form = null;

		this.calendar_data = null;
		this.selected_event = null;
	}
	create_gui() {
		this.container.empty();
		var form = $("<form/>").addClass("form d-flex flex-column needs-validation p-2").attr("id", "event_search_form").css({ border: "solid lightgray 1pt" });

		// source calendar
		var source_select_block = $("<div/>").addClass("row mb-2");
		source_select_block.append($("<label/>").attr("for", "calendar_select").addClass("col-sm-3 col-form-label").html("Source calendar"));
		var source_select_div = $("<div/>").addClass("col-sm-9");
		var source_select = $("<select/>").attr("name", "calendar_name").attr("id", "calendar_select").addClass("form-select").attr("required", true);
		source_select.append($("<option/>").attr("selected", true).attr("disabled", true).attr("value", "").html("Select source calendar..."));

		source_select_div.append(source_select);
		source_select_block.append(source_select_div);
		form.append(source_select_block);
		this.gui.source_select = source_select;

		// search date range
		var search_date_range_block = $("<div/>").addClass("row mb-2");
		search_date_range_block.append($("<label/>").attr("for", "search_date_range").addClass("col-sm-3 col-form-label").html("Search range"));
		var search_date_range_div = $("<div/>").addClass("col-sm-9");
		var search_date_range = $("<input/>").attr("name", "search_date_range").attr("id", "search_date_range").addClass("form-control");

		search_date_range_div.append(search_date_range);
		search_date_range_block.append(search_date_range_div);
		form.append(search_date_range_block);
		this.gui.search_data_range = search_date_range;
		var submit_btn = $("<button/>").addClass("btn btn-outline-dark w-100").html("Initialize").attr("id", "print_btn").attr("type", "button");
		form.append($("<div/>").addClass("pt-2").append(submit_btn));
		this.gui.submit_btn = submit_btn;

		this.container.append(form);
		this.form = form;

		var control_div = $("<div/>").addClass("my-2 p-2").css({ border: "solid lightgray 1pt" });

		// protocol select
		var event_select_block = $("<div/>").addClass("row");
		event_select_block.append($("<label/>").attr("for", "event_select").addClass("col-sm-3 col-form-label").html("Select examination"));
		var event_select_div = $("<div/>").addClass("col-sm-9");
		var event_select = $("<input/>")
			.attr("name", "selected_event_index")
			.attr("id", "event_select")
			.addClass("form-control flexdatalist")
			.attr("required", true)
			.attr("placeholder", "Select booked examination...")
			.attr("type", "test");
		event_select_div.append(event_select);
		event_select_block.append(event_select_div);
		control_div.append(event_select_block);

		this.gui.event_select = event_select;

		this.container.append(control_div);

		this.gui_logic();
	}

	gui_logic() {
		// calendar selection
		$.each(
			available_calendars,
			function (index, calendar_name) {
				var calendar_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
				this.gui.source_select.append(calendar_opt);
			}.bind(this)
		);

		if (available_calendars.includes(default_calendar_name)) {
			this.gui.source_select.val(default_calendar_name);
		}

		// search range

		var picker = new easepick.create({
			element: $(this.gui.search_data_range)[0],
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

		$(this.gui.protocol_select).flexdatalist({
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
		var val_dummy = $($(this.gui.protocol_select).parent().find(".flexdatalist-set")[0]);
		var list_dummy = $($(this.gui.protocol_select).parent().find(".flexdatalist-alias")[0]);
		val_dummy.css({ position: "absolute", top: "", left: "", zIndex: -1000 }).width(list_dummy.width()).position(list_dummy.position());

		picker.setStartDate(moment().add(1, "days").format("YYYY-MM-DD"));
		picker.setEndDate(moment().add(14, "days").format("YYYY-MM-DD"));

		// submit btn
		this.gui.submit_btn.on(
			"click",
			function () {
				if (!$(this.form)[0].checkValidity()) {
					$(this.form)[0].reportValidity();
				} else {
					this.form.trigger("submit", true);
				}
			}.bind(this)
		);

		this.form.on(
			"submit",
			function (e) {
				e.preventDefault();

				var params = this.parse_form_to_params();
				this.retrieve_calendars(params, function () {}.bind(this));
			}.bind(this)
		);
	}

	parse_form_to_params() {
		var values = {};
		$.each($(this.form).serializeArray(), function (index, field) {
			values[field.name] = field.value;
		});

		if (values["search_date_range"]) {
			var dates = values["search_date_range"].split(" - ");
			var start_date = dates[0];
			var end_date = dates[1];
		} else {
			var start_date = null;
			var end_date = null;
		}

		var params = {
			start_date: start_date,
			end_date: end_date,
			calendar_name: values.calendar_name,
		};

		return params;
	}

	retrieve_calendars(params = null, success_callback = null) {
		if (!params) {
			params = default_params;
		}
		$.ajax({
			type: "GET",
			url: "php/get_event_list.php",
			dataType: "json",
			data: {
				calendar_name: params.calendar_name,
				start_date: params.start_date,
				end_date: params.end_date,
				retrieve_body: true,
			},
			success: function (results) {
				this.calendar_data = MR_calendar_event.parse_from_calendar_data(results).events;
				if (success_callback) success_callback();
			}.bind(this),
		});
	}
}
