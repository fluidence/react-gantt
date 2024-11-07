export const durationInDaysHoursMinutes = (startDate, endDate) => {
	const allSeconds = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
	const days = Math.floor(allSeconds / 86400);
	const hours = Math.floor(allSeconds % 86400 / 3600);
	const minutes = Math.floor(allSeconds % 86400 % 3600 / 60);

	return `${days} d, ${hours} h, ${minutes} m`;
};
