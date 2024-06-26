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
}
