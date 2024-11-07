export const getViewScaleText = (value) => {
	const scaleValue = Math.round(value / 10) / 10;

	let text = `${scaleValue}x`;

	if ((scaleValue % 1) === 0)
		text = `${scaleValue}.0x`;

	return text;
};
