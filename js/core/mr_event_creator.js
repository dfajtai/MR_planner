class MR_event_creator {
	static instance_id = 0;
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

		this.slider = null;

		this.instance_id = MR_event_creator.instance_id;
		MR_event_creator.instance_id += 1;

		this.slider_name = "event_timing_slider_" + this.instance_id;
	}

	timing_parameters_gui(container) {
		container.empty();

		container.append($("<label/>").addClass("form-label").html("Szabad időablak(ok)").attr("for", "#timeWindows"));
		var time_windows_listbox_container = $("<div/>").attr("id", "timeWindows").addClass("listbox-custom card");
		var time_windows_listbox = $("<ul/>").addClass("list-group list-group-flush");

		this.gui.time_windows = time_windows_listbox;

		time_windows_listbox_container.append(time_windows_listbox);
		container.append(time_windows_listbox_container);

		// protocol duration
		var protocol_duration_block = $("<div/>").addClass("row pb-2");
		protocol_duration_block.append($("<label/>").addClass("col-form-label col-sm-6").html("Protokol időtartama [perc]"));
		protocol_duration_block.append($("<label/>").addClass("col-form-label col-sm-6 ps-4").html(parseInt(this.protocol.protocol_duration)));
		container.append(protocol_duration_block);

		// event duration
		var event_duration_block = $("<div/>").addClass("row pb-2");
		event_duration_block.append(
			$("<label/>").addClass("col-form-label col-sm-6").html("Lefoglalni készült időtartam [perc]").attr("for", "event_duration_input")
		);

		var event_duration_input_block = $("<div/>").addClass("col-sm-6");
		var event_duration_input = $("<input/>").addClass("form-control").attr("id", "event_duration_input").attr("type", "number");
		event_duration_input.attr("min", "5").attr("max", "120").attr("step", "1").attr("required", "true").val(this.protocol.protocol_duration);
		event_duration_input_block.append(event_duration_input);
		event_duration_block.append(event_duration_input_block);
		this.gui.event_duration_input = event_duration_input;
		container.append(event_duration_block);

		// time slider
		var slider_block = $("<div/>").addClass("card");
		var slider_header_block = $("<div/>").addClass("d-flex flex-row px-2");

		var start_time_block = $("<div/>").addClass("d-flex me-2 my-1 w-50").attr("id", "start_time_div");
		this.gui.start_time_block = start_time_block;
		slider_header_block.append(start_time_block);

		var end_time_block = $("<div/>").addClass("d-flex my-1 w-50").attr("id", "end_time_div");
		this.gui.end_time_block = end_time_block;
		slider_header_block.append(end_time_block);

		slider_block.append(slider_header_block);

		var slider_container = $("<div/>").css({ height: "68pt", "min-height": "68pt", "max-height": "68pt" }).addClass("px-2");
		slider_block.append(slider_container);

		var slider_element = $("<div/>").addClass("slider-box-handle slider-styled slider-hide").attr("id", this.slider_name);
		slider_container.append($("<div/>").append(slider_element).css("height", "68pt"));

		this.gui.slider_container = slider_container;
		this.gui.slider = slider_element;

		container.append(slider_block);

		simple_dynamic_input_time(
			start_time_block,
			"start_time",
			"Időpont kezdete",
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
			"Időpont vége",
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

		var event_duration_input_change = function () {
			var duration = parse_val($(event_duration_input).val());
			if (duration >= this.protocol.protocol_duration) {
				this.event_duration = duration;
				this.event_end = moment(this.event_start).add(this.event_duration, "minutes");

				this.update_slider();
			} else {
				$(event_duration_input).val(this.protocol.protocol_duration).trigger("change");
			}

			if (duration != this.protocol.protocol_duration) {
				$(event_duration_input).addClass("bg-danger text-dark");
			} else {
				$(event_duration_input).removeClass("bg-danger text-dark");
			}
		}.bind(this);

		$(event_duration_input).on("change", event_duration_input_change);
		$(event_duration_input).on(
			"focusin",
			function () {
				this.set_slider_enabled(false);
			}.bind(this)
		);
		$(event_duration_input).on(
			"focusout",
			function () {
				this.set_slider_enabled(true);
				event_duration_input_change();
			}.bind(this)
		);
	}

	set_update_windows(windows) {
		this.windows = windows;
		if (!this.gui) {
			return;
		}

		var container = this.gui.time_windows;
		container.empty();

		var start = this.gui.start_time_block;
		var end = this.gui.end_time_block;
		var duration = this.gui.event_duration_input;

		var creator_id = this.instance_id;

		var options = {
			1: "Hét",
			2: "Kedd",
			3: "Szer",
			4: "Csüt",
			5: "Pén",
			6: "Szom",
			7: "Vas",
		};

		$.each(windows, function (index, window) {
			var start_date_string = moment(window[0]).format("YYYY.MM.DD");

			var end_date_string = moment(window[1]).format("YYYY.MM.DD");
			var start_string = moment(window[0]).format("HH:mm");
			var end_string = moment(window[1]).format("HH:mm");

			var day_string = options[moment(window[0]).day()];

			if (end_date_string != start_date_string) {
				var btn_text = "[" + start_date_string + " - " + day_string + "]";
			} else {
				var btn_text = "[" + start_date_string + " - " + day_string + "] " + start_string + " - " + end_string;
			}

			var time_window_list_item = $("<li/>").addClass("list-group-item p-1");
			var time_window_element = $("<div/>").addClass("flex-fill");
			var _id = "event_creator_" + creator_id + "_time_window" + index;
			var btn_input = $("<input/>").addClass("window-select-btn btn-check").attr("id", _id);
			btn_input.attr("type", "radio").attr("name", "timeWindow").attr("value", index).attr("autocomplete", "off").attr("required", "true");

			var btn_label = $("<label/>").addClass("btn btn-outline-dark w-100").attr("for", _id).html(btn_text);

			time_window_element.append(btn_input);
			time_window_element.append(btn_label);

			time_window_list_item.append(time_window_element);

			container.append(time_window_list_item);
		});

		$(this.gui.time_windows)
			.find(".window-select-btn")
			.on("change", function () {
				var selected_index = $(this).val();
				$(container).trigger("window-selected", [selected_index]);
			});

		$(this.gui.time_windows).on(
			"window-selected",
			function (e, selected_index) {
				var window = this.windows[selected_index];
				this.selected_window = window;
				this.selected_window_start = moment(window[0]);
				this.selected_window_end = moment(window[1]);

				this.selected_window_duration = moment(window[1]).diff(moment(window[0]), "minutes");
				$(duration).attr("max", this.selected_window_duration);
				$(duration).attr("min", this.protocol.protocol_duration);

				$(start).find("input").removeClass("d-none");
				$(end).find("input").removeClass("d-none");

				$($(start).find("input")[0]).data("TimePicker").options.minTime = moment(this.selected_window_start).format("HH:mm");
				$($(start).find("input")[0]).data("TimePicker").options.startTime = moment(this.selected_window_start).format("HH:mm");
				$($(start).find("input")[0]).data("TimePicker").options.maxTime = moment(this.selected_window_end).format("HH:mm");
				$($(start).find("input")[0]).data("TimePicker").options.endTime = moment(this.selected_window_end).format("HH:mm");
				$($(start).find("input")[0]).data("TimePicker").items = null;
				$($(start).find("input")[0]).data("TimePicker").widget.instance = null;

				$($(end).find("input")[0]).data("TimePicker").options.minTime = moment(this.selected_window_start).format("HH:mm");
				$($(end).find("input")[0]).data("TimePicker").options.startTime = moment(this.selected_window_start).format("HH:mm");
				$($(end).find("input")[0]).data("TimePicker").options.maxTime = moment(this.selected_window_end).format("HH:mm");
				$($(end).find("input")[0]).data("TimePicker").options.endTime = moment(this.selected_window_end).format("HH:mm");
				$($(end).find("input")[0]).data("TimePicker").items = null;
				$($(end).find("input")[0]).data("TimePicker").widget.instance = null;

				this.event_start = this.selected_window_start;
				this.event_end = moment(this.selected_window_start).add(this.protocol.protocol_duration, "minutes");
				this.event_duration = this.protocol.protocol_duration;

				duration.val(this.event_duration).trigger("change");
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

		// if (this.slider) {
		// 	noUiSlider.destroy(this.slider);
		// 	this.slider = null;
		// }

		if (!this.slider) {
			this.slider = $(this.gui.slider)[0];

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

	set_slider_enabled(is_enabled = true) {
		if (this.slider) {
			if (is_enabled) this.slider.noUiSlider.enable();
			else this.slider.noUiSlider.disable();
		}
	}

	administration_parameters_gui(container) {
		container.empty();

		// patient n
		var patient_name_block = $("<div/>").addClass("row pb-2");
		patient_name_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Név").attr("for", "patient_name_input"));
		var patient_name_input_block = $("<div/>").addClass("col-sm-9");
		var patient_name_input = $("<input/>").addClass("form-control").attr("id", "patient_name_input").attr("required", "true").attr("name", "patient_name");

		patient_name_input_block.append(patient_name_input);
		patient_name_block.append(patient_name_input_block);
		container.append(patient_name_block);

		// phone
		var patient_phone_block = $("<div/>").addClass("row pb-2");
		patient_phone_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Tel.").attr("for", "patient_phone_input"));
		var patient_phone_input_block = $("<div/>").addClass("col-sm-9");
		var patient_phone_input = $("<input/>").addClass("form-control").attr("id", "patient_phone_input").attr("name", "patient_phone");

		patient_phone_input_block.append(patient_phone_input);
		patient_phone_block.append(patient_phone_input_block);
		container.append(patient_phone_block);

		// comment
		var comment_block = $("<div/>").addClass("row pb-2");
		comment_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Megjegyzés").attr("for", "comment_input"));
		var comment_input_block = $("<div/>").addClass("col-sm-9");
		var comment_input = $("<textarea/>").addClass("form-control").attr("id", "comment_input").attr("name", "comment").attr("rows", 5).css("resize", "none");

		comment_input_block.append(comment_input);
		comment_block.append(comment_input_block);
		container.append(comment_block);

		// physician
		var physician_block = $("<div/>").addClass("row pb-2");
		physician_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Beutaló orovos").attr("for", "physician_input"));
		var physician_input_block = $("<div/>").addClass("col-sm-9");
		var physician_input = $("<input/>").addClass("form-control").attr("id", "physician_input").attr("name", "physician");

		physician_input_block.append(physician_input);
		physician_block.append(physician_input_block);
		container.append(physician_block);

		// reserved at
		var reserved_at_block = $("<div/>").addClass("row pb-2");
		reserved_at_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Létrehozva").attr("for", "reserved_at_input"));
		var reserved_at_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_at_input = $("<input/>").addClass("form-control").attr("id", "reserved_at_input").attr("name", "reserved_at").attr("required", "true");

		reserved_at_input_block.append(reserved_at_input);
		reserved_at_block.append(reserved_at_input_block);
		container.append(reserved_at_block);

		var picker = new easepick.create({
			element: $(reserved_at_input)[0],
			css: ["css/easepicker.css", "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css"],
			css: ["css/easepicker.css", "libs/css/easepick-index.css"],

			plugins: ["LockPlugin", "AmpPlugin"],

			LockPlugin: {
				minDate: new Date(),
			},
			AmpPlugin: {
				dropdown: {
					months: true,
					years: true,
				},
				resetButton: true,
			},
			zIndex: 10000,
		});
		picker.setDate(moment().format("YYYY-MM-DD"));

		// reserved by
		var reserved_by_block = $("<div/>").addClass("row pb-2");
		reserved_by_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Létrehozta").attr("for", "reserved_by_input"));
		var reserved_by_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_by_input = $("<input/>").addClass("form-control").attr("id", "reserved_by_input").attr("name", "reserved_by").attr("required", "true");

		reserved_by_input_block.append(reserved_by_input);
		reserved_by_block.append(reserved_by_input_block);
		container.append(reserved_by_block);

		// skipped block
		var skipped_block = $("<div/>").addClass("form-check pb-2");
		var skipped_input = $("<input/>")
			.addClass("form-check-input")
			.attr("type", "checkbox")
			.attr("id", "isSkipped_input")
			.prop("checked", false)
			.attr("name", "isSkipped");
		skipped_block.append($("<label/>").addClass("form-check-label").html("Kihagyott?").attr("for", "isSkipped_input"));
		skipped_block.append(skipped_input);
		container.append(skipped_block);

		// contingent block
		var contingent_settings = $("<div/>").addClass("card flex-column w-100 p-2");

		// allow override
		var allow_override_block = $("<div/>").addClass("form-check pb-2");
		var allow_override_input = $("<input/>")
			.addClass("form-check-input")
			.attr("type", "checkbox")
			.attr("id", "allow_override_input")
			.attr("checked", false);
		allow_override_block.append($("<label/>").addClass("form-check-label").html("Kontingens megadás/felülbírálása").attr("for", "allow_override_input"));
		allow_override_block.append(allow_override_input);
		contingent_settings.append(allow_override_block);

		// contingent
		var contingent_select = $("<div/>").attr("id", "contingent_select").addClass("d-flex");

		var index = 0;
		var creator_id = this.instance_id;
		contingents.forEach((contingent_def) => {
			var _select_div = $("<div/>").addClass("flex-fill");
			if (index + 1 < contingents.length) _select_div.addClass("pe-2");

			var _id = "event_creator_" + creator_id + "_" + contingent_def.label + "_contingent";
			var select_btn = $("<input>")
				.attr("id", _id)
				.addClass("btn-check contingent-btn")
				.attr("type", "radio")
				.attr("name", "contingent")
				.attr("value", contingent_def.category)
				.attr("required", true);
			var select_label = $("<label/>").addClass("btn btn-outline-dark w-100").attr("for", _id).html(contingent_def.label);

			_select_div.append(select_btn);
			_select_div.append(select_label);
			contingent_select.append(_select_div);
			if (contingent_def.category === this.contingent) select_btn.prop("checked", true);
			index += 1;
		});

		contingent_settings.append(contingent_select);

		$(allow_override_input).on("change", function () {
			if (this.checked) {
				$(contingent_settings).find(".contingent-btn").prop("disabled", false);
			} else {
				$(contingent_settings).find(".contingent-btn").prop("disabled", true);
			}
		});

		if (!this.contingent) {
			allow_override_input.prop("checked", true).prop("disabled", true);
			$(contingent_settings).find(".contingent-btn").prop("disabled", false);
		} else {
			allow_override_input.prop("checked", false);
			$(contingent_settings).find(".contingent-btn").prop("disabled", true);
		}

		container.append(contingent_settings);
	}

	create_gui(windows = null, create_on_subit = true, success_callback = null, submit_btn_text = "Új időpont létrehozása") {
		var form = $("<form/>").attr("id", "event_creation_form").addClass("needs-validation").addClass("d-flex flex-column");
		var form_content = $("<div/>").addClass("row pb-2");

		// timing
		var timing_block = $("<div/>").addClass("col-md-6 p-2");
		this.timing_parameters_gui(timing_block);
		form_content.append(timing_block);

		// administration
		var administration_block = $("<div/>").addClass("col-md-6 p-2");
		this.administration_parameters_gui(administration_block);
		form_content.append(administration_block);

		form.append(form_content);

		var submit_btn = $("<button/>").addClass("btn btn-outline-dark").attr("id", "create_event_btn").attr("type", "button").html(submit_btn_text);
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
				var event = MR_calendar_event.parse_from_form(form, { start: this.event_start, end: this.event_end, protocol: this.protocol });

				if (create_on_subit) {
					var dummy_container = $("<div/>");
					event.to_preview_table(dummy_container);
					var message = "Egy új vizsgálat előjegyzésére készül az alábbi paraméterekkel:<br/><br/>";
					message += dummy_container.prop("innerHTML");

					bootbox.confirm({
						message: message + "<br/>Folytatja?",
						buttons: {
							confirm: {
								label: "Yes",
								className: "btn-outline-danger",
							},
							cancel: {
								label: "No",
								className: "btn-outline-dark",
							},
						},
						callback: function (result) {
							if (result) {
								this.create_event(event, success_callback);
							}
						}.bind(this),
					});
				}
			}.bind(this)
		);

		if (windows) {
			this.set_update_windows(windows);
		}

		return this.form;
	}

	show_gui_as_modal(container, form = null, title = "Új időpont létrehozása") {
		form = form || this.form;
		var modal_id = "event_creation_modal";
		var modal = container.find("#" + modal_id);
		if (modal) {
			container.find("#" + modal_id).remove();
		}

		var modal_root = $("<div/>").addClass("modal fade").attr("id", modal_id).attr("tabindex", "-1");
		var modal_dialog = $("<div/>").addClass("modal-dialog modal-xl modal-fullscreen-lg-down");
		var modal_content = $("<div/>").addClass("modal-content");

		var modal_header = $("<div/>").addClass("modal-header");
		modal_header.append($("<h5/>").addClass("modal-title display-3 fs-3").html(title));
		modal_header.append($("<button/>").addClass("btn-close").attr("data-bs-dismiss", "modal").attr("aria-label", "Close"));

		var modal_body = $("<div/>").addClass("modal-body");
		modal_body.append(form);

		modal_content.append(modal_header);
		modal_content.append(modal_body);

		modal_dialog.append(modal_content);
		modal_root.append(modal_dialog);

		this.modal = modal_root;

		container.append(modal_root);
		var modal = container.find("#" + modal_id);

		modal.modal("show");
	}

	parse_form_to_event() {
		return MR_calendar_event.parse_from_form(this.form, { start: this.event_start, end: this.event_end, protocol: this.protocol });
	}

	create_event(parsed_event, success_callback) {
		var calendar = this.params.source_calendar;
		is_loading(true, "Creating event");
		parsed_event.call_event_create(
			calendar,
			function () {
				if (this.modal) {
					this.modal.modal("hide");
				}
				if (success_callback) {
					success_callback();
				}
				is_loading(false, "Creating event");
			}.bind(this)
		);
	}
}
