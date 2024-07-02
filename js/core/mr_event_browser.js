class MR_event_browser {
	constructor(container, success_callback = null) {
		this.container = container;
		this.success_callback = success_callback;

		this.gui = Object();

		this.search_form = null;

		this.event_editor = null;

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
		var submit_btn = $("<button/>").addClass("btn btn-outline-dark w-100").html("Query bookings").attr("id", "print_btn").attr("type", "button");
		form.append($("<div/>").addClass("pt-2").append(submit_btn));
		this.gui.submit_btn = submit_btn;

		this.container.append(form);
		this.form = form;

		var control_div = $("<div/>").addClass("my-2 p-2 d-none").css({ border: "solid lightgray 1pt" });

		// event select
		var event_select_block = $("<div/>").addClass("row");
		event_select_block.append($("<label/>").attr("for", "event_select").addClass("col-sm-3 col-form-label").html("Select examination"));
		var event_select_container = $("<div/>").addClass("col-sm-9 d-flex flex-row");
		var event_select_div = $("<div/>").addClass("w-100");
		var event_select = $("<input/>")
			.attr("name", "selected_event_index")
			.attr("id", "event_select")
			.addClass("form-control flexdatalist")
			.attr("required", true)
			.attr("placeholder", "Select booked examination...")
			.attr("type", "test");
		event_select_div.append(event_select);
		event_select_container.append(event_select_div);
		var clear_select_btn = $("<button/>").addClass("btn btn-outline-dark ms-2").append($("<span/>").addClass("fa-light fa-x"));
		event_select_container.append(clear_select_btn);

		event_select_block.append(event_select_container);
		control_div.append(event_select_block);

		// event info
		var event_info_block = $("<div/>").addClass("d-flex py-2").attr("id", "selected_event_info");
		this.gui.event_info = event_info_block;
		control_div.append(event_info_block);

		// event controls
		var event_controls = $("<div/>").addClass("d-none d-flex pt-2");
		event_controls.append($("<button/>").addClass("btn btn-outline-dark w-100  me-2").html("Remove").attr("id", "delete_selected_event"));
		event_controls.append($("<button/>").addClass("btn btn-outline-dark w-100").html("Edit").attr("id", "edit_selected_event"));

		control_div.append(event_controls);

		this.gui.event_select = event_select;
		this.gui.clear_select_btn = clear_select_btn;
		this.gui.control_div = control_div;
		this.gui.event_controls = event_controls;

		this.container.append(control_div);

		this.gui_logic();
	}

	parametrize_event_selector() {
		$(this.gui.event_select).flexdatalist({
			minLength: 0,
			selectionRequired: true,
			searchIn: "_subject",
			visibleProperties: ["_subject"],
			valueProperty: "id",
			textProperty: "[{start_date_string}: {start_to_end_string}] {_subject}",
			searchContain: true,
			data: this.calendar_data,
			limitOfValues: 1,
		});

		// handle bugged validation popup location
		var val_dummy = $($(this.gui.event_select).parent().find(".flexdatalist-set")[0]);
		var list_dummy = $($(this.gui.event_select).parent().find(".flexdatalist-alias")[0]);
		val_dummy.css({ position: "absolute", top: "", left: "", zIndex: -1000 }).width(list_dummy.width()).position(list_dummy.position());

		$(this.gui.event_select).off("select:flexdatalist");
		$(this.gui.event_select).on(
			"select:flexdatalist",
			function (e, selected, o) {
				this.selected_event = selected;
				$(this.gui.event_controls).removeClass("d-none");
				selected.to_preview_table($(this.gui.event_info));
				$(this.gui.event_info).removeClass("d-none");
			}.bind(this)
		);
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
						if (this.calendar_data.length == 0) {
							bootbox.alert({
								message: "There is no booked event matching the search parameters.",
								buttons: {
									ok: {
										label: "Ok",
										className: "btn-outline-dark",
									},
								},
							});
							$(this.gui.control_div).addClass("d-none");
							return;
						}

						$(this.gui.event_controls).addClass("d-none");
						$(this.gui.event_info).addClass("d-none");

						$(this.gui.control_div).removeClass("d-none");

						this.parametrize_event_selector();
					}.bind(this)
				);
			}.bind(this)
		);

		$(this.gui.clear_select_btn).on(
			"click",
			function () {
				$(this.gui.event_controls).addClass("d-none");
				$(this.gui.event_info).addClass("d-none");
				$(this.gui.event_select).flexdatalist("reset");
				this.parametrize_event_selector();
			}.bind(this)
		);

		$(this.gui.event_controls)
			.find("#delete_selected_event")
			.on(
				"click",
				function () {
					var message = "The selected booking will be deleted.";
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
								this.selected_event.call_event_delete(
									function () {
										$(this.form).trigger("submit");
									}.bind(this)
								);
							}
						}.bind(this),
					});
				}.bind(this)
			);

		$(this.gui.event_controls)
			.find("#edit_selected_event")
			.on(
				"click",
				function () {
					if (!this.event_editor) {
						this.event_editor = new MR_event_editor(this.selected_event);
					} else {
						this.event_editor.set_update_event(this.selected_event);
					}
					this.event_editor.create_gui();
					this.event_editor.show_gui_as_modal(
						$(modal_container),
						function () {
							$(this.form).trigger("submit");
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
