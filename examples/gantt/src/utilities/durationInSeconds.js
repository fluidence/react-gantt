export const durationInSeconds = (startDate, endDate) => {
	return (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
};