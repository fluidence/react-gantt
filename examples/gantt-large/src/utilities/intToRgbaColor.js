export const intToRgbaColor = (num) => {
	num >>>= 0;

	var b = num & 0xff,
		g = (num & 0xff00) >>> 8,
		r = (num & 0xff0000) >>> 16,
		a = ((num & 0xff000000) >>> 24) / 255;

	return "rgba(" + [r, g, b, a].join(",") + ")";
};
