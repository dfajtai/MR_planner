function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}

function applySat(sat, hex) {
	var hash = hex.substring(0, 1) === "#";

	hex = (hash ? hex.substring(1) : hex).split("");

	var long = hex.length > 3,
		rgb = [],
		i = 0,
		len = 3;

	rgb.push(hex.shift() + (long ? hex.shift() : ""));
	rgb.push(hex.shift() + (long ? hex.shift() : ""));
	rgb.push(hex.shift() + (long ? hex.shift() : ""));

	for (; i < len; i++) {
		if (!long) {
			rgb[i] += rgb[i];
		}

		rgb[i] = Math.round((parseInt(rgb[i], 16) / 100) * sat).toString(16);

		rgb[i] += rgb[i].length === 1 ? rgb[i] : "";
	}

	return (hash ? "#" : "") + rgb.join("");
}
