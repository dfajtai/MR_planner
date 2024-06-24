class MR_Event_Creation {
	constructor(search_params, contingent = null) {
		this.params = search_params;
		this.protocol = this.params.protocol;
		this.contingent = contingent;

		this.container = null;
		this.gui = Object();

		this.form = null;

		this.modal = null;

		this.windows = null;
		this.selected_window = null;
		this.selected_window_start = null;
		this.selected_window_end = null;
		this.selected_window_duration = null;

		this.event_start = null;
		this.event_end = null;
		this.event_duration = null;

		this.slider_name = "event_timing_slider";
		this.slider = null;
	}

	#timing_parameters_gui(container, windows) {
		container.empty();

		container.append($("<label/>").addClass("form-label").html("Available time window(s):").attr("for", "#timeWindows"));
		var time_windows_listbox_container = $("<div/>").attr("id", "timeWindows").addClass("listbox-custom card");
		var time_windows_listbox = $("<ul/>").addClass("list-group list-group-flush");

		$.each(windows, function (index, window) {
			var start_date_string = moment(window[0]).format("YYYY.MM.DD");
			var end_date_string = moment(window[1]).format("YYYY.MM.DD");
			var start_string = moment(window[0]).format("HH:mm");
			var end_string = moment(window[1]).format("HH:mm");

			if (end_date_string != start_date_string) {
				var btn_text = start_date_string;
			} else {
				var btn_text = "[" + start_date_string + "] " + start_string + " - " + end_string;
			}

			var time_window_list_item = $("<li/>").addClass("list-group-item p-1");
			var time_window_element = $("<div/>").addClass("flex-fill");
			var btn_input = $("<input/>")
				.addClass("window-select-btn btn-check")
				.attr("id", "time_window" + index);
			btn_input.attr("type", "radio").attr("name", "timeWindow").attr("value", index).attr("autocomplete", "off").attr("required", "true");

			var btn_label = $("<label/>")
				.addClass("btn btn-outline-dark w-100")
				.attr("for", "time_window" + index)
				.html(btn_text);

			time_window_element.append(btn_input);
			time_window_element.append(btn_label);

			time_window_list_item.append(time_window_element);

			time_windows_listbox.append(time_window_list_item);
		});

		time_windows_listbox_container.append(time_windows_listbox);
		container.append(time_windows_listbox_container);

		// protocol duration
		var protocol_duration_block = $("<div/>").addClass("row pb-2");
		protocol_duration_block.append($("<label/>").addClass("col-form-label col-sm-6").html("Protocol duration [min]:"));
		protocol_duration_block.append($("<label/>").addClass("col-form-label col-sm-6 ps-4").html(parseInt(this.protocol.protocol_duration)));
		container.append(protocol_duration_block);

		// event duration
		var event_duration_block = $("<div/>").addClass("row pb-2");
		event_duration_block.append($("<label/>").addClass("col-form-label col-sm-6").html("Event duration [min]:").attr("for", "event_duration_input"));

		var event_duration_input_block = $("<div/>").addClass("col-sm-6");
		var event_duration_input = $("<input/>").addClass("form-control").attr("id", "event_duration_input").attr("type", "number");
		event_duration_input.attr("min", "5").attr("max", "120").attr("step", "1").attr("required", "true").val(this.protocol.protocol_duration);
		event_duration_input_block.append(event_duration_input);
		event_duration_block.append(event_duration_input_block);
		this.gui.event_duration_input = event_duration_input;
		container.append(event_duration_block);

		// time slider
		var slider_block = $("<div/>").addClass("card");
		var slider_header_block = $("<div/>").addClass("row px-2");

		var start_time_block = $("<div/>").addClass("col-md-6 row").attr("id", "start_time_div");
		this.gui.start_time_block = start_time_block;
		slider_header_block.append(start_time_block);

		var end_time_block = $("<div/>").addClass("col-md-6 row").attr("id", "end_time_div");
		this.gui.end_time_block = end_time_block;
		slider_header_block.append(end_time_block);

		slider_block.append(slider_header_block);

		var slider_container = $("<div/>").css({ height: "68pt", "min-height": "68pt", "max-height": "68pt" }).addClass("px-2");
		slider_block.append(slider_container);

		var slider_element = $("<div/>").addClass("slider-box-handle slider-styled slider-hide").attr("id", this.slider_name);
		slider_container.append($("<div/>").append(slider_element).css("height", "68pt"));

		this.gui.slider_container = slider_container;

		container.append(slider_block);

		simple_dynamic_input_time(
			start_time_block,
			"start_time",
			"Start time:",
			10,
			"05:00",
			"22:00",
			null,
			function (val) {
				if (val !== "") {
					var _time = moment(val, "HH:mm");
					this.event_start = moment(this.selected_window_start).set({ hour: _time.hour(), minute: _time.minute() });
					this.event_end = moment(this.event_start).add(this.event_duration, "minutes");
					this.update_slider();
				}
			}.bind(this)
		);
		$(start_time_block).find("input").addClass("d-none");
		this.gui.start_time_block = start_time_block;

		simple_dynamic_input_time(
			end_time_block,
			"end_time",
			"End time:",
			10,
			"05:00",
			"22:00",
			null,
			function (val) {
				if (val !== "") {
					var _time = moment(val, "HH:mm");
					this.event_end = moment(this.selected_window_start).set({ hour: _time.hour(), minute: _time.minute() });
					this.event_start = moment(this.event_end).subtract(this.event_duration, "minutes");
					this.update_slider();
				}
			}.bind(this)
		);
		$(end_time_block).find("input").addClass("d-none");
		this.gui.end_time_block = end_time_block;

		$(time_windows_listbox_container)
			.find(".window-select-btn")
			.on("change", function () {
				var selected_index = $(this).val();
				$(time_windows_listbox_container).trigger("window-selected", [selected_index]);
			});

		$(time_windows_listbox_container).on(
			"window-selected",
			function (e, selected_index) {
				var window = this.windows[selected_index];
				this.selected_window = window;
				this.selected_window_start = moment(window[0]);
				this.selected_window_end = moment(window[1]);

				this.selected_window_duration = moment(window[1]).diff(moment(window[0]), "minutes");
				$(event_duration_input).attr("max", this.selected_window_duration);
				$(event_duration_input).attr("min", this.protocol.protocol_duration);

				$(start_time_block).find("input").removeClass("d-none");
				$(end_time_block).find("input").removeClass("d-none");

				$($(start_time_block).find("input")[0]).data("TimePicker").options.minTime = moment(this.selected_window_start).format("HH:mm");
				$($(start_time_block).find("input")[0]).data("TimePicker").options.startTime = moment(this.selected_window_start).format("HH:mm");
				$($(start_time_block).find("input")[0]).data("TimePicker").options.maxTime = moment(this.selected_window_end).format("HH:mm");
				$($(start_time_block).find("input")[0]).data("TimePicker").options.endTime = moment(this.selected_window_end).format("HH:mm");
				$($(start_time_block).find("input")[0]).data("TimePicker").items = null;
				$($(start_time_block).find("input")[0]).data("TimePicker").widget.instance = null;

				$($(end_time_block).find("input")[0]).data("TimePicker").options.minTime = moment(this.selected_window_start).format("HH:mm");
				$($(end_time_block).find("input")[0]).data("TimePicker").options.startTime = moment(this.selected_window_start).format("HH:mm");
				$($(end_time_block).find("input")[0]).data("TimePicker").options.maxTime = moment(this.selected_window_end).format("HH:mm");
				$($(end_time_block).find("input")[0]).data("TimePicker").options.endTime = moment(this.selected_window_end).format("HH:mm");
				$($(end_time_block).find("input")[0]).data("TimePicker").items = null;
				$($(end_time_block).find("input")[0]).data("TimePicker").widget.instance = null;

				this.event_start = this.selected_window_start;
				this.event_end = moment(this.selected_window_start).add(this.protocol.protocol_duration, "minutes");
				this.event_duration = this.protocol.protocol_duration;

				event_duration_input.val(this.event_duration).trigger("change");
			}.bind(this)
		);

		$(event_duration_input).on(
			"change",
			function () {
				var duration = parse_val($(event_duration_input).val());
				this.event_duration = duration;
				this.event_end = moment(this.event_start).add(this.event_duration, "minutes");

				this.update_slider();

				if (duration != this.protocol.protocol_duration) {
					$(event_duration_input).addClass("bg-danger text-dark");
				} else {
					$(event_duration_input).removeClass("bg-danger text-dark");
				}
			}.bind(this)
		);
	}

	update_time_input() {
		$(this.gui.start_time_block).find("input").val(moment(this.event_start).format("HH:mm"));
		$(this.gui.end_time_block).find("input").val(moment(this.event_end).format("HH:mm"));
	}
	update_duration() {
		this.gui.event_duration_input.val(this.event_duration);
	}

	update_slider() {
		var window_start = this.selected_window_start;
		var window_end = this.selected_window_end;

		var event_start = this.event_start || window_start;
		var duration = this.event_duration || this.protocol.protocol_duration;
		var event_end = moment(event_start).add(duration, "minutes");

		var _day_start = moment(window_start).startOf("date");
		var window_start_diff = window_start.diff(_day_start, "minutes");
		var window_end_diff = window_end.diff(_day_start, "minutes");

		var event_start_diff = event_start.diff(_day_start, "minutes");
		var event_end_diff = event_end.diff(_day_start, "minutes");

		function filterPips(value, type) {
			var divider = window_end_diff - window_start_diff > 180 ? 60 : 30;
			var minute = value % divider;
			switch (minute) {
				case divider / 2:
					return 2;
					break;
				case 0:
					return 1;
					break;
				default:
					if (minute % 5 == 0 && divider == 30) return 2;
					return -1;
			}
		}

		if (!this.slider) {
			this.slider = document.getElementById(this.slider_name);

			noUiSlider.create(this.slider, {
				start: [event_start_diff, event_end_diff],
				connect: [false, true, false],
				behaviour: "drag-fixed",
				range: {
					min: window_start_diff,
					max: window_end_diff,
				},
				step: 1,
				margin: duration,

				pips: {
					mode: "steps",
					density: 1,
					filter: filterPips,
					format: wNumb({
						decimals: 0,
						edit: function (value) {
							var formatted_val = moment(_day_start).add(value, "minutes").format("HH:mm");
							// console.log(value + " "+ _day_start.format("HH:mm") +" " + formatted_val);
							return formatted_val;
						},
					}),
				},
				tooltips: false,
			});

			var activePips = [null, null];

			this.slider.noUiSlider.on(
				"update",
				function (values, handle) {
					// Remove the active class from the current pip
					if (activePips[handle]) {
						activePips[handle].classList.remove("active-pip");
					}

					// Match the formatting for the pip
					var dataValue = Math.round(values[handle]);

					// Find the pip matching the value
					activePips[handle] = this.slider.querySelector('.noUi-value[data-value="' + dataValue + '"]');

					// Add the active class
					if (activePips[handle]) {
						activePips[handle].classList.add("active-pip");
					}

					var start = moment(_day_start).add(parseInt(values[0]), "minutes");
					var end = moment(_day_start).add(parseInt(values[1]), "minutes");
					this.event_start = start;
					this.event_end = end;
					this.event_duration = moment(end).diff(moment(start), "minutes");
					this.update_time_input();
				}.bind(this)
			);
		} else {
			this.slider.noUiSlider.off();
			this.slider.noUiSlider.updateOptions(
				{
					start: [event_start_diff, event_end_diff],
					connect: [false, true, false],
					behaviour: "drag-fixed",
					range: {
						min: window_start_diff,
						max: window_end_diff,
					},
					step: 1,
					margin: duration,

					pips: {
						mode: "steps",
						density: 1,
						filter: filterPips,
						format: wNumb({
							decimals: 0,
							edit: function (value) {
								var formatted_val = moment(_day_start).add(value, "minutes").format("HH:mm");
								// console.log(value + " "+ _day_start.format("HH:mm") +" " + formatted_val);
								return formatted_val;
							},
						}),
					},
					tooltips: false,
				},
				true
			);

			var activePips = [null, null];

			this.slider.noUiSlider.on(
				"update",
				function (values, handle) {
					// Remove the active class from the current pip
					if (activePips[handle]) {
						activePips[handle].classList.remove("active-pip");
					}

					// Match the formatting for the pip
					var dataValue = Math.round(values[handle]);

					// Find the pip matching the value
					activePips[handle] = this.slider.querySelector('.noUi-value[data-value="' + dataValue + '"]');

					// Add the active class
					if (activePips[handle]) {
						activePips[handle].classList.add("active-pip");
					}

					var start = moment(_day_start).add(parseInt(values[0]), "minutes");
					var end = moment(_day_start).add(parseInt(values[1]), "minutes");
					this.event_start = start;
					this.event_end = end;
					this.event_duration = moment(end).diff(moment(start), "minutes");
					this.update_time_input();
				}.bind(this)
			);
		}
	}

	#administration_parameters_gui(container) {
		container.empty();

		// patient n
		var patient_name_block = $("<div/>").addClass("row pb-2");
		patient_name_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Patient name:").attr("for", "patient_name_input"));
		var patient_name_input_block = $("<div/>").addClass("col-sm-9");
		var patient_name_input = $("<input/>").addClass("form-control").attr("id", "patient_name_input").attr("required", "true").attr("name", "patient_name");

		patient_name_input_block.append(patient_name_input);
		patient_name_block.append(patient_name_input_block);
		container.append(patient_name_block);

		// phone
		var patient_phone_block = $("<div/>").addClass("row pb-2");
		patient_phone_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Phone:").attr("for", "patient_phone_input"));
		var patient_phone_input_block = $("<div/>").addClass("col-sm-9");
		var patient_phone_input = $("<input/>").addClass("form-control").attr("id", "patient_phone_input").attr("name", "patient_phone");

		patient_phone_input_block.append(patient_phone_input);
		patient_phone_block.append(patient_phone_input_block);
		container.append(patient_phone_block);

		// comment
		var comment_block = $("<div/>").addClass("row pb-2");
		comment_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Comment:").attr("for", "comment_input"));
		var comment_input_block = $("<div/>").addClass("col-sm-9");
		var comment_input = $("<textarea/>").addClass("form-control").attr("id", "comment_input").attr("name", "comment").attr("rows", 5).css("resize", "none");

		comment_input_block.append(comment_input);
		comment_block.append(comment_input_block);
		container.append(comment_block);

		// var paid_block = $("<div/>").addClass("row pb-2 mt-2");
		// paid_block.append($("<label/>").addClass("col-sm-3").html("Financing:").attr("for", "paid_input_block"));
		// var paid_input_block = $("<div/>").addClass("form-check col-sm-9 ps-2").attr("id", "paid_input_block");
		// var paid_input = $("<input/>")
		// 	.addClass("form-check-input ms-1")
		// 	.attr("type", "checkbox")
		// 	.attr("id", "paid_input")
		// 	.attr("name", "paid")
		// 	.attr("checked", false);

		// paid_input_block.append(paid_input);
		// paid_input_block.append($("<label/>").addClass("form-check-label ps-1").html("Privately financed").attr("for", "paid_input"));
		// paid_block.append(paid_input_block);
		// container.append(paid_block);

		// referring physician
		var referring_physician_block = $("<div/>").addClass("row pb-2");
		referring_physician_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Referring physician:").attr("for", "physician_input"));
		var referring_physician_input_block = $("<div/>").addClass("col-sm-9");
		var referring_physician_input = $("<input/>").addClass("form-control").attr("id", "physician_input").attr("name", "physician");

		referring_physician_input_block.append(referring_physician_input);
		referring_physician_block.append(referring_physician_input_block);
		container.append(referring_physician_block);

		// reserved at
		var reserved_at_block = $("<div/>").addClass("row pb-2");
		reserved_at_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Reserved at:").attr("for", "reserved_at_input"));
		var reserved_at_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_at_input = $("<input/>").addClass("form-control").attr("id", "reserved_at_input").attr("name", "reserved_at");

		reserved_at_input_block.append(reserved_at_input);
		reserved_at_block.append(reserved_at_input_block);
		container.append(reserved_at_block);

		// reserved by
		var reserved_by_block = $("<div/>").addClass("row pb-2");
		reserved_by_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Reserved by:").attr("for", "reserved_by_input"));
		var reserved_by_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_by_input = $("<input/>").addClass("form-control").attr("id", "reserved_by_input").attr("name", "reserved_by").attr("required", "true");

		reserved_by_input_block.append(reserved_by_input);
		reserved_by_block.append(reserved_by_input_block);
		container.append(reserved_by_block);

		// contingent block
		var contingent_settings = $("<div/>").addClass("card flex-column w-100 p-2");

		// allow override
		var allow_override_block = $("<div/>").addClass("form-check pb-2");
		var allow_override_input = $("<input/>")
			.addClass("form-check-input")
			.attr("type", "checkbox")
			.attr("id", "allow_override_input")
			.attr("checked", false);
		allow_override_block.append($("<label/>").addClass("form-check-label").html("Set/override contingent").attr("for", "allow_override_input"));
		allow_override_block.append(allow_override_input);
		contingent_settings.append(allow_override_block);

		// contingent
		var contingent_select = $("<div/>").attr("id", "contingent_select").addClass("d-flex");

		$.each(
			contingents,
			function (index, _contingent) {
				var _select_div = $("<div/>").addClass("flex-fill");
				if (index + 1 < contingents.length) _select_div.addClass("pe-2");
				var _id = _contingent + "_contingent";
				var select_btn = $("<input>")
					.attr("id", _id)
					.addClass("btn-check contingent-btn")
					.attr("type", "radio")
					.attr("name", "contingent")
					.attr("value", _contingent)
					.attr("required", true);
				var select_label = $("<label/>").addClass("btn btn-outline-dark w-100").attr("for", _id).html(_contingent);

				_select_div.append(select_btn);
				_select_div.append(select_label);
				contingent_select.append(_select_div);
				if (_contingent == this.contingent) select_btn.attr("checked", "true");
			}.bind(this)
		);
		contingent_settings.append(contingent_select);

		$(allow_override_input).change(function () {
			if (this.checked) {
				$(contingent_select).find(".contingent-btn").prop("disabled", false);
			} else {
				$(contingent_select).find(".contingent-btn").prop("disabled", true);
			}
		});

		if (!this.contingent) {
			allow_override_input.prop("checked", true).prop("disabled", true);
			$(contingent_select).find(".contingent-btn").prop("disabled", false);
		} else {
			allow_override_input.prop("checked", false);
		}

		container.append(contingent_settings);
	}

	create_gui(windows, create_on_subit = true, success_callback = null, submit_btn_text = "Book new examination") {
		var form = $("<form/>").attr("id", "event_creation_form").addClass("needs-validation").addClass("d-flex flex-column");
		var form_content = $("<div/>").addClass("row pb-2");

		// timing
		var timing_block = $("<div/>").addClass("col-md-6 p-2");
		this.#timing_parameters_gui(timing_block, windows);
		this.windows = windows;
		form_content.append(timing_block);

		// administration
		var administration_block = $("<div/>").addClass("col-md-6 p-2");
		this.#administration_parameters_gui(administration_block);
		form_content.append(administration_block);

		form.append(form_content);

		var submit_btn = $("<button/>").addClass("btn btn-outline-dark").attr("id", "addEventButton").attr("type", "button").html(submit_btn_text);
		form.append(submit_btn);
		this.gui.submit_btn = submit_btn;

		this.form = form;

		submit_btn.on("click", function () {
			if (!$(form)[0].checkValidity()) {
				$(form)[0].reportValidity();
			} else {
				form.trigger("submit", true);
			}
		});

		form.on(
			"submit",
			function (e) {
				e.preventDefault();
				var event = MR_Calendar_Event.parse_from_form(form, { start: this.event_start, end: this.event_end, protocol: this.protocol });

				if (create_on_subit) {
					this.create_event(event, success_callback);
				}
			}.bind(this)
		);

		return this.form;
	}

	show_gui_as_modal(container, form, title = "Define new examination") {
		var modal_id = "event_creation_modal";
		var modal = container.find("#" + modal_id);
		if (modal) {
			container.find("#" + modal_id).remove();
		}

		var modal_root = $("<div/>").addClass("modal fade").attr("id", modal_id).attr("tabindex", "-1");
		var modal_dialog = $("<div/>").addClass("modal-dialog modal-xl");
		var modal_content = $("<div/>").addClass("modal-content");

		var modal_header = $("<div/>").addClass("modal-header");
		modal_header.append($("<h5/>").addClass("modal-title display-3 fs-3").html(title));
		modal_header.append($("<button/>").addClass("btn-close").attr("data-bs-dismiss", "modal").attr("aria-label", "Close"));

		var modal_body = $("<div/>").addClass("modal-body");
		modal_body.append(form);

		modal_content.append(modal_header);
		modal_content.append(modal_body);

		modal_dialog.html(modal_content);
		modal_root.html(modal_dialog);

		this.modal = modal_root;

		container.append(modal_root);
		var modal = container.find("#" + modal_id);

		modal.modal("show");
	}

	parse_form_to_event() {
		return MR_Calendar_Event.parse_from_form(this.form, { start: this.event_start, end: this.event_end, protocol: this.protocol });
	}

	create_event(parsed_event, success_callback) {
		$.ajax({
			type: "POST",
			url: "php/event_create.php",
			dataType: "json",
			data: { calendar_name: this.params.source_calendar, event_data: parsed_event.to_PHP_event_data() },
			success: function (result) {
				if (this.modal) {
					this.modal.modal("hide");
				}
				if (success_callback) {
					success_callback();
				}
			}.bind(this),
		});
	}
}

function handle_event_creation_gui() {
	//event creation
	var picker = Object();

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
					// search inside masks  of a given contingent
					var windows = search_free_time_windows_using_masks(events, masks, values["showCount"], protocol["protocol_duration"], search_role);
				} else {
					// search inside all
					if (search_role == "all") {
						var windows = search_free_time_windows_using_masks(events, masks, values["showCount"], protocol["protocol_duration"], null);
					} else {
					}
				}

				// console.log(windows);
				show_event_creation_modal($("#modalContainer"), "Create event", windows, protocol, null, function (event, success_callback = null) {});
			},
		});
	});
}
