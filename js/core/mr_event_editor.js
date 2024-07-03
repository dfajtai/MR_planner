class MR_event_editor {
	constructor(event = null) {
		this.content = null;

		this.event = event;

		this.gui = Object();

		this.slot_browser = null;

		this.timing_handler = null;
	}

	set_update_event(event) {
		this.event = event;
	}

	create_gui() {
		if (!this.content) {
			this.content = $("<div/>").addClass("w-100 d-flex h-90");
		}

		this.content.empty();

		// slot & timing
		var slot_and_timing_card = $("<div/>").addClass("card d-flex w-50 m-1");
		var slot_and_timing_card_header = $("<h5/>").addClass("card-header bg-dark text-white").html("Re-schedule");
		slot_and_timing_card.append(slot_and_timing_card_header);
		var slot_browser_block = $("<div/>").addClass("w-100 p-2");
		var timing_params_block = $("<div/>").addClass("w-100 p-2 d-none");

		slot_and_timing_card.append(slot_browser_block);
		slot_and_timing_card.append(timing_params_block);

		this.content.append(slot_and_timing_card);

		this.gui.slot_browser = slot_browser_block;
		this.gui.timing_params = timing_params_block;

		if (!this.slot_browser) {
			this.slot_browser = new MR_timing_slot_browser(
				$(slot_browser_block),
				function (results) {
					var windows = results.windows;

					if (windows.length > 0) {
						// TODO show timing block...
						this.timing_gui(this.gui.timing_params, results);
					} else {
						this.gui.timing_params.empty();
						this.gui.timing_params.addClass("d-none");
						bootbox.alert({
							message: "There is no free time window matching the search parameters.",
							buttons: {
								ok: {
									label: "Ok",
									className: "btn-outline-dark",
								},
							},
						});
					}
				}.bind(this)
			);
			this.slot_browser.create_gui(false);
		} else {
			this.gui.slot_browser.empty();
			this.slot_browser.container = this.gui.slot_browser;
			this.slot_browser.create_gui(false);
		}
		if (this.event.contingent) {
			this.slot_browser.gui.logic_select.val(this.event.contingent);
		}

		// administartion
		var administration_card = $("<div/>").addClass("card d-flex w-50 m-1");
		var administration_card_header = $("<h5/>").addClass("card-header bg-dark text-white").html("Administartion parameters");
		administration_card.append(administration_card_header);

		var administration_block = $("<div/>").addClass("w-100 p-2");

		this.administration_gui(administration_block, this.event);

		this.gui.administration = administration_block;

		administration_card.append(administration_block);
		this.content.append(administration_card);
	}

	timing_gui(container, results) {
		container.empty();
		container.removeClass("d-none");

		// handle window search results

		var success = results.success;
		var search_params = results.search_params;
		var contingent = results.contingent;
		var windows = results.windows;
		var events = results.events;
		var masks = results.masks;

		this.timing_handler = new MR_event_creator(search_params, contingent);
		this.timing_handler.timing_parameters_gui(container);
		this.timing_handler.set_update_windows(windows);
	}

	administration_gui(container, event = null) {
		event = event || this.event;

		container.empty();

		var form = $("<form/>").attr("id", "event_edit_form").addClass("needs-validation").addClass("d-flex flex-column");

		// patient n
		var patient_name_block = $("<div/>").addClass("row pb-2");
		patient_name_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Patient name").attr("for", "patient_name_input"));
		var patient_name_input_block = $("<div/>").addClass("col-sm-9");
		var patient_name_input = $("<input/>").addClass("form-control").attr("id", "patient_name_input").attr("required", "true").attr("name", "patient_name");
		if (event.params.patient_name) patient_name_input.attr("value", event.params.patient_name);

		patient_name_input_block.append(patient_name_input);
		patient_name_block.append(patient_name_input_block);
		form.append(patient_name_block);

		// phone
		var patient_phone_block = $("<div/>").addClass("row pb-2");
		patient_phone_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Phone").attr("for", "patient_phone_input"));
		var patient_phone_input_block = $("<div/>").addClass("col-sm-9");
		var patient_phone_input = $("<input/>").addClass("form-control").attr("id", "patient_phone_input").attr("name", "patient_phone");
		if (event.params.patient_phone) patient_phone_input.attr("value", event.params.patient_phone);

		patient_phone_input_block.append(patient_phone_input);
		patient_phone_block.append(patient_phone_input_block);
		form.append(patient_phone_block);

		// comment
		var comment_block = $("<div/>").addClass("row pb-2");
		comment_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Comment").attr("for", "comment_input"));
		var comment_input_block = $("<div/>").addClass("col-sm-9");
		var comment_input = $("<textarea/>").addClass("form-control").attr("id", "comment_input").attr("name", "comment").attr("rows", 5).css("resize", "none");
		if (event.params.comment) comment_input.text(event.params.comment.toString().trim());

		comment_input_block.append(comment_input);
		comment_block.append(comment_input_block);
		form.append(comment_block);

		// physician
		var physician_block = $("<div/>").addClass("row pb-2");
		physician_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Physician").attr("for", "physician_input"));
		var physician_input_block = $("<div/>").addClass("col-sm-9");
		var physician_input = $("<input/>").addClass("form-control").attr("id", "physician_input").attr("name", "physician");
		if (event.params.physician) physician_input.attr("value", event.params.physician);

		physician_input_block.append(physician_input);
		physician_block.append(physician_input_block);
		form.append(physician_block);

		// reserved at
		var reserved_at_block = $("<div/>").addClass("row pb-2");
		reserved_at_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Reserved at").attr("for", "reserved_at_input"));
		var reserved_at_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_at_input = $("<input/>").addClass("form-control").attr("id", "reserved_at_input").attr("name", "reserved_at").attr("required", "true");
		if (event.params.reserved_at) reserved_at_input.attr("value", event.params.reserved_at);
		// TODO format??

		reserved_at_input_block.append(reserved_at_input);
		reserved_at_block.append(reserved_at_input_block);
		form.append(reserved_at_block);

		var picker = new easepick.create({
			element: $(reserved_at_input)[0],
			css: ["css/easepicker.css", "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css"],
			css: ["css/easepicker.css", "libs/css/easepick-index.css"],

			plugins: ["LockPlugin", "AmpPlugin"],

			LockPlugin: {
				minDate: new Date(),
			},
			AmpPlugin: {
				resetButton: true,
				darkMode: false,
			},
			zIndex: 10000,
		});
		picker.setDate(moment().format("YYYY-MM-DD"));

		// reserved by
		var reserved_by_block = $("<div/>").addClass("row pb-2");
		reserved_by_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Reserved by").attr("for", "reserved_by_input"));
		var reserved_by_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_by_input = $("<input/>").addClass("form-control").attr("id", "reserved_by_input").attr("name", "reserved_by").attr("required", "true");
		if (event.params.reserved_by) reserved_by_input.attr("value", event.params.reserved_by);

		reserved_by_input_block.append(reserved_by_input);
		reserved_by_block.append(reserved_by_input_block);
		form.append(reserved_by_block);

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

		var index = 0;
		contingents.forEach((contingent_def) => {
			var _select_div = $("<div/>").addClass("flex-fill");
			if (index + 1 < contingents.length) _select_div.addClass("pe-2");

			var _id = contingent_def.label + "_contingent";
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
			if (contingent_def.category === event.contingent) select_btn.prop("checked", true);
			index += 1;
		});

		contingent_settings.append(contingent_select);

		allow_override_input.on("change", function () {
			if (this.checked) {
				contingent_settings.find(".contingent-btn").prop("disabled", false);
			} else {
				contingent_settings.find(".contingent-btn").prop("disabled", true);
			}
		});

		this.gui.allow_contingent_override = allow_override_input;
		this.gui.contingent_settings = contingent_settings;

		if (!event.contingent) {
			allow_override_input.prop("checked", true).prop("disabled", true);
			contingent_settings.find(".contingent-btn").prop("disabled", false);
		} else {
			allow_override_input.prop("checked", false);
			contingent_settings.find(".contingent-btn").prop("disabled", true);
		}

		form.append(contingent_settings);

		container.append(form);

		this.gui.administration_form = form;
	}

	show_gui_as_modal(container, success_callback = null, content = null, title = "Edit booked examination") {
		content = content || this.content;
		var modal_id = "event_edit_modal";
		var modal = container.find("#" + modal_id);
		if (modal) {
			container.find("#" + modal_id).remove();
		}

		var modal_root = $("<div/>").addClass("modal fade").attr("id", modal_id).attr("tabindex", "-1");
		var modal_dialog = $("<div/>").addClass("modal-dialog modal-fullscreen");
		var modal_content = $("<div/>").addClass("modal-content");

		var modal_header = $("<div/>").addClass("modal-header");
		modal_header.append($("<h5/>").addClass("modal-title display-5 fs-5").html(title));
		modal_header.append($("<button/>").addClass("btn-close").attr("data-bs-dismiss", "modal").attr("aria-label", "Close"));

		var modal_body = $("<div/>").addClass("modal-body").css({ "overflow-y": "auto" });
		modal_body.append(content);

		var modal_footer = $("<div/>").addClass("modal-footer");

		modal_footer.append($("<button/>").addClass("btn btn-outline-dark my-1 w-100").attr("id", "submit").html("Submit changes"));

		modal_content.append(modal_header);
		modal_content.append(modal_body);
		modal_content.append(modal_footer);

		modal_dialog.append(modal_content);
		modal_root.append(modal_dialog);

		this.modal = modal_root;

		container.append(modal_root);
		var modal = container.find("#" + modal_id);

		modal.on(
			"shown.bs.modal",
			function () {
				this.slot_browser.gui_logic(true);
				var matched_protocol = getEntryWhere(protocols, "protocol_name", this.event.params.protocol);
				if (matched_protocol) {
					$(this.slot_browser.gui.protocol_select).flexdatalist("value", matched_protocol.protocol_index);
				}

				var contingent_settings = this.gui.contingent_settings;
				this.gui.allow_contingent_override.on("change", function () {
					if (this.checked) {
						contingent_settings.find(".contingent-btn").prop("disabled", false);
					} else {
						contingent_settings.find(".contingent-btn").prop("disabled", true);
					}
				});
			}.bind(this)
		);

		modal.on("hidden.bs.modal", function () {
			modal.modal("dispose");
			content.empty();
		});

		modal_footer.find("#submit").on(
			"click",
			function () {
				var timing_params = { start: this.event.start, end: this.event.end, protocol: this.event.protocol_params };
				if (this.timing_handler) {
					if (this.timing_handler.event_start) {
						timing_params = { start: this.timing_handler.event_start, end: this.timing_handler.event_end, protocol: this.timing_handler.protocol };
					}
				}

				if (!$(this.gui.administration_form)[0].checkValidity()) {
					$(this.gui.administration_form)[0].reportValidity();
				} else {
					var new_event = MR_calendar_event.parse_from_form(this.gui.administration_form, timing_params);
					var dummy_container = $("<div/>");
					this.event.to_compare_table(dummy_container, new_event);
					var message = "The selected booking will be updated as the following:<br/><br/>";
					message += dummy_container.prop("innerHTML");

					bootbox.confirm({
						message: message + "<br/>Do you want to proceed?",
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
								is_loading(true);
								this.event.update_from_instance(new_event);
								this.event.call_event_update(
									function () {
										if (success_callback) {
											success_callback();
										}
										is_loading(false);
										modal.modal("hide");
									}.bind(this)
								);
							}
						}.bind(this),
					});
				}
			}.bind(this)
		);

		modal.modal("show");
	}
}
