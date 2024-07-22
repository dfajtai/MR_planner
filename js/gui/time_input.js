function simple_dynamic_input_time(container, name, label, interval = 10, min_time = null, max_time = null, default_time = null, on_change = null) {
	container.empty();

	var _time_label = $("<small/>")
		.addClass("col-md-7 col-form-label")
		.attr("for", name + "_input")
		.html(label);
	var _time_input = $("<input/>")
		.addClass("form-control w-100")
		.attr("id", name + "_input")
		.attr("name", name);

	container.append(_time_label);
	container.append($("<div/>").append(_time_input).addClass("col-md-5"));

	_time_input.timepicker({
		timeFormat: "HH:mm",
		interval: interval,
		minTime: moment(min_time, "HH:mm").format("HH:mm"),
		maxTime: moment(max_time, "HH:mm").format("HH:mm"),
		defaultTime: moment(default_time, "HH:mm").format("HH:mm"),
		startTime: moment(min_time, "HH:mm").format("HH:mm"),
		dynamic: false,
		dropdown: true,
		scrollbar: true,
		zindex: 3000,
		change: function () {
			// console.log("asd");
			if (on_change instanceof Function) {
				on_change($(this).val());
			}
		},
	});
	// _time_input.on("click",function(){
	//     $(this).val("");
	// })
}
