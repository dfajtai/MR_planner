function create_window_search_gui(container, pre_params = null, search_callback = null) {
	container.empty();
	var form = $("<form/>").addClass("needs-validation");

	container.append(form);
	return form;
}
