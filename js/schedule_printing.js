function create_schedule_table(container, events, cols) {
	$(container).empty();

	if (events.length > 0) {
		var table = $("<table/>").addClass("w-100 table table-bordered align-middle").attr("id", "schedule_table");
		var header_row = $("<tr/>");
		$.each(cols, function (idx, key) {
			var th = $("<th/>").html(key).attr("scope", "col").addClass("text-center");
			if (idx != cols.length - 1) {
				th.addClass("th.fit");
			}
			header_row.append(th);
		});
		table.append($("<thead/>").addClass("table-light").append(header_row));

		var table_body = $("<tbody/>");

		$.each(events, function (row_index, row) {
			var row_dom = $("<tr/>");
			$.each(cols, function (idx, key) {
				var td = $("<td/>")
					.html(row[key] == null ? "-" : row[key])
					.addClass("border");
				if (idx != cols.length - 1) {
					td.addClass("td.fit");
				}
				row_dom.append(td);
			});
			table_body.append(row_dom);
		});

		table.append(table_body);

		$(container).append($("<div/>").addClass("table-responsive text-nowrap").append(table));
	}
}

function handle_schedule_printing_gui() {
	var picker = Object();

	var default_calendar_name = "MR előjegyzés";

	var calendar_select = $("#printCalendarSelect");

	form = $("#printParamsForm");

	$.each(available_calendars, function (index, calendar_name) {
		var calendar_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
		calendar_select.append(calendar_opt);
	});

	if (available_calendars.includes(default_calendar_name)) {
		calendar_select.val(default_calendar_name);
	}

	picker = new easepick.create({
		element: document.getElementById("printDateRangePicker"),
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
		zIndex: 10000,
	});

	picker.setStartDate(moment().format("YYYY-MM-DD"));
	picker.setEndDate(moment().format("YYYY-MM-DD"));

	$("#printScheduleBtn").on("click", function () {
		if (!$(form)[0].checkValidity()) {
			$(form)[0].reportValidity();
		} else {
			form.trigger("submit", true);
		}
	});

	form.on("submit", function (e) {
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

		$.ajax({
			type: "GET",
			url: "php/get_calendar_data.php",
			dataType: "json",
			data: {
				source_calendar: values["sourceCalendar"],
				mask_calendar: random_text(42),
				start_date: start_date,
				end_date: end_date,
			},
			success: function (result) {
				var events = result["events"];

				if (events.length == 0) {
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

				$.each(events, function (event_index, event) {
					event["start"] = new Date(event["start"]);
					event["end"] = new Date(event["end"]);
					event["date"] = moment(event["start"]).format("YYYY.MM.DD");
					if (!dates.includes(event["date"])) dates.push(event["date"]);
				});

				$.each(dates, function (date_index, date) {
					var daily_events = getEntriesWhere(events, "date", date);
					// console.log(daily_events);
					$.each(daily_events, function (event_index, event) {
						event["Vizsgálat kezdete"] = moment(event["start"]).format("HH:mm");
						event["Vizsgálat vége"] = moment(event["end"]).format("HH:mm");
						event["Megjegyzés"] = event["text"];
					});

					create_schedule_table($("#tableContainer"), daily_events, ["Vizsgálat kezdete", "Vizsgálat vége", "Megjegyzés"]);

					const doc = new jspdf.jsPDF("p", "mm", [297, 210]);
					const pageWidth = doc.internal.pageSize.getWidth();

					doc.setFontSize(22); // Set font size to 16
					doc.setFont("helvetica", "bold");
					doc.text("MR (3T)", pageWidth - 18, 20, { align: "right" });

					doc.text(date, 16, 20);

					doc.setFontSize(12); // Reset font size to default
					doc.setFont("helvetica", "normal");

					doc.autoTable({
						html: "#schedule_table",
						theme: "grid",
						styles: { cellPadding: 0, fontSize: 10, overflow: "linebreak" },
						startY: 25,
						pageBreak: "auto",
						rowPageBreak: "avoid",
						columnStyles: {
							0: { cellWidth: 40, halign: "center", valign: "middle" },
							1: { cellWidth: 40, halign: "center", valign: "middle" },
							2: { cellWidth: 100, halign: "left", valign: "middle", cellPadding: 3 },
						},
						headStyles: { valign: "middle", halign: "center", fillColor: [128, 128, 128], padding: 2, minCellHeight: 10, lineColor: [0, 0, 0], lineWidth: 0.5 },
						bodyStyles: { minCellHeight: 12, lineColor: [0, 0, 0], lineWidth: 0.5 },
					});
					doc.save("schedule-" + date.split(".").join("-") + " .pdf");
				});
			},
		});
	});
}
