const window_search_logic_options = { inside_any_mask: "all", outside_all_mask: "none", any_free_time: "any" };
const connection_options = { event_creator: "event_creator" };
class MR_timing_slot_browser {
	default_params = {
		start_date: moment().add(1, "days").format("YYYY-MM-DD"),
		end_date: moment().add(14, "days").format("YYYY-MM-DD"),
		window_parameters: null,
		source_calendar: default_calendar_name,
		mask_calendar: default_mask_calendar_name,
	};

	constructor(container, success_callback = null) {
		this.container = container;

		this.success_callback = success_callback;

		// this.event_creator = null;
		// this.event_editor = null;

		this.gui = Object();
		this.form = Object();
		this.params = Object();

		this.calendar_data = {};
	}

	#additional_window_search_options_gui(container) {
		container.empty();

		// source calendar
		var source_select_block = $("<div/>").addClass("row mb-2");
		source_select_block.append($("<label/>").attr("for", "source_calendar_select").addClass("col-sm-3 col-form-label").html("Source calendar"));
		var source_select_div = $("<div/>").addClass("col-sm-9");
		var source_select = $("<select/>").attr("name", "source_calendar").attr("id", "source_calendar_select").addClass("form-select").attr("required", true);
		source_select.append($("<option/>").attr("selected", true).attr("disabled", true).attr("value", "").html("Select source calendar..."));

		source_select_div.append(source_select);
		source_select_block.append(source_select_div);
		container.append(source_select_block);

		this.gui.source_select = source_select;

		// mask calendar
		var mask_select_block = $("<div/>").addClass("row mb-2");
		mask_select_block.append($("<label/>").attr("for", "mask_calendar_select").addClass("col-sm-3 col-form-label").html("Mask calendar"));
		var mask_select_div = $("<div/>").addClass("col-sm-9");
		var mask_select = $("<select/>").attr("name", "mask_calendar").attr("id", "mask_calendar_select").addClass("form-select").attr("required", true);
		mask_select.append($("<option/>").attr("selected", true).attr("disabled", true).attr("value", "").html("Select mask calendar..."));

		mask_select_div.append(mask_select);
		mask_select_block.append(mask_select_div);
		container.append(mask_select_block);

		this.gui.mask_select = mask_select;

		// day start select
		var day_start_block = $("<div/>").addClass("row mb-2");
		day_start_block.append($("<label/>").attr("for", "day_start").addClass("col-sm-3 col-form-label").html("Day staring hour"));
		var day_start_input_div = $("<div/>").addClass("col-sm-9");
		var day_start_input = $("<input/>")
			.attr("name", "day_start")
			.attr("id", "day_start")
			.addClass("form-control day-range")
			.attr("required", true)
			.attr("type", "number")
			.attr("step", "1")
			.attr("min", 6)
			.attr("max", 16)
			.attr("value", 8);
		day_start_input_div.append(day_start_input);
		day_start_block.append(day_start_input_div);
		container.append(day_start_block);

		var day_end_block = $("<div/>").addClass("row mb-2");
		day_end_block.append($("<label/>").attr("for", "day_end").addClass("col-sm-3 col-form-label").html("Day ending hour"));
		var day_end_input_div = $("<div/>").addClass("col-sm-9");
		var day_end_input = $("<input/>")
			.attr("name", "day_end")
			.attr("id", "day_end")
			.addClass("form-control day-range")
			.attr("required", true)
			.attr("type", "number")
			.attr("step", "1")
			.attr("min", 12)
			.attr("max", 22)
			.attr("value", 18);
		day_end_input_div.append(day_end_input);
		day_end_block.append(day_end_input_div);
		container.append(day_end_block);
		day_end_input.trigger("change");

		container.find(".day-range").on("change", function () {
			var start_val = parseInt(day_start_input.val());
			var end_val = parseInt(day_end_input.val());
			day_start_input.prop("max", end_val - 1);
			day_end_input.prop("min", start_val + 1);
		});

