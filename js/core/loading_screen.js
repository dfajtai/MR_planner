function is_loading(val, message = "", ews = true) {
	var format = "YYYY.MM.DD hh:mm:ss.SSSS";

	if (val) {
		if (message) console.log(moment().format(format) + ": '" + message + "'...");
		else console.log(moment().format(format) + ": Loading...");
		$(".loading-overlay").removeClass("d-none");
		var timeout_id = setTimeout(function () {
			is_loading(false, message, ews);
			bootbox.alert({
				message: ews ? "Az EWS szerver nem válaszol." : "Az alkalmazás nem válaszol.",
				buttons: {
					ok: {
						label: "Ok",
						className: "btn-outline-dark",
					},
				},
				callback: function (reusult) {},
			});
		}, 60 * 1000);

		loading_indices[message] = timeout_id;
	} else {
		$(".loading-overlay").addClass("d-none");

		if (message === null) clearTimeout();
		else {
			clearTimeout(loading_indices[message]);
			delete loading_indices[message];
		}

		if (message) console.log(moment().format(format) + ": '" + message + "' Done!");
		else console.log(moment().format(format) + ": Done!");
	}
}
