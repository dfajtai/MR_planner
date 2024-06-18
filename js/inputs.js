function dynamicRangeInput(container, name, label, default_value, arg = null, on_change = null, trigger_change = false) {
	var _label = $("<label/>")
		.addClass("col-md-3 col-form-label")
		.attr("for", name + "Input")
		.html(label);
	// var _label =  $("<label/>").addClass("col-md-3 col-form-label").attr("for",name+"Input").html(`<small>${label}</small>`);

	var group_container = $("<div/>").addClass("input-group");

	var _input = $("<input/>").addClass("form-range w-75 mt-1 me-2 custom-bs-slider mt-2");
	_input
		.attr("type", "range")
		.attr("id", name + "Input")
		.attr("name", name)
		.attr("data-name", name)
		.attr("data-label", label);
	$(_input).attr("data-value", "");

	if (arg.hasOwnProperty("step")) _input.attr("step", parseFloat(arg.step));
	if (arg.hasOwnProperty("min")) _input.attr("min", arg.min);
	if (arg.hasOwnProperty("max")) _input.attr("max", arg.max);

	group_container.append(_input);

	var current = $("<input/>").addClass("form-control ").attr("type", "numeric").attr("id", "currentValue");

	$(current).val(default_value);
	if (arg.hasOwnProperty("step")) current.attr("step", arg.step);

	group_container.append(current);

	$(_input).on("change", function () {
		$(current).val($(this).val());
		$(this).prop("data-value", $(this).val());
		if (on_change instanceof Function) {
			on_change($(this).val());
		}
	});

	$(current).on("change", function () {
		var val = $(this).val();
		if (arg.hasOwnProperty("step")) {
			var step = parseFloat(arg.step);
			val = Math.floor(val / step) * step;
		}

		$(_input).val(val).trigger("change");
		$(_input).prop("data-value", val);
	});

	$(_input).on("input", function () {
		$(current).val($(this).val());
		$(this).prop("data-value", $(this).val());
	});

	if (arg.hasOwnProperty("unit")) {
		var unit = $("<span/>").addClass("input-group-text w-25");
		unit.html(arg.unit);
		group_container.append(unit);
	}

	if (trigger_change) $(_input).val(default_value).trigger("change");
	else $(_input).val(default_value);

	container.append(_label);
	container.append($("<div/>").addClass("col-md-9").append(group_container));
}