		// days
		var day_check_block = $("<div/>").addClass("row mb-2");
		day_check_block.append($("<label/>").addClass("col-form-label col-sm-3").attr("for", "day_check").html("Search on days"));
		var day_check_div = $("<div/>").addClass("col-sm-9 d-flex").attr("id", "show_count_block");
		var options = [
			{ value: 1, label: "Mon", default: true },
			{ value: 2, label: "Tue", default: true },
			{ value: 3, label: "Wed", default: true },
			{ value: 4, label: "Thu", default: true },
			{ value: 5, label: "Fri", default: true },
			{ value: 6, label: "Sat", default: false },
			{ value: 7, label: "Sun", default: false },
		];
		this.gui.days = day_check_div;

		$.each(options, function (idx, option) {
			var option_container = $("<div/>").addClass("flex-fill");
			if (idx < options.length - 1) option_container.addClass("pe-1");
			var _id = "allow_" + option.label;

			option_container.append(
				$("<input/>")
					.attr("type", "checkbox")
					.addClass("btn-check")
					.attr("name", "days")
					.attr("id", _id)
					.attr("value", option.value)
					.attr("checked", option.default)
			);
			option_container.append($("<label/>").addClass("btn btn-outline-dark w-100").attr("for", _id).html(option.label));
			day_check_div.append(option_container);
		});
		day_check_block.append(day_check_div);
		container.append(day_check_block);

