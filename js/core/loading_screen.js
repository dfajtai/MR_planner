function is_loading(val) {
	if (val) {
		$(".loading-overlay").removeClass("d-none");
		is_loading_timeout = setTimeout(function () {
			bootbox.alert({
				message: "Az EWS szerver nem válaszol.",
				buttons: {
					ok: {
						label: "Ok",
						className: "btn-outline-dark",
					},
				},
				callback: function (reusult) {
					is_loading(false);
				},
			});
		}, 60000);
	} else {
		$(".loading-overlay").addClass("d-none");
		clearTimeout(is_loading_timeout);
	}
}
