const rgbaToArrayRgb = (rgba) => {
	let sep = rgba.indexOf(",") > -1 ? "," : " ";
	let rgb = rgba.substr(5).split(")")[0].split(sep);

	return rgb;
};

const hasGoodContrast = (rgba1, rgba2) => {
	//ref https://www.w3.org/TR/AERT#color-contrast

	//convert to rgb array
	let rgb1 = rgbaToArrayRgb(rgba1);
	let rgb2 = rgbaToArrayRgb(rgba2);

	var colorBrightness1 = ((rgb1[0] * 299) + (rgb1[1] * 587) + (rgb1[2] * 114)) / 1000;
	var colorBrightness2 = ((rgb2[0] * 299) + (rgb2[1] * 587) + (rgb2[2] * 114)) / 1000;
	var brightnessDifference = Math.abs(colorBrightness2 - colorBrightness1);

	/*
	var colorDifference = (Math.max(rgb1[0], rgb2[0]) - Math.min(rgb1[0], rgb2[0])) +
				(Math.max(rgb1[1],rgb2[1]) - Math.min(rgb1[1], rgb2[1])) +
				(Math.max(rgb1[2], rgb2[2]) - Math.min(rgb1[2], rgb2[2]));
	*/

	//console.log("IsGoodContrast:" + hex1 + " - " + hex2 + " => BrightnessDiff(" + brightnessDifference + "), ColorDiff(" + colorDifference + ")");

	if (brightnessDifference > 150 /*&& colorDifference > 500*/)
		return true;
	else
		return false;
};

export const calculateForgroundColor = (rgbaColor) => {
	if (hasGoodContrast(rgbaColor, "rgba(0,0,0,1)"))
		return "rgba(0,0,0,1)";
	else
		return "rgba(255,255,255,1)";
};
