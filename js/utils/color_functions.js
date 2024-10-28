function rgbToCmyk(r, g, b) {
	// Normalize RGB values to a range of 0 to 1
	let rNorm = r / 255;
	let gNorm = g / 255;
	let bNorm = b / 255;

	// Calculate the CMY values
	let k = 1 - Math.max(rNorm, gNorm, bNorm);
	let c = (1 - rNorm - k) / (1 - k) || 0;
	let m = (1 - gNorm - k) / (1 - k) || 0;
	let y = (1 - bNorm - k) / (1 - k) || 0;

	// Convert CMYK values to 0-100% for easier handling
	return {
		c: Math.round(c * 100),
		m: Math.round(m * 100),
		y: Math.round(y * 100),
		k: Math.round(k * 100),
	};
}

function desaturateCmyk(cmyk, percent) {
	return {
		c: Math.round(cmyk.c * (1 - percent)),
		m: Math.round(cmyk.m * (1 - percent)),
		y: Math.round(cmyk.y * (1 - percent)),
		k: cmyk.k, // Leave black unchanged for readability
	};
}

function cmykToRgb(c, m, y, k) {
	// Normalize CMYK values from 0-100% to 0-1
	let cNorm = c / 100;
	let mNorm = m / 100;
	let yNorm = y / 100;
	let kNorm = k / 100;

	// Calculate the RGB values
	let r = 255 * (1 - cNorm) * (1 - kNorm);
	let g = 255 * (1 - mNorm) * (1 - kNorm);
	let b = 255 * (1 - yNorm) * (1 - kNorm);

	return {
		r: Math.round(r),
		g: Math.round(g),
		b: Math.round(b),
	};
}
