var idleConter = 0;
var idleInterval = null;

var serversideProtectionInterval = null;

function startIncativityTimer() {
	idleConter = 0;
	if (idleInterval != null) clearInterval(idleInterval);

	idleInterval = setInterval(inactivityLogout, 5 * 1000); // 5 second

	// Zero the idle timer on mouse movement.
	$(this).mousemove(function (e) {
		idleConter = 0;
	});
	$(this).keypress(function (e) {
		idleConter = 0;
	});
}

function inactivityLogout() {
	idleConter = idleConter + 1;
	if (idleConter > 120) {
		// 10 minutes
		clearInterval(idleInterval);

		$.ajax({
			type: "GET",
			url: "php/forced_logout.php",
			dataType: "json",
			data: { logout: true },
			success: function (result) {
				bootbox.alert({
					message: result,
					buttons: {
						ok: {
							label: "Ok",
							className: "btn-outline-dark",
						},
					},
					callback: function () {
						var searchParams = new URLSearchParams(window.location.search);
						var newRelativePathQuery = "index.php" + "?" + searchParams.toString();
						window.location = newRelativePathQuery;
					},
				});
			},
		});
	}
}

function start_session_check_timer() {
	if (serversideProtectionInterval != null) clearInterval(serversideProtectionInterval);

	serversideProtectionInterval = setInterval(session_check, 60 * 1000); // 1 minute
}

function session_check() {
	$.ajax({
		type: "GET",
		url: "php/session_protection.php",
		dataType: "json",
		data: { session_protection: true },
		success: function (result) {
			var server_message = server_response_message_parser(result);
			if (server_message) {
				clearInterval(serversideProtectionInterval);
				logout_with_message(server_message);
			}
		},
	});
}

function server_response_message_parser(result) {
	if (typeof result === "string" || result instanceof String) {
		if (result.includes("[SERVER MESSAGE]")) {
			var valid_server_messages = ["[SERVER MESSAGE] Session expired due to inactivity.", "[SERVER MESSAGE] Session expired."];

			if (valid_server_messages.includes(result)) {
				return result.replace("[SERVER MESSAGE] ", "");
			}
		}
	}
}

function logout_with_message(message) {
	bootbox.alert({
		message: message,
		buttons: {
			ok: {
				label: "Ok",
				className: "btn-outline-dark",
			},
		},
		callback: function () {
			var searchParams = new URLSearchParams(window.location.search);
			var newRelativePathQuery = "index.php" + "?" + searchParams.toString();
			window.location = newRelativePathQuery;
		},
	});
}
