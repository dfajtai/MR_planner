function handle_schedule_printing_gui() {
    var picker = Object();

    var default_calendar_name = "MR előjegyzés";

    var calendar_select = Object();


    calendar_select = $("#printCalendarSelect");


    search_params_form = $("#searchParamsForm");

    // populate calendar selection
    $.ajax({
        type: "GET",
        url: "php/get_calendar_names.php",
        dataType: "json",
        data: {},
        success: function (calendar_names) {
            var server_message = server_response_message_parser(calendar_names);
            if (server_message) logout_with_message(server_message);

            $.each(calendar_names, function (index, calendar_name) {
                var calendar_opt = $("<option/>")
                    .html(calendar_name)
                    .attr("value", calendar_name);
                calendar_select.append(calendar_opt);
            });

            if (calendar_names.includes(default_calendar_name)) {
                calendar_select.val(default_calendar_name);
            }

        },
    });

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
    });

    picker.setStartDate(moment().format("YYYY-MM-DD"));
    picker.setEndDate(moment().format("YYYY-MM-DD"));
}