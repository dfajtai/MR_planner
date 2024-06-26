const schedule_table_header = [
	{ label: "Időtartam", prop: "duration" },
	{ label: "Név (Protokol)", prop: "subject" },
	{ label: "Részletek", prop: "details" },
];

class MR_schedule_printer {
	constructor(container, success_callback = null) {
		this.container = container;
		this.success_callback = success_callback;

		this.gui = Object();

		this.form = null;

		this.calendar_data = null;

		this.fonts = null;
	}

	create_gui() {
		this.container.empty();
		var form = $("<form/>").addClass("form d-flex flex-column needs-validation").attr("id", "print_params_form");

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

		// printed props
		var props_check_block = $("<div/>").addClass("row mb-2");
		props_check_block.append($("<label/>").addClass("col-form-label col-sm-3").attr("for", "day_check").html("Printed properties"));
		var props_check_div = $("<div/>").addClass("col-sm-9 d-flex flex-wrap mx-auto").attr("id", "show_count_block");
		var options = [
			{ value: "patient_name", label: "Név", default: false },
			{ value: "protocol", label: "Protokol", default: false },
			{ value: "contingent", label: "Kontingens", default: false },
			{ value: "patient_phone", label: "Tel", default: true },
			{ value: "comment", label: "Megjegyzés", default: true },
			{ value: "physican", label: "Beutaló orvos", default: false },
			{ value: "reserved_at", label: "Előjegyzés ideje", default: false },
			{ value: "reserved_by", label: "Előjegyezte", default: false },
		];
		this.gui.props_to_print = props_check_div;

		$.each(options, function (idx, option) {
			var option_container = $("<div/>").addClass("mb-1");
			if (idx < options.length - 1) option_container.addClass("pe-1");
			var _id = "allow_" + option.label;

			option_container.append(
				$("<input/>")
					.attr("type", "checkbox")
					.addClass("btn-check")
					.attr("name", "printed_props")
					.attr("id", _id)
					.attr("data-value", option.value)
					.attr("data-label", option.label)
					.attr("checked", option.default)
			);
			option_container.append($("<label/>").addClass("btn btn-outline-dark").attr("for", _id).html(option.label).css({ width: "110pt" }));
			props_check_div.append(option_container);
		});
		props_check_block.append(props_check_div);
		form.append(props_check_block);

		var submit_btn = $("<button/>").addClass("btn btn-outline-dark w-100").html("Print schedules").attr("id", "print_btn").attr("type", "button");
		form.append($("<div/>").addClass("py-2").append(submit_btn));
		this.gui.submit_btn = submit_btn;

		this.container.append(form);
		this.form = form;

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
						if (!this.font)
							this.load_fonts(
								function () {
									this.print_schedule(params);
								}.bind(this)
							);
						else {
							this.print_schedule(params);
						}
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

		var props_to_print = [];
		$.each($(this.gui.props_to_print).find(":checked"), function (idx, dom) {
			var _prop = { key: $(dom).attr("data-value"), label: $(dom).attr("data-label") };
			props_to_print.push(_prop);
		});

		var params = {
			start_date: start_date,
			end_date: end_date,
			calendar_name: values.calendar_name,
			props_to_print: props_to_print,
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

	load_fonts(success_callback = null) {
		var ajax_calls = [];
		var fonts = Object();
		font_paths.forEach((font_info) => {
			var path = font_info.path;
			var font_type = font_info.type;
			var ajax = $.ajax({
				url: path,
				method: "GET",
				xhrFields: {
					responseType: "arraybuffer",
				},
				success: function (data) {
					// Convert the array buffer to Base64
					var binary = "";
					var bytes = new Uint8Array(data);
					var len = bytes.byteLength;
					for (var i = 0; i < len; i++) {
						binary += String.fromCharCode(bytes[i]);
					}
					var base64String = window.btoa(binary);

					fonts[font_type] = base64String;
				}.bind(this),
				error: function (xhr, status, error) {
					console.error("Error loading TTF file: " + font_path, error);
				},
			});
			ajax_calls.push(ajax);
		});

		$.when.apply(this, ajax_calls).then(
			function () {
				this.fonts = fonts;
				if (success_callback) {
					success_callback();
				}
			}.bind(this)
		);
	}

	print_schedule(params) {
		var events_to_print = this.calendar_data;
		var props_to_print = params.props_to_print;

		if (events_to_print.length == 0) {
			bootbox.alert({
				message: "There are no scheduled events to print within the selected date range.",
				buttons: {
					ok: {
						label: "Ok",
						className: "btn-outline-dark",
					},
				},
			});
			return;
		}

		var dates = [];

		$.each(events_to_print, function (event_index, event) {
			if (!dates.includes(event.start_date_string)) dates.push(event.start_date_string);
		});

		function create_schedule_table(container, rows) {
			container.empty();

			var table = $("<table/>").addClass("w-100 table table-bordered align-middle").attr("id", "schedule_table");
			var header_row = $("<tr/>");

			schedule_table_header;
			$.each(schedule_table_header, function (idx, col) {
				var th = $("<th/>").html(col.label).attr("scope", "col").addClass("text-center");
				if (idx != schedule_table_header.length - 1) {
					th.addClass("th.fit");
				}
				header_row.append(th);
			});
			table.append($("<thead/>").addClass("table-light").append(header_row));

			var table_body = $("<tbody/>");
			$.each(rows, function (row_index, row) {
				table_body.append(row);
			});

			table.append(table_body);

			$(container).append($("<div/>").addClass("table-responsive text-nowrap").append(table));
		}

		$.each(
			dates,
			function (date_index, date) {
				var daily_events = [];
				$.each(events_to_print, function (event_idx, event) {
					if (event.start_date_string == date) daily_events.push(event);
				});
				// console.log(daily_events);

				var rows = [];
				$.each(daily_events, function (event_index, event) {
					rows.push(event.to_schedule_row(props_to_print));
				});

				create_schedule_table($(table_container), rows);

				const { jsPDF } = window.jspdf;

				const doc = new jsPDF("p", "mm", [297, 210]);
				const pageWidth = doc.internal.pageSize.getWidth();

				if (this.fonts) {
					for (const [font_type, font_data] of Object.entries(this.fonts)) {
						doc.addFileToVFS("myfont-" + font_type + ".ttf", font_data);
						doc.addFont("myfont-" + font_type + ".ttf", "myfont", font_type);
					}
				}

				doc.setFont("myfont", "bold");
				doc.setFontSize(22); // Set font size to 16
				doc.text("MR előjegyzés (3T)", pageWidth - 18, 20, { align: "right" });

				doc.text(date, 16, 20);

				doc.setFont("myfont", "normal");
				doc.setFontSize(14); // Reset font size to default
				// doc.setFont("helvetica", "normal");

				doc.autoTable({
					html: "#schedule_table",
					theme: "grid",
					startY: 25,
					pageBreak: "auto",
					rowPageBreak: "avoid",
					columnStyles: {
						0: { cellWidth: 30, halign: "center", valign: "middle", fontStyle: "bold" },
						1: { cellWidth: 60, halign: "center", valign: "middle" },
						2: { cellWidth: 90, halign: "left", valign: "middle", cellPadding: 1 },
					},
					headStyles: {
						valign: "middle",
						halign: "center",
						fillColor: [128, 128, 128],
						padding: 2,
						minCellHeight: 10,
						lineColor: [0, 0, 0],
						lineWidth: 0.5,
						font: "myfont",
						fontStyle: "bold",
					},
					bodyStyles: { minCellHeight: 12, lineColor: [0, 0, 0], lineWidth: 0.5 },
					styles: { font: "myfont", fontSize: 12 },
					willDrawCell: function (data) {
						if (data.cell.section === "body") {
							doc.setFillColor(255, 255, 255);
							try {
								var row = $(data.row.raw._element);
								var contingent = row.attr("data-contingent");
								var matched_contingent = getEntryWhere(contingents, "category", contingent);

								if (matched_contingent) {
									var c = matched_contingent.color;
									doc.setFillColor(c[0], c[1], c[2]);
								}
							} catch (error) {
								console.log(error);
							}
						}
					},
				});
				doc.save("schedule-" + date.split(".").join("-") + " .pdf");
			}.bind(this)
		);
	}
}
