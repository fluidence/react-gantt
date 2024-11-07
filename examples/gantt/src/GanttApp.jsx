// Imports needed for React.
import React, { useState, useEffect, useRef, useCallback } from "react";

// Imports for external components / functionality.
import Gantt from "@fluidence/react-gantt";

// Imports for our components / functionality.
import Select from "react-select";
import ganttData from "./data/ganttData.json";
import { useConstructor } from "./hooks/useConstructor.js";
import { getViewScaleText } from "./utilities/getViewScaleText.js";
import { durationInDaysHoursMinutes } from "./utilities/durationInDaysHoursMinutes.js";
import { DropdownMenu } from "./Components/DropdownMenu.jsx";

const localStorageKey = "GanttApp";

function GanttApp() {
	const columns = [
		{
			text: "Task Name",
			minWidth: 100,
			defaultWidth: 100
		},
		{
			text: "Start",
			minWidth: 100,
			defaultWidth: 100
		},
		{
			text: "End",
			minWidth: 100,
			defaultWidth: 100
		},
		{
			text: "Duration",
			minWidth: 100,
			defaultWidth: 100
		}
	];

	const ganttBarsColors = {
		"campaign": "#25b163", //green
		"batch": "#ff9d31", //orange
		"branch": "#8b781d", //brown
		"section": "#75bf00", //light green
		"procedure": "#67a6e3", //blue
		"operation": "#00b4c5" //turquoise
	};

	const detailLevels = [
		{ id: 1, name: "Campaign", enabled: true },
		{ id: 2, name: "Batch", enabled: true },
		{ id: 3, name: "Procedure", enabled: true },
		{ id: 4, name: "Operation", enabled: true },
	];

	const timeScaleOptions = {
		"HourTenmin":
		{
			name: "HourTenmin",
			displayName: "hour / ten min"
			// disabled: false
		},
		"DayHour":
		{
			name: "DayHour",
			displayName: "day / hour"
		},
		"WeekDay":
		{
			name: "WeekDay",
			displayName: "week / day"
		},
		"MonthWeek":
		{
			name: "MonthWeek",
			displayName: "month / week"
		},
		"YearMonth":
		{
			name: "YearMonth",
			displayName: "year / month"
		}
	};

	const initialState = {
		originalData: null,
		formattedData: [],
		showRelativeTime: false,

		columns: columns,

		maxHeight: 600,

		inputScalePosition: 0,
		viewScale: 100,
		timeScale: timeScaleOptions.WeekDay,

		showChartLegend: false,
		fitToWindow: true,

		detailLevels: [...detailLevels],

		loadingCompleted: false,

		showPrimaryGridlines: false,
		showSecondaryGridlines: false
	};

	const ganttInternalParametersRef = useRef({
		rowStatus: null,
		columnWidths: [],
		gridWidth: 400,
		scrollLeft: 0
	});

	useConstructor(() => {
		const retrieveStateFromLocalStorage = () => {
			const savedState = JSON.parse(localStorage.getItem(localStorageKey));

			if (typeof savedState !== "undefined" && savedState !== null) {
				// Return updated information to be able to update component status (both state and refs) at a later stage.
				return {
					columnWidths: savedState.columnWidths,
					rowStatus: savedState.rowStatus,
					gridWidth: savedState.gridWidth,
					scrollLeft: savedState.scrollLeft,
					timeScale: savedState.timeScale,
					viewScale: savedState.viewScale,
					inputScalePosition: savedState.inputScalePosition,
					fitToWindow: savedState.fitToWindow,
					showRelativeTime: savedState.showRelativeTime,
					showPrimaryGridlines: savedState.showPrimaryGridlines,
					showSecondaryGridlines: savedState.showSecondaryGridlines
				};
			}
		};

		const retrievedState = retrieveStateFromLocalStorage();

		// There is a relevant key in local storage but there might be a chance where not all of the settings have a value. Use the retrieved value for each setting only if there is one.
		if (typeof retrievedState !== "undefined" && retrievedState !== null) {
			if (typeof retrievedState.timeScale !== "undefined" && retrievedState.timeScale !== null)
				initialState.timeScale = retrievedState.timeScale;

			if (typeof retrievedState.viewScale !== "undefined" && retrievedState.viewScale !== null)
				initialState.viewScale = retrievedState.viewScale;

			if (typeof retrievedState.inputScalePosition !== "undefined" && retrievedState.inputScalePosition !== null)
				initialState.inputScalePosition = retrievedState.inputScalePosition;

			if (typeof retrievedState.fitToWindow !== "undefined" && retrievedState.fitToWindow !== null)
				initialState.fitToWindow = retrievedState.fitToWindow;

			if (typeof retrievedState.showRelativeTime !== "undefined" && retrievedState.showRelativeTime !== null)
				initialState.showRelativeTime = retrievedState.showRelativeTime;

			if (typeof retrievedState.showPrimaryGridlines !== "undefined" && retrievedState.showPrimaryGridlines !== null)
				initialState.showPrimaryGridlines = retrievedState.showPrimaryGridlines;

			if (typeof retrievedState.showSecondaryGridlines !== "undefined" && retrievedState.showSecondaryGridlines !== null)
				initialState.showSecondaryGridlines = retrievedState.showSecondaryGridlines;

			if (typeof retrievedState.columnWidths !== "undefined" && retrievedState.columnWidths !== null)
				ganttInternalParametersRef.current.columnWidths = retrievedState.columnWidths;

			if (typeof retrievedState.rowStatus !== "undefined" && retrievedState.rowStatus !== null)
				ganttInternalParametersRef.current.rowStatus = retrievedState.rowStatus;

			if (typeof retrievedState.gridWidth !== "undefined" && retrievedState.gridWidth !== null)
				ganttInternalParametersRef.current.gridWidth = retrievedState.gridWidth;

			if (typeof retrievedState.scrollLeft !== "undefined" && retrievedState.scrollLeft !== null)
				ganttInternalParametersRef.current.scrollLeft = retrievedState.scrollLeft;
		}
	});

	const [state, setState] = useState(initialState);
	const stateRef = useRef(state);
	stateRef.current = state;

	useEffect(() => {
		const saveToLocalStorage = () => {
			// Save to localstorage.
			localStorage.setItem(localStorageKey, JSON.stringify({
				columnWidths: ganttInternalParametersRef.current.columnWidths,
				rowStatus: ganttInternalParametersRef.current.rowStatus,
				gridWidth: ganttInternalParametersRef.current.gridWidth,
				timeScale: stateRef.current.timeScale,
				fitToWindow: stateRef.current.fitToWindow,
				viewScale: stateRef.current.viewScale,
				inputScalePosition: stateRef.current.inputScalePosition,
				scrollLeft: ganttInternalParametersRef.current.scrollLeft,
				showRelativeTime: stateRef.current.showRelativeTime,
				showPrimaryGridlines: stateRef.current.showPrimaryGridlines,
				showSecondaryGridlines: stateRef.current.showSecondaryGridlines,
			}));
		};

		const retrievedData = loadDataFromJson();
		const formattedData = formatData(retrievedData);

		setState(prevState => ({
			...prevState,
			originalData: retrievedData,
			formattedData: formattedData,
			loadingCompleted: true
		}));

		// When the page refreshes react doesn't have the chance to unmount the components as normal so we use the "beforeunload" event.
		window.addEventListener("beforeunload", saveToLocalStorage);

		return () => window.removeEventListener("beforeunload", saveToLocalStorage);
	}, []);

	// When this state property changes update Gantt accordingly.
	useEffect(() => {
		if (state.originalData !== null) {
			const formattedData = formatData(state.originalData);

			setState(prevState => ({
				...prevState,
				formattedData: formattedData
			}));
		}
	}, [state.showRelativeTime])

	const updateWidths = useCallback((widthInfo) => {
		ganttInternalParametersRef.current.columnWidths = widthInfo.columnWidths;
		ganttInternalParametersRef.current.gridWidth = widthInfo.gridWidth;
	}, []);

	const updateRowStatus = useCallback((rowStatus) => {
		ganttInternalParametersRef.current.rowStatus = rowStatus;
	}, []);

	const loadDataFromJson = () => {
		return ganttData;
	};

	const formatData = (retrievedData) => {
		let rowIdCounter = 1;
		let barIdCounter = 1;

		let formattedCampaigns = createCampaigns(retrievedData, rowIdCounter, barIdCounter);

		return formattedCampaigns;
	}

	const createCampaigns = (retrievedData, rowIdCounter, barIdCounter) => {
		let formattedCampaigns = [];
		const chartStartDate = retrievedData.chartStartDate ?? retrievedData.campaigns[0].startDate;

		retrievedData.campaigns.forEach(retrievedCampaign => {
			const start = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedCampaign.startDate)	// startText.
				: new Date(retrievedCampaign.startDate).toLocaleString()	// startDate.

			const end = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedCampaign.endDate)	// endText.
				: new Date(retrievedCampaign.endDate).toLocaleString()	// endDate.

			const duration = durationInDaysHoursMinutes(retrievedCampaign.startDate, retrievedCampaign.endDate);

			let campaignRow = {
				// Required properties that are used by the Gantt component.
				id: rowIdCounter++,
				bars: [],

				// Optional properties that are used by the Gantt component.
				gridValues: [retrievedCampaign.campaignName, start, end, duration],
				childRows: [],

				// Example specific properties.
				rowEntityType: "Campaign"
			};

			// Build a single bar for the above campaign.
			const campaignBar = {
				// Required properties that are used by the Gantt component.
				id: barIdCounter++,
				text: retrievedCampaign.campaignName,
				type: "Normal",	// type possible values: "Normal" (for lets say operations), "Background" (for lets say outages), "Overlay" (transparent - for lets say procedures).
				startDate: new Date(retrievedCampaign.startDate),
				endDate: new Date(retrievedCampaign.endDate),

				// Optional properties that are used by the Gantt component.
				barStyle: {
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "black",
					borderRadius: "3px",
					backgroundColor: ganttBarsColors.campaign
				},

				// Example specific properties.
				barEntityType: "Campaign",
				startText: durationInDaysHoursMinutes(chartStartDate, retrievedCampaign.startDate),
				endText: durationInDaysHoursMinutes(chartStartDate, retrievedCampaign.endDate)
			}

			campaignRow.bars.push(campaignBar);

			formattedCampaigns.push(campaignRow);

			// Keep in mind that if in the future this campaign row can be displayed in multiple rows that only the last row is allowed to have childRows.
			if (retrievedCampaign.batches !== undefined && retrievedCampaign.batches !== null && retrievedCampaign.batches.length > 0) {
				let { formattedBatches, rowId, barId } = createBatches(retrievedCampaign, rowIdCounter, barIdCounter, chartStartDate);

				campaignRow.childRows = campaignRow.childRows.concat(formattedBatches);
				rowIdCounter = rowId;
				barIdCounter = barId;
			}
		});

		return formattedCampaigns;
	}

	const createBatches = (retrievedCampaign, rowIdCounter, barIdCounter, chartStartDate) => {
		let formattedBatches = [];

		for (let batchIndex = 0; batchIndex < retrievedCampaign.batches.length; batchIndex++) {
			let retrievedBatch = retrievedCampaign.batches[batchIndex];	// Every batch is displayed in a single line like in a proper gantt chart.

			const start = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedBatch.startDate)	// startText.
				: new Date(retrievedBatch.startDate).toLocaleString()	// startDate.

			const end = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedBatch.endDate)	// endText.
				: new Date(retrievedBatch.endDate).toLocaleString()	// endDate.

			const duration = durationInDaysHoursMinutes(retrievedBatch.startDate, retrievedBatch.endDate);

			let batchRow = {
				// Required properties that are used by the Gantt component.
				id: rowIdCounter++,
				bars: [],

				// Optional properties that are used by the Gantt component.
				gridValues: [retrievedBatch.batchName, start, end, duration],
				childRows: [],

				// Example specific properties.
				rowEntityType: "Batch"
			};

			// Build a single bar for the above batch.
			const batchBar = {
				// Required properties that are used by the Gantt component.
				id: barIdCounter++,
				text: retrievedBatch.batchName,
				type: "Normal",	// type possible values: "Normal" (for lets say operations), "Background" (for lets say outages), "Overlay" (transparent - for lets say procedures).
				startDate: new Date(retrievedBatch.startDate),
				endDate: new Date(retrievedBatch.endDate),

				// Optional properties that are used by the Gantt component.
				barStyle: {
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "black",
					borderRadius: "3px",
					backgroundColor: ganttBarsColors.batch
				},

				// Example specific properties.
				barEntityType: "Batch",
				startText: durationInDaysHoursMinutes(chartStartDate, retrievedBatch.startDate),
				endText: durationInDaysHoursMinutes(chartStartDate, retrievedBatch.endDate)
			};

			batchRow.bars.push(batchBar);

			formattedBatches.push(batchRow);

			// Keep in mind that if in the future this batch row can be displayed in multiple rows that only the last row is allowed to have childRows.
			if (retrievedBatch.branches !== undefined && retrievedBatch.branches !== null && retrievedBatch.branches.length > 0) {

				for (let branchIndex = 0; branchIndex < retrievedBatch.branches.length; branchIndex++) {
					let retrievedBranch = retrievedBatch.branches[branchIndex]; // Every branch is displayed in a single line like in a proper gantt chart.

					// Keep in mind that if in the future this batch row can be displayed in multiple rows that only the last row is allowed to have childRows.
					if (retrievedBranch.sections !== undefined && retrievedBranch.sections !== null && retrievedBranch.sections.length > 0) {

						for (let sectionIndex = 0; sectionIndex < retrievedBranch.sections.length; sectionIndex++) {
							let retrievedSection = retrievedBranch.sections[sectionIndex];	// Every section is displayed in a single line like in a proper gantt chart.

							// Keep in mind that if in the future this section row can be displayed in multiple rows that only the last row is allowed to have childRows.
							if (retrievedSection.procEntries !== undefined && retrievedSection.procEntries !== null && retrievedSection.procEntries.length > 0) {
								let { formattedProcedures, rowId, barId } = createProcedures(retrievedSection, rowIdCounter, barIdCounter, chartStartDate);

								batchRow.childRows = batchRow.childRows.concat(formattedProcedures);
								rowIdCounter = rowId;
								barIdCounter = barId;
							}
						}
					}
				}
			}
		}

		return {
			formattedBatches,
			rowId: rowIdCounter,
			barId: barIdCounter
		};
	};

	const createProcedures = (retrievedSection, rowIdCounter, barIdCounter, chartStartDate) => {
		let formattedProcedures = [];

		for (let procedureIndex = 0; procedureIndex < retrievedSection.procEntries.length; procedureIndex++) {
			let retrievedProcedure = retrievedSection.procEntries[procedureIndex];	// Every procedure is displayed in a single line like in a proper gantt chart.

			const start = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedProcedure.startDate)	// startText.
				: new Date(retrievedProcedure.startDate).toLocaleString()	// startDate.

			const end = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedProcedure.endDate)	// endText.
				: new Date(retrievedProcedure.endDate).toLocaleString()	// endDate.

			const duration = durationInDaysHoursMinutes(retrievedProcedure.startDate, retrievedProcedure.endDate);

			let procedureRow = {
				// Required properties that are used by the Gantt component.
				id: rowIdCounter++,
				bars: [],

				// Optional properties that are used by the Gantt component.
				gridValues: [retrievedProcedure.procedureName, start, end, duration],
				childRows: [],

				// Example specific properties.
				rowEntityType: "Procedure"
			};

			// Build a single bar for the above procedure.
			const prodecureBar = {
				// Required properties that are used by the Gantt component.
				id: barIdCounter++,
				text: retrievedProcedure.procedureName,
				type: "Normal",	// type possible values: "Normal" (for lets say operations), "Background" (for lets say outages), "Overlay" (transparent - for lets say procedures).
				startDate: new Date(retrievedProcedure.startDate),
				endDate: new Date(retrievedProcedure.endDate),

				// Optional properties that are used by the Gantt component.
				barStyle: {
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "black",
					borderRadius: "3px",
					backgroundColor: ganttBarsColors.procedure,
				},

				// Example specific properties.
				barEntityType: "Procedure",
				startText: durationInDaysHoursMinutes(chartStartDate, retrievedProcedure.startDate),
				endText: durationInDaysHoursMinutes(chartStartDate, retrievedProcedure.endDate)
			};

			procedureRow.bars.push(prodecureBar);

			formattedProcedures.push(procedureRow);

			// Keep in mind that if in the future this procedure row can be displayed in multiple rows that only the last row is allowed to have childRows.
			if (retrievedProcedure.latestPlannedAndTrackedOpEntries !== undefined && retrievedProcedure.latestPlannedAndTrackedOpEntries !== null && retrievedProcedure.latestPlannedAndTrackedOpEntries.length > 0) {
				let { formattedOperations, rowId, barId } = createOperations(retrievedProcedure, rowIdCounter, barIdCounter, chartStartDate);

				procedureRow.childRows = procedureRow.childRows.concat(formattedOperations);
				rowIdCounter = rowId;
				barIdCounter = barId;
			}
		}

		return {
			formattedProcedures,
			rowId: rowIdCounter,
			barId: barIdCounter
		};
	};

	const createOperations = (retrievedProcedure, rowIdCounter, barIdCounter, chartStartDate) => {
		let formattedOperations = [];

		for (let operationIndex = 0; operationIndex < retrievedProcedure.latestPlannedAndTrackedOpEntries.length; operationIndex++) {
			let retrievedOperation = retrievedProcedure.latestPlannedAndTrackedOpEntries[operationIndex];	// Every operation is displayed in a single line like in a proper gantt chart.

			const start = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedOperation.startDate)	// startText.
				: new Date(retrievedOperation.startDate).toLocaleString()	// startDate.

			const end = state.showRelativeTime
				? durationInDaysHoursMinutes(chartStartDate, retrievedOperation.endDate)	// endText.
				: new Date(retrievedOperation.endDate).toLocaleString()	// endDate.

			const duration = durationInDaysHoursMinutes(retrievedOperation.startDate, retrievedOperation.endDate);

			let operationRow = {
				// Required properties that are used by the Gantt component.
				id: rowIdCounter++,
				bars: [],

				// Optional properties that are used by the Gantt component.
				gridValues: [retrievedOperation.operationName, start, end, duration],
				childRows: [],

				// Example specific properties.
				rowEntityType: "Operation"
			};

			// Build a single bar for the above operation.
			const operationBar = {
				// Required properties that are used by the Gantt component.
				id: barIdCounter++,
				text: retrievedOperation.operationName,
				type: "Normal",	// type possible values: "Normal" (for lets say operations), "Background" (for lets say outages), "Overlay" (transparent - for lets say procedures).
				startDate: new Date(retrievedOperation.startDate),
				endDate: new Date(retrievedOperation.endDate),

				// Optional properties that are used by the Gantt component.
				barStyle: {
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "black",
					borderRadius: "3px",
					backgroundColor: ganttBarsColors.operation,
				},

				// Example specific properties.
				barEntityType: "Operation",
				startText: durationInDaysHoursMinutes(chartStartDate, retrievedOperation.startDate),
				endText: durationInDaysHoursMinutes(chartStartDate, retrievedOperation.endDate)
			};

			operationRow.bars.push(operationBar);

			formattedOperations.push(operationRow);

			// Operations currently do not have any childRows.
		}

		return {
			formattedOperations,
			rowId: rowIdCounter,
			barId: barIdCounter
		};
	};

	const handleBarClick = useCallback((barClickInfo) => {
		// Add your own implementation here...
	}, []);

	const handleDetailLevelChange = (detailLevel) => {
		const types = state.detailLevels.filter((level) => level.id < detailLevel.id).map((item) => item.name.toLowerCase());

		const getRowStatus = (data) => {
			let rowStatus = {};

			for (let row of data) {
				let isExpanded = types.includes(row.rowEntityType.toLowerCase());
				rowStatus[row.id] = { isExpanded: isExpanded };
				rowStatus = { ...rowStatus, ...getRowStatus(row.childRows) };
			}

			return rowStatus;
		};

		const rowStatusLocal = getRowStatus(state.formattedData);

		ganttInternalParametersRef.current.rowStatus = rowStatusLocal;
		// force update
		setState((prevState) => ({
			...prevState
		}));
	};

	const handleBarRightClick = useCallback((barRightClickInfo) => {
		barRightClickInfo.event.preventDefault();

		// Add your own implementation here...
	}, []);

	const handleBarDrop = (dropInfo) => {
		// Add your own implementation here...
	};

	const handleShowPrimaryGridlines = () => {
		const showPrimaryGridlines = !state.showPrimaryGridlines;

		setState(prevState => ({
			...prevState,
			showPrimaryGridlines: showPrimaryGridlines
		}));
	};

	const handleShowSecondaryGridlines = () => {
		const showSecondaryGridlines = !state.showSecondaryGridlines;

		setState(prevState => ({
			...prevState,
			showSecondaryGridlines: showSecondaryGridlines
		}));
	};

	const handleShowRelativeTime = () => {
		setState(prevState => ({
			...prevState,
			showRelativeTime: !state.showRelativeTime
		}));
	};

	const selectChartClass = () => {
		let ganttChartClass = "";

		if (state.showChartLegend)
			ganttChartClass = "gantt-chart";
		else
			ganttChartClass = "gantt-chart-without-legend";

		return ganttChartClass;
	};

	const changeScalePercentage = event => {
		const position = +event.target.value;
		const minValue = Math.log2(100);
		const maxValue = Math.log2(10000);

		// Calculate adjustment factor
		const scale = (maxValue - minValue) / 100;
		const value = Math.ceil(Math.pow(2, minValue + scale * position));

		if (!state.fitToWindow && !isNaN(value) && value !== state.viewScale) {
			setState((prevState) => ({
				...prevState,
				inputScalePosition: position,
				viewScale: value
			}));
		}
	};

	const handleFitToWindow = () => {
		setState(prevState => ({
			...prevState,
			fitToWindow: !state.fitToWindow
		}));
	};

	const updateScrollLeft = useCallback((scrollLeft) => {
		ganttInternalParametersRef.current.scrollLeft = scrollLeft;
	}, []);

	return (
		<React.Fragment>
			{/* Gantt chart page. */}
			{state.loadingCompleted && state.formattedData.length > 0 &&
				<div style={{ height: '800px' }}>
					{/* Header. */}
					{/* Menus. */}
					<div style={{ paddingBottom: "10px", display: "flex", alignItems: "center", justifyContent: 'space-between' }}>

					</div>
					<div className="page-menu">
						<div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>

							<div style={{ display: "flex", paddingLeft: "10px" }}>
								{/* Show Detail level */}
								<div style={{ width: "100px" }}>
									<div style={{ fontSize: "1.4rem", cursor: "pointer", marginLeft: "10px", marginTop: "10px" }}>
										<DropdownMenu
											caption="Detail Level"
											contents={state.detailLevels}
											handleDropdownMenuItemClick={handleDetailLevelChange}
										/>
									</div>
								</div>

								{/* Use relative time */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showRelativeTime} onChange={() => { }} />
									<label onClick={handleShowRelativeTime}>Show relative time</label>
								</div>
							</div>

							<div style={{ display: "flex", paddingRight: "10px" }}>
								{/* Show Primary grid gridlines */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showPrimaryGridlines} onChange={() => { }} />
									<label onClick={handleShowPrimaryGridlines}>Primary gridlines</label>
								</div>

								{/* Show Secondary grid gridlines */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showSecondaryGridlines} onChange={() => { }} />
									<label onClick={handleShowSecondaryGridlines}>Secondary gridlines</label>
								</div>

								{/* Fit to window */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.fitToWindow} onChange={() => { }} />
									<label onClick={handleFitToWindow}>Fit to window</label>
								</div>

								{/* Scale */}
								<div className="label-generic-control-aligned-center"
									style={{ display: "flex", marginLeft: "10px", alignItems: 'end' }}>
									<label>Scale:
										<input
											style={{ marginLeft: "5px", width: "80px" }}
											type="range"
											min={0}
											max={100}
											onChange={changeScalePercentage}
											value={state.inputScalePosition}
											disabled={state.fitToWindow}
										/>
										<span style={{ marginLeft: "5px", width: "40px" }}>{getViewScaleText(state.viewScale)}</span>
									</label>
								</div>

								{/* Header interval */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<label>Header interval:</label>

									<Select
										name="selectHeaderInterval"
										styles={{
											control: (baseStyles, state) => ({
												...baseStyles,
												width: "150px"
											}),
											option: (styles, { isDisabled, isFocused, isSelected }) => ({
												...styles,
												backgroundColor: isDisabled
													? undefined
													: isSelected
														? "rgb(255, 153, 51)"
														: isFocused
															? "rgba(255, 153, 51, 0.5)"
															: undefined,
												color: isDisabled
													? '#ccc'
													: isSelected
														? 'white' : 'black',
												cursor: isDisabled ? 'not-allowed' : 'default',

												':active': {
													...styles[':active'],
													backgroundColor: !isDisabled
														? isSelected
															? "rgb(255, 153, 51)"
															: "rgba(255, 153, 51, 0.3)"
														: undefined,
												}
											})
										}}

										isDisabled={state.fitToWindow}

										value={{
											value: state.timeScale.name,
											label: state.timeScale.displayName
										}}

										options={Object.keys(timeScaleOptions).map((key, index) => {
											return {
												value: timeScaleOptions[key].name,
												label: timeScaleOptions[key].displayName
											}
										})}

										onChange={(intervalOption) => {
											const headerIntervalPairLocal = {
												name: intervalOption.value,
												displayName: intervalOption.label
											};

											setState(prevState => ({
												...prevState,
												timeScale: headerIntervalPairLocal
											}));
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Contents. */}
					<div className="page-body-container">
						<div className={selectChartClass()}>
							<Gantt
								data={state.formattedData}

								showRelativeTime={state.showRelativeTime}

								columns={state.columns}
								widths={{
									columnWidths: ganttInternalParametersRef.current.columnWidths,
									gridWidth: ganttInternalParametersRef.current.gridWidth
								}}
								updateWidths={updateWidths}
								rowStatus={ganttInternalParametersRef.current.rowStatus}
								updateRowStatus={updateRowStatus}

								maxHeight={state.maxHeight}
								scrollLeft={ganttInternalParametersRef.current.scrollLeft}
								updateScrollLeft={updateScrollLeft}

								viewScale={state.viewScale}
								fitToWindow={state.fitToWindow}
								timeScale={state.timeScale.name}
								showPrimaryGridlines={state.showPrimaryGridlines}
								showSecondaryGridlines={state.showSecondaryGridlines}

								handleBarClick={handleBarClick}
								handleBarRightClick={handleBarRightClick}
								handleBarDrop={handleBarDrop}
							/>
						</div>

						{state.showChartLegend &&
							<div className="gantt-legend">
							</div>
						}
					</div>

					{/* Footer. */}
					<div className="page-footer" style={{ width: "1fr" }}>
						© Fluidence 2024
					</div>
				</div>
			}

			{state.formattedData.length === 0 &&
				<div className="page-header" style={{ width: "1fr" }}>
					<h1 style={{ textAlign: "center" }}>Gantt</h1>
					<div style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: "semi-bold" }}>No Gantt Data found</div>
				</div>
			}
		</React.Fragment>
	);
}

export default GanttApp;
