class MR_event_editor {
	constructor(container) {
		this.container = container;

		this.event = null;

		this.gui = Object();

		this.form = null;
	}

	create_gui() {}

	logic() {}

	set_update_event(event) {
		this.event = event;
	}

	administration_gui(container, event = null) {
		event = event || this.event;

		container.empty();

		// patient n
		var patient_name_block = $("<div/>").addClass("row pb-2");
		patient_name_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Patient name").attr("for", "patient_name_input"));
		var patient_name_input_block = $("<div/>").addClass("col-sm-9");
		var patient_name_input = $("<input/>").addClass("form-control").attr("id", "patient_name_input").attr("required", "true").attr("name", "patient_name");
		patient_name_input.attr("value", event.params.patient_name);

		patient_name_input_block.append(patient_name_input);
		patient_name_block.append(patient_name_input_block);
		container.append(patient_name_block);

		// phone
		var patient_phone_block = $("<div/>").addClass("row pb-2");
		patient_phone_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Phone").attr("for", "patient_phone_input"));
		var patient_phone_input_block = $("<div/>").addClass("col-sm-9");
		var patient_phone_input = $("<input/>").addClass("form-control").attr("id", "patient_phone_input").attr("name", "patient_phone");
		patient_name_input.attr("value", event.params.patient_phone);

		patient_phone_input_block.append(patient_phone_input);
		patient_phone_block.append(patient_phone_input_block);
		container.append(patient_phone_block);

		// comment
		var comment_block = $("<div/>").addClass("row pb-2");
		comment_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Comment").attr("for", "comment_input"));
		var comment_input_block = $("<div/>").addClass("col-sm-9");
		var comment_input = $("<textarea/>").addClass("form-control").attr("id", "comment_input").attr("name", "comment").attr("rows", 5).css("resize", "none");
		comment_input.attr("value", event.params.comment);

		comment_input_block.append(comment_input);
		comment_block.append(comment_input_block);
		container.append(comment_block);

		// physician
		var physician_block = $("<div/>").addClass("row pb-2");
		physician_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Physician").attr("for", "physician_input"));
		var physician_input_block = $("<div/>").addClass("col-sm-9");
		var physician_input = $("<input/>").addClass("form-control").attr("id", "physician_input").attr("name", "physician");
		physician_input.attr("value", event.params.physician);

		physician_input_block.append(physician_input);
		physician_block.append(physician_input_block);
		container.append(physician_block);

		// reserved at
		var reserved_at_block = $("<div/>").addClass("row pb-2");
		reserved_at_block.append($("<label/>").addClass("col-form-label col-sm-3").html("Reserved at").attr("for", "reserved_at_input"));
		var reserved_at_input_block = $("<div/>").addClass("col-sm-9");
		var reserved_at_input = $("<input/>").addClass("form-control").attr("id", "reserved_at_input").attr("name", "reserved_at");
		reserved_at_input.attr("value", event.params.reserved_at);
		// TODO format??

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
		reserved_by_input.attr("value", event.params.reserved_by);

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
			if (contingent_def.category === event.contingent) select_btn.attr("checked", "true");
			index += 1;
		});

		contingent_settings.append(contingent_select);

		$(allow_override_input).change(function () {
			if (this.checked) {
				$(contingent_select).find(".contingent-btn").prop("disabled", false);
			} else {
				$(contingent_select).find(".contingent-btn").prop("disabled", true);
			}
		});

		if (!event.contingent) {
			allow_override_input.prop("checked", true).prop("disabled", true);
			$(contingent_select).find(".contingent-btn").prop("disabled", false);
		} else {
			allow_override_input.prop("checked", false);
			$(contingent_select).find(".contingent-btn").prop("disabled", true);
		}

		container.append(contingent_settings);
	}

	timing_gui(container) {}

	show_gui_as_modal(container, form = null, title = "Edit booking") {
		form = form || this.form;
		var modal_id = "event_edit_modal";
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

		modal_dialog.append(modal_content);
		modal_root.append(modal_dialog);

		this.modal = modal_root;

		container.append(modal_root);
		var modal = container.find("#" + modal_id);

		modal.modal("show");
	}
}