		// window count
		var window_count_block = $("<div/>").addClass("row");
		window_count_block.append($("<label/>").addClass("col-form-label col-sm-3").attr("for", "show_count_block").html("Number of results"));
		var window_count_div = $("<div/>").addClass("col-sm-9 d-flex").attr("id", "show_count_block");
		var options = [
			{ value: 5, label: "First 5", default: false },
			{ value: 10, label: "First 10", default: true },
			{ value: "All", label: "All", default: false },
		];
		$.each(options, function (idx, option) {
			var option_container = $("<div/>").addClass("flex-fill");
			if (idx < options.length - 1) option_container.addClass("pe-1");
			var _id = "show_" + option.value;

			option_container.append(
				$("<input/>")
					.attr("type", "radio")
					.addClass("btn-check")
					.attr("name", "show_count")
					.attr("id", _id)
					.attr("value", option.value)
					.attr("checked", option.default)
			);
			option_container.append($("<label/>").addClass("btn btn-outline-dark w-100").attr("for", _id).html(option.label));
			window_count_div.append(option_container);
		});
		window_count_block.append(window_count_div);
		container.append(window_count_block);
	}

	create_gui() {
		this.container.empty();
		var form = $("<form/>").addClass("form d-flex flex-column needs-validation").attr("id", "window_search_params_form");

		// protocol select
		var protocol_select_block = $("<div/>").addClass("row mb-2");
		protocol_select_block.append($("<label/>").attr("for", "protocol_select").addClass("col-sm-3 col-form-label").html("Examination protocol"));
		var protocol_select_div = $("<div/>").addClass("col-sm-9");
		var protocol_select = $("<input/>")
			.attr("name", "protocol_index")
			.attr("id", "protocol_select")
			.addClass("form-control flexdatalist")
			.attr("required", true)
			.attr("placeholder", "Select examination protocol...")
			.attr("type", "test");
		protocol_select_div.append(protocol_select);
		protocol_select_block.append(protocol_select_div);
		form.append(protocol_select_block);

		this.gui.protocol_select = protocol_select;

		// logic select
		var logic_select_block = $("<div/>").addClass("row mb-2");
		logic_select_block.append($("<label/>").attr("for", "search_logic_select").addClass("col-sm-3 col-form-label").html("Contingent/Logic"));
		var logic_select_div = $("<div/>").addClass("col-sm-9");
		var logic_select = $("<select/>").attr("name", "search_logic").attr("id", "search_logic_select").addClass("form-select").attr("required", true);
		logic_select.append($("<option/>").attr("selected", true).attr("disabled", true).attr("value", "").html("Select contingent or search logic..."));

		logic_select_div.append(logic_select);
		logic_select_block.append(logic_select_div);
		form.append(logic_select_block);

		this.gui.logic_select = logic_select;

		// search date range
		var search_date_range_block = $("<div/>").addClass("row mb-2");
		search_date_range_block.append($("<label/>").attr("for", "search_date_range").addClass("col-sm-3 col-form-label").html("Search range"));
		var search_date_range_div = $("<div/>").addClass("col-sm-9");
		var search_date_range = $("<input/>").attr("name", "search_date_range").attr("id", "search_date_range").addClass("form-control");

		search_date_range_div.append(search_date_range);
		search_date_range_block.append(search_date_range_div);
		form.append(search_date_range_block);

		this.gui.search_data_range = search_date_range;

		// additional options ...
		var params_accordion = $("<div/>").addClass("accordion accordion-flush").attr("id", "additional_params_accordion");
		var params_accordion_item = $("<div/>").addClass("accordion-item");

		var params_accordion_header = $("<h2/>").addClass("accordion-header").attr("id", "additional_params_accordion_header");
		var params_accordion_header_btn = $("<button/>").addClass("accordion-button collapsed").attr("type", "button").attr("data-bs-toggle", "collapse");
		params_accordion_header_btn.attr("data-bs-target", "#search_params").attr("aria-expanded", "false");
		params_accordion_header_btn.html("Adjust search parameters");
		params_accordion_header.append(params_accordion_header_btn);

		var params_accordion_content_container = $("<div/>").addClass("accordion-collapse collapse");
		params_accordion_content_container.attr("id", "search_params").attr("data-bs-parent", "#additional_params_accordion");
		var params_accordion_content = $("<div/>").addClass("accordion-body nested-accordion");

		this.#additional_window_search_options_gui(params_accordion_content);

		params_accordion_content_container.append(params_accordion_content);
		params_accordion_item.append(params_accordion_header);
		params_accordion_item.append(params_accordion_content_container);
		params_accordion.append(params_accordion_item);
		form.append(params_accordion);

		// submit btn
		var submit_btn = $("<button/>")
			.addClass("btn btn-outline-dark w-100")
			.html("Search free time windows")
			.attr("id", "search_time_windows_btn")
			.attr("type", "button");
		form.append($("<div/>").addClass("py-2").append(submit_btn));
		this.gui.submit_btn = submit_btn;

		this.container.append(form);
		this.form = form;

		this.gui_logic();
	}

	gui_logic() {
		// protocol select
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

		// search logic
		$.each(
			contingents,
			function (index, contingent) {
				var _opt = $("<option/>")
					.html(contingent)
					.attr("value", "CONTINGENT#" + contingent)
					.attr("data-value", contingent)
					.attr("data-type", "contingent");
				this.gui.logic_select.append(_opt);
			}.bind(this)
		);
		this.gui.logic_select.append($("<option/>").html("-------------------- [LOGIC] --------------------").attr("value", "").attr("disabled", true));

		this.gui.logic_select.append(
			$("<option/>")
				.html("Inside any contingent time window")
				.attr("value", "LOGIC#all")
				.attr("data-value", window_search_logic_options.inside_any_mask)
				.attr("data-type", "logic")
		);
		this.gui.logic_select.append(
			$("<option/>")
				.html("Outside all contingent time window")
				.attr("value", "LOGIC#none")
				.attr("data-value", window_search_logic_options.outside_all_mask)
				.attr("data-type", "logic")
		);
		this.gui.logic_select.append(
			$("<option/>")
				.html("Any free time")
				.attr("value", "LOGIC#any")
				.attr("data-value", window_search_logic_options.any_free_time)
				.attr("data-type", "logic")
		);

		// calendar selection
		$.each(
			available_calendars,
			function (index, calendar_name) {
				var calendar_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
				this.gui.source_select.append(calendar_opt);

				var mask_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
				this.gui.mask_select.append(mask_opt);
			}.bind(this)
		);

		if (available_calendars.includes(default_calendar_name)) {
			this.gui.source_select.val(default_calendar_name);
		}

		if (available_calendars.includes(default_mask_calendar_name)) {
			this.gui.mask_select.val(default_mask_calendar_name);
		}

		// search range

		var picker_id = this.gui.search_data_range.attr("id");
		var picker = new easepick.create({
			element: document.getElementById(picker_id),
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
				this.retrieve_calendars(
					params,
					function () {
						this.search_open_slot(
							params,
							this.calendar_data,
							function (results) {
								if (this.success_callback) {
									this.success_callback(results);
								}
							}.bind(this)
						);
					}.bind(this)
				);
			}.bind(this)
		);
	}

	parse_form_to_params() {
		var values = {};
		$.each($(this.form).serializeArray(), function (index, field) {
			values[field.name] = field.value;
		});

		var selected_logic_element = $(this.gui.logic_select.find("option:selected")[0]);
		var logic_type = selected_logic_element.attr("data-type");
		var logic_value = selected_logic_element.attr("data-value");
		var search_by_logic = logic_type == "logic";

		if (values["search_date_range"]) {
			var dates = values["search_date_range"].split(" - ");
			var start_date = dates[0];
			var end_date = dates[1];
		} else {
			var start_date = null;
			var end_date = null;
		}

		var protocol_index = values["protocol_index"];
		var protocol = getEntryWhere(protocols, "protocol_index", protocol_index);

		var days = [];
		$.each($(this.gui.days).find(":checked"), function (idx, dom) {
			days.push(parseInt($(dom).val()));
		});

		var window_params = {};
		if (search_by_logic) {
			window_params.logic = logic_value;
			window_params.days = days;
			window_params.day_start = values["day_start"];
			window_params.day_end = values["day_end"];
		} else {
			window_params.contingent = logic_value;
		}
		window_params.show_count = values.show_count;

		var params = {
			start_date: start_date,
			end_date: end_date,
			use_logic: search_by_logic,
			window_parameters: window_params,
			protocol: protocol,
			source_calendar: values.source_calendar,
			mask_calendar: values.mask_calendar,
		};

		return params;
	}

	feed_form_with_params() {}

	retrieve_calendars(params = null, success_callback = null) {
		if (!params) {
			params = default_params;
		}
		$.ajax({
			type: "GET",
			url: "php/get_calendar_data.php",
			dataType: "json",
			data: {
				source_calendar: params.source_calendar,
				mask_calendar: params.mask_calendar,
				start_date: params.start_date,
				end_date: params.end_date,
				retrieve_body: false,
			},
			success: function (results) {
				this.calendar_data = MR_calendar_event.parse_from_calendar_data(results);
				if (success_callback) success_callback();
			}.bind(this),
		});
	}

	search_open_slot(params, calendar_data = null, success_callback = null) {
		if (!calendar_data) {
			calendar_data = this.calendar_data || { masks: [], events: [] };
		}
		var events = calendar_data.events;
		var masks = calendar_data.masks;

		var window_parameters = params.window_parameters;
		if (!window_parameters) {
			return { search_params: params, windows: [], events: events, masks: masks, success: false };
		}

		var continget = null;
		var windows = [];
		if (!params.use_logic) {
			// search inside masks  of a given contingent
			var windows = search_free_time_windows_using_masks(
				events,
				masks,
				params.protocol.protocol_duration,
				window_parameters.contingent,
				window_parameters.show_count
			);
			continget = window_parameters.contingent;
		} else {
			// search inside all
			if (window_parameters.logic == window_search_logic_options.inside_any_mask) {
				var windows = search_free_time_windows_using_masks(events, masks, params.protocol.protocol_duration, null, window_parameters.show_count);
			}
			// search outside all
			if (window_parameters.logic == window_search_logic_options.outside_all_mask) {
				var windows = search_free_time_windows_outside_masks(
					events,
					masks,
					params.start_date,
					params.end_date,
					window_parameters.day_start,
					window_parameters.day_end,
					window_parameters.days,
					params.protocol.protocol_duration,
					window_parameters.show_count
				);
			}
			// any free time
			if (window_parameters.logic == window_search_logic_options.any_free_time) {
				var windows = search_free_time_windows(
					events,
					params.start_date,
					params.end_date,
					window_parameters.day_start,
					window_parameters.day_end,
					window_parameters.days,
					params.protocol.protocol_duration,
					window_parameters.show_count
				);
			}
		}

		var slots = { search_params: params, contingent: continget, windows: windows, events: events, masks: masks, success: true };

		if (success_callback) {
			success_callback(slots);
		}
		return slots;
	}
}
