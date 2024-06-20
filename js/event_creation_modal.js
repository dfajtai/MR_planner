var slider = null;

function timing_param_controls(container, time_windows, protocol_length, timing_update_callback = null) {
	container.empty();

	container.append($("<label/>").addClass("form-label").html("Available time window(s):").attr("for", "#timeWindows"));
	var time_windows_listbox_container = $("<div/>").attr("id", "timeWindows").addClass("listbox-custom card");
	var time_windows_listbox = $("<ul/>").addClass("list-group list-group-flush");

	$.each(time_windows, function (index, window) {
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
	protocol_duration_block.append($("<label/>").addClass("col-form-label col-sm-6 ps-4").html(parseInt(protocol_length)));
	container.append(protocol_duration_block);

	// event duration
	var event_duration_block = $("<div/>").addClass("row pb-2");
	event_duration_block.append($("<label/>").addClass("col-form-label col-sm-6").html("Event duration [min]:").attr("for", "event_duration_input"));

	var event_duration_input_block = $("<div/>").addClass("col-sm-6");
	var event_duration_input = $("<input/>").addClass("form-control").attr("id", "event_duration_input").attr("type", "number");
	event_duration_input.attr("min", "5").attr("max", "120").attr("step", "1").attr("required", "true").val(protocol_length);
	event_duration_input_block.append(event_duration_input);
	event_duration_block.append(event_duration_input_block);
	container.append(event_duration_block);

	// time slider
	var slider_block = $("<div/>").addClass("card");
	slider_header_block = $("<div/>").addClass("row px-2");

	slider_header_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Start time:"));
	slider_header_block.append($("<label/>").addClass("col-form-label col-sm-3").attr("id", "start_time_label"));
	slider_header_block.append($("<label/>").addClass("col-form-label col-sm-3 ps-4").html("End time:"));
	slider_header_block.append($("<label/>").addClass("col-form-label col-sm-3").attr("id", "end_time_label"));
	slider_block.append(slider_header_block);

	var slider_container = $("<div/>").css({ height: "68pt", "min-height": "68pt", "max-height": "68pt" }).addClass("px-2");
	slider_block.append(slider_container);
	container.append(slider_block);

	function update_times(start, end) {
		$("#start_time_label").html(moment(start).format("HH:mm"));
		$("#end_time_label").html(moment(end).format("HH:mm"));
		if (timing_update_callback) {
			timing_update_callback(start, end);
		}
	}

	$(time_windows_listbox_container)
		.find(".window-select-btn")
		.on("change", function () {
			var selected_index = $(this).val();
			var window = time_windows[selected_index];

			var max_duration = moment(window[1]).diff(moment(window[0]), "minutes");

			var duration = parse_val(event_duration_input.val());
			if (duration > max_duration) {
				event_duration_input.val(max_duration);
				duration = max_duration;
			}

			add_slider(slider_container, "event_time_slider", window[0], window[1], duration, update_times);
		});

	$(event_duration_input).on("change", function () {
		var duration = parse_val($(this).val());

		var selected_time_windows = $(time_windows_listbox_container).find(".window-select-btn:checked");
		if (selected_time_windows.length == 1) {
			var selected_time_window = $(selected_time_windows[0]).val();
			var window = time_windows[selected_time_window];

			add_slider(slider_container, "event_time_slider", window[0], window[1], duration, update_times);
		}

		if (duration != protocol_length) {
			$(this).addClass("bg-danger text-dark");
		} else {
			$(this).removeClass("bg-danger text-dark");
		}
	});
}

function administration_param_controls(container, contingent = null) {
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
	var referring_physician_input = $("<input/>").addClass("form-control").attr("id", "physician_input").attr("name", "physican");

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
	var allow_override_input = $("<input/>").addClass("form-check-input").attr("type", "checkbox").attr("id", "allow_override_input").attr("checked", false);
	allow_override_block.append($("<label/>").addClass("form-check-label").html("Set/override contingent").attr("for", "allow_override_input"));
	allow_override_block.append(allow_override_input);
	contingent_settings.append(allow_override_block);

	// contingent
	var contingent_select = $("<div/>").attr("id", "contingent_select").addClass("d-flex");

	$.each(contingents, function (index, _contingent) {
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
		if (_contingent == contingent) select_btn.attr("checked", "true");
	});
	contingent_settings.append(contingent_select);

	$(allow_override_input).change(function () {
		if (this.checked) {
			$(contingent_select).find(".contingent-btn").prop("disabled", false);
		} else {
			$(contingent_select).find(".contingent-btn").prop("disabled", true);
		}
	});

	if (!contingent) {
		allow_override_input.prop("checked", true).prop("disabled", true);
		$(contingent_select).find(".contingent-btn").prop("disabled", false);
	} else {
		allow_override_input.prop("checked", false);
	}

	container.append(contingent_settings);
}

function show_event_creation_modal(container, title, time_windows, protocol, contingent = null, submit_callback = null) {
	if (time_windows.length == 0) {
		bootbox.alert({
			message: "There is no free time window matching the search parameters.",
			buttons: {
				ok: {
					label: "Ok",
					className: "btn-outline-dark",
				},
			},
		});
		return;
	}
	container.empty();

	var start_time = null;
	var end_time = null;

	var modal_id = "event_creation_modal";

	var modal_root = $("<div/>").addClass("modal fade").attr("id", modal_id).attr("tabindex", "-1");
	var modal_dialog = $("<div/>").addClass("modal-dialog modal-xl");
	var modal_content = $("<div/>").addClass("modal-content");

	var modal_header = $("<div/>").addClass("modal-header");
	modal_header.append($("<h5/>").addClass("modal-title display-3 fs-3").html(title));
	modal_header.append($("<button/>").addClass("btn-close").attr("data-bs-dismiss", "modal").attr("aria-label", "Close"));

	var modal_body = $("<div/>").addClass("modal-body");

	// var modal_footer = $("<div/>").addClass("modal-footer");
	// modal_footer.append(
	// 	$("<button/>")
	// 		.addClass("btn btn-outline-dark")
	// 		.attr("id", "clear_form")
	// 		.attr("aria-label", "Clear")
	// 		.html($("<i/>").addClass("fa fa-eraser me-2").attr("aria-hidden", "true"))
	// 		.append("Clear")
	// );
	// modal_footer.append($("<button/>").addClass("btn btn-outline-dark").attr("data-bs-dismiss", "modal").attr("aria-label", "Close").html("Close"));

	modal_content.append(modal_header);
	modal_content.append(modal_body);
	// modal_content.append(modal_footer);

	modal_dialog.html(modal_content);
	modal_root.html(modal_dialog);

	var form = $("<form/>").attr("id", "event_creation_form").addClass("needs-validation").addClass("d-flex flex-column");
	modal_body.append(form);

	// modal_footer.find("#clear_form").on("click", function () {
	// 	$(form)[0].reset();
	// });

	// lets define the form....
	var form_content = $("<div/>").addClass("row pb-2");

	// timing
	var timing_block = $("<div/>").addClass("col-md-6 p-2");
	timing_param_controls(timing_block, time_windows, protocol.protocol_duration, function (start, end) {
		(start_time = start), (end_time = end);
	});
	form_content.append(timing_block);

	// administration
	var administration_block = $("<div/>").addClass("col-md-6 p-2");
	administration_param_controls(administration_block, contingent);
	form_content.append(administration_block);

	form.append(form_content);

	var submit_btn = $("<button/>").addClass("btn btn-outline-dark").attr("id", "addEventButton").attr("type", "button").html(title);
	form.append(submit_btn);

	container.append(modal_root);

	var modal = container.find("#" + modal_id);
	modal.modal("show");

	picker = new easepick.create({
		element: document.getElementById("reserved_at_input"),
		css: ["css/easepicker.css", "libs/css/easepick-index.css"],

		plugins: ["LockPlugin", "AmpPlugin"],

		LockPlugin: {
			minDate: new Date(),
			minDays: 1,
			maxDays: 1,
		},
		AmpPlugin: {
			resetButton: true,
			darkMode: false,
		},
		zIndex: 10000,
	});
	picker.setDate(moment().format("YYYY-MM-DD"));

	submit_btn.on("click", function () {
		if (!$(form)[0].checkValidity()) {
			$(form)[0].reportValidity();
		} else {
			form.trigger("submit", true);
		}
	});

	form.on("submit", function (e) {
		e.preventDefault();

		var event = MR_Calendar_Event.parse_from_form(form, { start: start_time, end: end_time, protocol: protocol });

		if (submit_callback) {
			submit_callback(event, function () {
				modal.modal("hide");
			});
		}
	});
}

function add_slider(container, slider_name, start_time, end_time, duration, update_callback = null) {
	container.empty();

	if (document.getElementById(slider_name)) document.getElementById(slider_name).remove();

	var slider_element = $("<div/>").addClass("slider-box-handle slider-styled slider-hide").attr("id", slider_name);
	container.append($("<div/>").append(slider_element).css("height", "68pt"));

	slider = document.getElementById(slider_name);

	var _start_time = moment(start_time);
	var _end_time = moment(end_time);

	var _day_start = moment(start_time).set("hour", 0).set("minute", 0);
	var start_diff = _start_time.diff(_day_start, "minutes");
	var end_diff = _end_time.diff(_day_start, "minutes");

	slider = document.getElementById(slider_name);
	function filterPips(value, type) {
		var divider = end_diff - start_diff > 180 ? 60 : 30;
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

	noUiSlider.create(slider, {
		start: [start_diff, start_diff + duration],
		connect: [false, true, false],
		behaviour: "drag-fixed",
		range: {
			min: start_diff,
			max: end_diff,
		},
		step: 1,

		pips: {
			mode: "steps",
			density: 5,
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

	slider.noUiSlider.on("update", function (values, handle) {
		// Remove the active class from the current pip
		if (activePips[handle]) {
			activePips[handle].classList.remove("active-pip");
		}

		// Match the formatting for the pip
		var dataValue = Math.round(values[handle]);

		// Find the pip matching the value
		activePips[handle] = slider.querySelector('.noUi-value[data-value="' + dataValue + '"]');

		// Add the active class
		if (activePips[handle]) {
			activePips[handle].classList.add("active-pip");
		}

		if (update_callback) {
			var start = moment(_day_start).add(parseInt(values[0]), "minutes");
			var end = moment(_day_start).add(parseInt(values[1]), "minutes");
			update_callback(start, end);
		}
	});
}
