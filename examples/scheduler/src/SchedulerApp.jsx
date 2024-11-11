// Imports needed for React.
import React, { useState, useEffect, useRef, useCallback } from "react";

// Imports for external components / functionality.
import Select from "react-select";

// Imports for our components / functionality.
import Gantt from '@fluidence/react-gantt';
import data from "./data/eocData.json";
import { useConstructor } from "./hooks/useConstructor.js";
import { getViewScaleText } from "./utilities/getViewScaleText.js";
import { intToRgbaColor } from "./utilities/intToRgbaColor.js";
import { calculateForgroundColor } from "./utilities/calculateForgroundColor.js";

const localStorageKey = "SchedulerApp";

function SchedulerApp() {
	const ganttRef = useRef(null);

	const barHeight = 35;
	const rowVerticalPadding = 8;

	const columns = [
		{
			text: "Equipment/Staff",
			minWidth: 100,
			defaultWidth: 100
		}
	];

	const chartColorsBy = [
		{ id: 1, name: "Campaign", value: "campaignColor" },
		{ id: 2, name: "Batch", value: "batchColor" }
	];

	const dragEntityTypes = {
		Procedure: "Procedure",
		Operation: "Operation"
	};

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
		columns: columns,
		showRelativeTime: false,

		originalData: null,
		formattedData: [],
		arrows: [],

		maxHeight: 600,

		inputScalePosition: 0,
		viewScale: 100,
		timeScale: timeScaleOptions.WeekDay,

		showChartLegend: false,
		showOverlay: false,
		showArrows: false,
		fitToWindow: true,

		loadingCompleted: false,

		chartColorsBy: chartColorsBy,
		selectedChartColorBy: chartColorsBy[0],

		dragEntityTypes: dragEntityTypes,

		showPrimaryGridlines: false,
		showSecondaryGridlines: false
	};

	const ganttInternalParametersRef = useRef({
		rowStatus: {},
		columnWidths: [],
		gridWidth: 500,
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
					timeScale: savedState.timeScale,
					viewScale: savedState.viewScale,
					inputScalePosition: savedState.inputScalePosition,
					showOverlay: savedState.showOverlay,
					fitToWindow: savedState.fitToWindow,
					showArrows: savedState.showArrows,
					selectedChartColorBy: savedState.selectedChartColorBy,
					showChartLegend: savedState.showChartLegend,
					scrollLeft: savedState.scrollLeft,
					showRelativeTime: savedState.showRelativeTime,
					showPrimaryGridlines: savedState.showPrimaryGridlines,
					showSecondaryGridlines: savedState.showSecondaryGridlines,
				};
			}
		};

		const retrievedState = retrieveStateFromLocalStorage();

		// There is a relevant key in local storage but there might be a chance where not all of the settings have a value. Use the retrieved value for each setting only if there is one.
		if (typeof retrievedState !== "undefined" && retrievedState !== null) {
			if (typeof retrievedState.timeScale !== "undefined" && retrievedState.timeScale !== null)
				initialState.timeScale = retrievedState.timeScale;

			if (typeof retrievedState.fitToWindow !== "undefined" && retrievedState.fitToWindow !== null)
				initialState.fitToWindow = retrievedState.fitToWindow;

			if (typeof retrievedState.viewScale !== "undefined" && retrievedState.viewScale !== null)
				initialState.viewScale = retrievedState.viewScale;

			if (typeof retrievedState.inputScalePosition !== "undefined" && retrievedState.inputScalePosition !== null)
				initialState.inputScalePosition = retrievedState.inputScalePosition;

			if (typeof retrievedState.showOverlay !== "undefined" && retrievedState.showOverlay !== null)
				initialState.showOverlay = retrievedState.showOverlay;

			if (typeof retrievedState.showArrows !== "undefined" && retrievedState.showArrows !== null)
				initialState.showArrows = retrievedState.showArrows;

			if (typeof retrievedState.selectedChartColorBy !== "undefined" && retrievedState.selectedChartColorBy !== null)
				initialState.selectedChartColorBy = retrievedState.selectedChartColorBy;

			if (typeof retrievedState.showChartLegend !== "undefined" && retrievedState.showChartLegend !== null)
				initialState.showChartLegend = retrievedState.showChartLegend;

			if (typeof retrievedState.showRelativeTime !== "undefined" && retrievedState.showRelativeTime !== null)
				initialState.showRelativeTime = retrievedState.showRelativeTime;

			if (typeof retrievedState.showPrimaryGridlines !== "undefined" && retrievedState.showPrimaryGridlines !== null)
				initialState.showPrimaryGridlines = retrievedState.showPrimaryGridlines;

			if (typeof retrievedState.showSecondaryGridlines !== "undefined" && retrievedState.showSecondaryGridlines !== null)
				initialState.showSecondaryGridlines = retrievedState.showSecondaryGridlines;

			if (typeof retrievedState.columnWidths !== "undefined" && retrievedState.columnWidths !== null)
				ganttInternalParametersRef.current.columnWidths = retrievedState.columnWidths;

			if (typeof retrievedState.gridWidth !== "undefined" && retrievedState.gridWidth !== null)
				ganttInternalParametersRef.current.gridWidth = retrievedState.gridWidth;

			if (typeof retrievedState.rowStatus !== "undefined" && retrievedState.rowStatus !== null)
				ganttInternalParametersRef.current.rowStatus = retrievedState.rowStatus;

			if (typeof retrievedState.scrollLeft !== "undefined" && retrievedState.scrollLeft !== null)
				ganttInternalParametersRef.current.scrollLeft = retrievedState.scrollLeft;
		}
	});

	const [state, setState] = useState(initialState);
	const stateRef = useRef();
	stateRef.current = state;

	useEffect(() => {
		const saveStateToLocalStorage = () => {
			localStorage.setItem(localStorageKey, JSON.stringify({
				columnWidths: ganttInternalParametersRef.current.columnWidths,
				rowStatus: ganttInternalParametersRef.current.rowStatus,
				gridWidth: ganttInternalParametersRef.current.gridWidth,
				timeScale: stateRef.current.timeScale,
				fitToWindow: stateRef.current.fitToWindow,
				viewScale: stateRef.current.viewScale,
				inputScalePosition: stateRef.current.inputScalePosition,
				showOverlay: stateRef.current.showOverlay,
				showArrows: stateRef.current.showArrows,
				selectedChartColorBy: stateRef.current.selectedChartColorBy,
				showChartLegend: stateRef.current.showChartLegend,
				scrollLeft: ganttInternalParametersRef.current.scrollLeft,
				showRelativeTime: stateRef.current.showRelativeTime,
				showPrimaryGridlines: stateRef.current.showPrimaryGridlines,
				showSecondaryGridlines: stateRef.current.showSecondaryGridlines,
			})
			);
		};

		let retrievedData = loadDataFromJson();
		applyRetrievedData(retrievedData);

		// When the page refreshes react doesn't have the chance to unmount the components as normal so we use the "beforeunload" event.
		window.addEventListener("beforeunload", saveStateToLocalStorage);

		return () => window.removeEventListener("beforeunload", saveStateToLocalStorage);
	}, []);

	const applyRetrievedData = (retrievedData) => {
		let { formattedData, arrows } = createChartData(retrievedData, state.showOverlay, state.showArrows, state.selectedChartColorBy);

		setState(prevState => ({
			...prevState,
			originalData: retrievedData,
			formattedData: formattedData,
			arrows: arrows,
			loadingCompleted: true
		}));
	}

	const updateRowStatus = useCallback((rowStatus) => {
		ganttInternalParametersRef.current.rowStatus = rowStatus;
	}, []);

	const updateWidths = useCallback((widthInfo) => {
		ganttInternalParametersRef.current.columnWidths = widthInfo.columnWidths;
		ganttInternalParametersRef.current.gridWidth = widthInfo.gridWidth;
	}, []);

	const loadDataFromJson = () => {
		return data;
	};

	const createChartData = (retrievedData, showOverlay, showArrows, selectedChartColorBy) => {
		let formattedData = [];
		let rowIdCounter = 1;
		let barIdCounter = 1;

		// Create equipment rows.
		let { formattedEquipment, lastEquipmentRowId, lastEquipmentBarId, rawArrowsData } = createEquipmentRows(
			retrievedData.equipment,
			rowIdCounter,
			barIdCounter,
			showOverlay,
			selectedChartColorBy);
		formattedData = formattedData.concat(formattedEquipment)
		rowIdCounter = lastEquipmentRowId;
		barIdCounter = lastEquipmentBarId;

		// Create arrows.
		const arrows = showArrows === true
			? createArrows(rawArrowsData)
			: [];

		// Create staff rows.
		let { formattedStaff, lastStaffRowId, lastStaffBarId } = createStaffRows(retrievedData.staff, rowIdCounter, barIdCounter, showOverlay, selectedChartColorBy);
		formattedData = formattedData.concat(formattedStaff);

		return {
			formattedData,
			arrows
		};
	}

	const createEquipmentRows = (allEquipment, rowIdCounter, barIdCounter, showOverlay, selectedChartColorBy) => {
		let formattedEquipment = [];
		let rawArrowsData = [];

		// Create equipment rows.
		for (let equipIndex = 0; equipIndex < allEquipment.length; equipIndex++) {
			let retrievedEquipment = allEquipment[equipIndex];
			let equipmentRowsRequired = retrievedEquipment.rowsRequired === undefined || retrievedEquipment.rowsRequired === null
				? 1
				: retrievedEquipment.rowsRequired;

			// Build that many rows for this equipment.
			for (var rowIndex = 0; rowIndex < equipmentRowsRequired; rowIndex++) {
				let resource;

				if (rowIndex === 0)
					resource = retrievedEquipment.equipmentName;
				else if (retrievedEquipment.isConflicted)
					resource = "!";
				else
					resource = "";

				// Eoc rows do not have childRows.
				let equipmentRow = {
					// Required properties that are used by the Gantt component.
					id: rowIdCounter++,
					bars: [],

					// Optional properties that are used by the Gantt component.
					gridValues: [resource],

					// Example specific properties.
					rowEntityId: retrievedEquipment.equipmentId,
					rowEntityType: "Equipment"
				};

				// Create bars for procedures.
				for (var proIndex = 0; proIndex < retrievedEquipment.procEntryTasks.length; proIndex++) {
					let retrievedProcedure = retrievedEquipment.procEntryTasks[proIndex];
					let barRow = retrievedProcedure.row === undefined || retrievedProcedure.row === null
						? 1
						: retrievedProcedure.row;

					const backgroundColor = intToRgbaColor(retrievedProcedure.opEntryTasks[0][selectedChartColorBy.value]);
					let color = calculateForgroundColor(backgroundColor);

					if (retrievedProcedure.opEntryTasks.some(opEntryTask => opEntryTask.breaks.length > 0))
						color = "rgb(0,0,0)";

					// This procedure bar goes to the current row.
					if (barRow === rowIndex + 1) {
						// Always create bars for the operations inside this procedure.
						let { bars, counter, opEntryTasksRawArrowsData } = createOperationBars(
							retrievedProcedure.opEntryTasks, barIdCounter, rowIndex + 1, !showOverlay, selectedChartColorBy, false);
						barIdCounter = counter;

						equipmentRow.bars = equipmentRow.bars.concat(bars);	// Add operation bars to the current row.
						rawArrowsData = rawArrowsData.concat(opEntryTasksRawArrowsData);

						// Create a bar for this procedure only when user wants to "Show Overlay".
						const procedureBar = {
							// Required properties that are used by the Gantt component.
							id: barIdCounter++,
							text: showOverlay ? retrievedProcedure.procedureName : "",
							type: "Overlay",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
							startDate: retrievedProcedure.startDate,
							endDate: retrievedProcedure.endDate,

							// Optional properties that are used by the Gantt component.
							isDraggable: true,
							barStyle: {
								// https://stackoverflow.com/questions/17389815/css-dotted-border-bug
								borderWidth: 2,
								borderStyle: "dotted",
								borderColor: "blue",
								borderRadius: "3px",
								backgroundColor: "transparent",
								color: color
							},

							// Example specific properties.
							barEntityId: retrievedProcedure.procedureId,
							barEntityType: "Procedure"
						};

						equipmentRow.bars.push(procedureBar);

						if (retrievedProcedure.conflictIndexes !== null && retrievedProcedure.conflictIndexes.length > 0) {
							const procedureBar = {
								// Required properties that are used by the Gantt component.
								id: barIdCounter++,
								text: "",
								type: "Overlay",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
								startDate: retrievedProcedure.startDate,
								endDate: retrievedProcedure.endDate,

								// Optional properties that are used by the Gantt component.
								isDraggable: true,
								barStyle: {
									// https://stackoverflow.com/questions/17389815/css-dotted-border-bug
									borderWidth: 2,
									borderStyle: "dotted",
									borderColor: "red",
									borderRadius: "3px",
									backgroundColor: "transparent",
									color: color
								},

								// Example specific properties.
								barEntityId: retrievedProcedure.procedureId,
								barEntityType: "Procedure"
							};

							equipmentRow.bars.push(procedureBar);
						}
					}
				}

				// Always create bars for stand-alone operations.
				let { bars, counter, opEntryTasksRawArrowsData } = createOperationBars(retrievedEquipment.opEntryTasks, barIdCounter, rowIndex + 1, true, selectedChartColorBy, true);

				barIdCounter = counter;
				equipmentRow.bars = equipmentRow.bars.concat(bars);

				// Always create bars for outages.
				for (let outIndex = 0; outIndex < retrievedEquipment.outages.length; outIndex++) {
					let retrievedOutage = retrievedEquipment.outages[outIndex];

					const outageBar = {
						// Required properties that are used by the Gantt component.
						id: barIdCounter++,
						text: "",
						type: "Backdrop",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
						startDate: retrievedOutage.startDate,
						endDate: retrievedOutage.endDate,
						//description: retrievedOutage.description,

						// Optional properties that are used by the Gantt component.
						barStyle: {
							borderWidth: 0,
							borderStyle: "solid",
							borderColor: "gray",
							borderRadius: "0px",
							backgroundColor: "rgb(190,190,190)"
						},

						// Example specific properties.
						barEntityType: "Outage"
					};

					equipmentRow.bars.push(outageBar);
				}

				formattedEquipment.push(equipmentRow);
				rawArrowsData = rawArrowsData.concat(opEntryTasksRawArrowsData);
			}
		}

		const equipmentRowDic = {};
		allEquipment.forEach((equipment) => {
			formattedEquipment.forEach((row, index) => {
				if (row.rowEntityId === equipment.equipmentId) {
					const rowValue = {
						"rowId": row.id,
						"rowIndex": index
					};
					equipmentRowDic[equipment.equipmentId] = rowValue;
				}
			});
		});

		allEquipment.forEach((equipment) => {
			equipment.procEntryTasks.forEach(procEntryTask => {

				// Convert equipment pool ds to row ids
				const droppableRowIds = new Set();
				procEntryTask.equipmentPoolIds.forEach(id =>
					droppableRowIds.add(equipmentRowDic[id].rowId));

				// Get formatted equipment bars of this proc entry that are droppable
				const bars = formattedEquipment[equipmentRowDic[equipment.equipmentId].rowIndex].bars
					.filter(bar => bar.isDraggable && bar.barEntityId === procEntryTask.procedureId);

				// Assign the droppableRowIds
				bars.forEach(bar => bar.droppableRowIds = [...droppableRowIds])
			});
		});

		return {
			formattedEquipment,
			lastEquipmentRowId: rowIdCounter,
			lastEquipmentBarId: barIdCounter,
			rawArrowsData: rawArrowsData
		};
	}

	const createOperationBars = (operations, barIdCounter, rowIndex, displayName, selectedChartColorBy, draggable) => {
		// rowBarType can be either Procedure or Operation
		let bars = [];
		let rawArrowsData = [];

		// Create bars for the operations inside this procedure.
		for (var opIndex = 0; opIndex < operations.length; opIndex++) {
			let retrievedOperation = operations[opIndex];
			let barRow = retrievedOperation.row === undefined || retrievedOperation.row === null
				? 1
				: retrievedOperation.row;

			// This operation bar belongs to the current row.
			if (barRow === rowIndex) {
				const backgroundColor = intToRgbaColor(retrievedOperation[selectedChartColorBy.value]);
				let color = calculateForgroundColor(backgroundColor);

				// Always create the Normal bar.
				const operationNormalBar = {
					// Required properties that are used by the Gantt component.
					id: barIdCounter++,
					text: displayName && retrievedOperation.breaks.length === 0	// barName in a Normal bar should not be displayed when an Overlay bar exists.
						? retrievedOperation.operationName
						: "",
					type: "Normal",	// type possible values: "Normal" (for lets say operations), "Background" (for lets say outages), "Overlay" (transparent - for lets say procedures).
					startDate: retrievedOperation.startDate,
					endDate: retrievedOperation.endDate,

					// Optional properties that are used by the Gantt component.
					isDraggable: draggable,
					barStyle: retrievedOperation.conflictIndexes !== null && retrievedOperation.conflictIndexes.length > 0
						? {
							borderWidth: 1,
							borderStyle: "solid",
							borderColor: "red",
							borderRadius: "3px",
							backgroundColor: backgroundColor,
							color: color
						}
						: {
							borderWidth: 1,
							borderStyle: "solid",
							borderColor: "black",
							borderRadius: "3px",
							backgroundColor: backgroundColor,
							color: color
						},

					// Example specific properties.
					barEntityId: retrievedOperation.operationId,
					barEntityType: "Operation",
					procedureName: retrievedOperation.procedureName
				};

				bars.push(operationNormalBar);

				if (retrievedOperation.breaks.length > 0) {
					color = "rgb(0,0,0)";

					// Create break bar and a name bar on top of it.
					for (let breakIndex = 0; breakIndex < retrievedOperation.breaks.length; breakIndex++) {
						let retrievedBreak = retrievedOperation.breaks[breakIndex];

						const operationBreakBar = {
							// Required properties that are used by the Gantt component.
							id: barIdCounter++,
							text: "",
							type: "Normal",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
							startDate: retrievedBreak.startDate,
							endDate: retrievedBreak.endDate,

							// Optional properties that are used by the Gantt component.
							barStyle: {
								borderWidth: 1,
								borderStyle: "solid",
								borderColor: "transparent",
								borderRadius: "0px",
								backgroundColor: "rgb(255,255,255)"
							},

							// Example specific properties.
							barEntityType: "Break"
						};

						bars.push(operationBreakBar);
					}

					const operationNameBar = {
						// Required properties that are used by the Gantt component.
						id: barIdCounter++,
						text: displayName ? retrievedOperation.operationName : "",	// barName in a Normal bar should not be displayed when an Overlay bar exists.
						type: "Normal",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
						startDate: retrievedOperation.startDate,
						endDate: retrievedOperation.endDate,

						// Optional properties that are used by the Gantt component.
						barStyle: retrievedOperation.conflictIndexes !== null && retrievedOperation.conflictIndexes.length > 0
							? {
								borderWidth: 1,
								borderStyle: "solid",
								borderColor: "red",
								borderRadius: "3px",
								backgroundColor: "transparent",
								color: color
							}
							: {
								borderWidth: 1,
								borderStyle: "solid",
								borderColor: "black",
								borderRadius: "3px",
								backgroundColor: "transparent",
								color: color
							},

						// Example specific properties.
						barEntityType: "Operation"
					};

					bars.push(operationNameBar);
				}

				rawArrowsData.push(
					{
						referencedBarOperationId: retrievedOperation.schedulingReferenceOperationId,
						sourceEdge: retrievedOperation.schedulingRelation ? retrievedOperation.schedulingRelation[0] : "",
						destinationEdge: retrievedOperation.schedulingRelation ? retrievedOperation.schedulingRelation[1] : "",
						barId: operationNormalBar.id,
						barOperationId: retrievedOperation.operationId,
						barProcedureId: retrievedOperation.procedureId
					}
				);
			}
		}

		return {
			bars: bars,
			counter: barIdCounter,
			opEntryTasksRawArrowsData: rawArrowsData
		};
	};

	const createArrows = (rawArrowData) => {
		const arrows = [];

		rawArrowData.forEach((item) => {
			if (item.referencedBarOperationId) {
				const startBarItem = rawArrowData.find((barItem) => barItem.barOperationId === item.referencedBarOperationId);

				if (startBarItem && startBarItem.barProcedureId !== item.barProcedureId) {
					arrows.push({
						sourceBarId: startBarItem.barId,
						sourceEdge: item.sourceEdge,
						destinationEdge: item.destinationEdge,
						destinationBarId: item.barId
					});
				}
			}
		});

		return arrows;
	};

	const createStaffRows = (allStaff, rowIdCounter, barIdCounter, showOverlay, selectedChartColorBy) => {
		let formattedStaff = [];

		// Create staff rows.
		for (let staffIndex = 0; staffIndex < allStaff.length; staffIndex++) {
			let retrievedStaff = allStaff[staffIndex];
			let staffRowsRequired = retrievedStaff.rowsRequired === undefined || retrievedStaff.rowsRequired === null
				? 1
				: retrievedStaff.rowsRequired;

			// Build that many rows for this staff.
			for (var rowIndex = 0; rowIndex < staffRowsRequired; rowIndex++) {
				let resource;

				if (rowIndex === 0)
					resource = retrievedStaff.staffName;
				else if (retrievedStaff.isConflicted)
					resource = "!";
				else
					resource = "";

				// Eoc rows do not have childRows.
				let staffRow = {
					// Required properties that are used by the Gantt component.
					id: rowIdCounter++,
					bars: [],

					// Optional properties that are used by the Gantt component.
					gridValues: [resource],

					// Example specific properties.
					rowEntityType: "Staff"
				};

				// Always create bars for stand-alone operations.
				let { bars, counter } = createOperationBars(retrievedStaff.opEntryTasks, barIdCounter, rowIndex + 1, true, selectedChartColorBy, true);
				barIdCounter = counter;
				staffRow.bars = staffRow.bars.concat(bars);

				// Always create bars for outages.
				for (let outIndex = 0; outIndex < retrievedStaff.outages.length; outIndex++) {
					let retrievedOutage = retrievedStaff.outages[outIndex];

					const outageBar = {
						// Required properties that are used by the Gantt component.
						id: barIdCounter++,
						text: "",
						type: "Backdrop",	// type possible values: "Normal" (for lets say operations), "Backdrop" (for lets say outages), "Overlay" (transparent - for lets say procedures).
						startDate: retrievedOutage.startDate,
						endDate: retrievedOutage.endDate,

						// Optional properties that are used by the Gantt component.
						barStyle: {
							borderWidth: 0,
							borderStyle: "solid",
							borderColor: "gray",
							borderRadius: "0px",
							backgroundColor: "rgb(190,190,190)"
						},

						// Example specific properties.
						barEntityType: "Outage"
					}

					staffRow.bars.push(outageBar);

				}

				formattedStaff.push(staffRow);
			}
		}

		return {
			formattedStaff,
			lastStaffRowId: rowIdCounter,
			lastStaffBarId: barIdCounter
		};
	};

	const handleShowOverlay = () => {
		if (state.originalData !== null) {
			let newShowOverlay = !state.showOverlay;
			let chartData = createChartData(state.originalData, newShowOverlay, state.showArrows, state.selectedChartColorBy);

			setState(prevState => ({
				...prevState,
				showOverlay: newShowOverlay,
				formattedData: chartData.formattedData,
			}));
		}
	};

	const handleShowArrows = () => {
		if (state.originalData !== null) {
			let newShowArrows = !state.showArrows;
			let formattedData = state.formattedData;
			let arrows = [];

			if (newShowArrows === true) {
				const chartData = createChartData(state.originalData, state.showOverlay, newShowArrows, state.selectedChartColorBy);
				arrows = chartData.arrows;
			}

			setState(prevState => ({
				...prevState,
				showArrows: newShowArrows,
				formattedData: formattedData,
				arrows: arrows
			}));
		}
	};

	const handleShowPrimaryGridlines = () => {
		const showPrimaryGridlines = !state.showPrimaryGridlines;

		setState(prevState => ({
			...prevState,
			showPrimaryGridlines: showPrimaryGridlines,
		}));
	}

	const handleShowSecondaryGridlines = () => {
		const showSecondaryGridlines = !state.showSecondaryGridlines;

		setState(prevState => ({
			...prevState,
			showSecondaryGridlines: showSecondaryGridlines
		}));
	};

	const handleShowChartLegend = () => {
		setState(prevState => ({
			...prevState,
			showChartLegend: !state.showChartLegend
		}));
	};

	const handleBarClick = useCallback((barClickInfo) => {
		// Add your own implementation here...
	}, []);

	const handleBarRightClick = useCallback((barRightClickInfo) => {
		barRightClickInfo.event.preventDefault();

		// Add your own implementation here...
	}, []);

	const handleRowClick = useCallback((row) => {
		// Add your own implementation here...
	}, []);

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

	const handleShowRelativeTime = () => {
		setState(prevState => ({
			...prevState,
			showRelativeTime: !state.showRelativeTime
		}));
	};

	const getLegendContent = () => {
		let items = [];

		if (state.selectedChartColorBy.name === "Campaign")
			items = state.originalData.campaigns;

		if (state.selectedChartColorBy.name === "Batch")
			items = state.originalData.batches;

		let height = ganttRef.current?.clientHeight - 34;

		if (!height)
			height = 0;

		return (
			<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
				<div style={{ flex: "auto", width: "100%", height: height + "px", overflowY: "auto" }}>
					{items.map((item, index) => {
						return (
							<div key={index}
								style={{ textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								<span
									style={{
										width: "10px",
										paddingLeft: "10px",
										paddingRight: "10px",
										marginLeft: "5px",
										marginRight: "5px",
										backgroundColor: `${intToRgbaColor(item.color)}`,
									}}
								>
								</span>

								{item.name}
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	const handleChartColorByChange = (event) => {
		if (event.value !== state.selectedChartColorBy.value) {
			const selectedChartColorByLocal = state.chartColorsBy.find(item => item.value === event.value);

			if (state.originalData) {
				const { formattedData, arrows } = createChartData(state.originalData, state.showOverlay, state.showArrows, selectedChartColorByLocal);
				const showChartLegendLocal = state.showChartLegend;

				setState((prevState) => ({
					...prevState,
					formattedData: formattedData,
					arrows: arrows,
					showChartLegend: showChartLegendLocal,
					selectedChartColorBy: selectedChartColorByLocal
				}));
			}
			else {
				setState((prevState) => ({
					...prevState,
					selectedChartColorBy: selectedChartColorByLocal
				}));
			}
		}
	};

	const updateScrollLeft = useCallback((scrollLeft) => {
		ganttInternalParametersRef.current.scrollLeft = scrollLeft;
	}, []);

	const updateRetrievedData = (info) => {
		const data = { ...state.originalData };
		const bar = info.bar;

		if (bar.barEntityType === state.dragEntityTypes.Procedure) {
			// Find procedure entry task that will be moved.

			const equipment = data.equipment.find(equipment => equipment.equipmentId === info.initialRow.rowEntityId);
			if (!equipment)
				return;

			const procedureEntryTaskIndex = equipment.procEntryTasks.findIndex(pet => pet.procedureId === bar.barEntityId);
			if (procedureEntryTaskIndex < 0)
				return;

			const procedureEntryTask = equipment.procEntryTasks[procedureEntryTaskIndex];

			// Find new equipment corresponding to the new row.
			const newEquipment = data.equipment.find(equipment => equipment.equipmentId === info.finalRow.rowEntityId);
			if (!newEquipment)
				return;

			// Create copy for the new position.
			const dateDiff = new Date(info.finalPositionX).getTime() - new Date(bar.startDate).getTime();

			const newProcedureEntryTask = {
				...procedureEntryTask,
				startDate: new Date(new Date(procedureEntryTask.startDate).getTime() + dateDiff),
				endDate: new Date(new Date(procedureEntryTask.endDate).getTime() + dateDiff)
			};

			newProcedureEntryTask.opEntryTasks.forEach(oet => {
				oet.startDate = new Date(new Date(oet.startDate).getTime() + dateDiff);
				oet.endDate = new Date(new Date(oet.endDate).getTime() + dateDiff);
				oet.row = 1;

				oet.breaks.forEach(item => {
					item.startDate = new Date(new Date(item.startDate).getTime() + dateDiff);
					item.endDate = new Date(new Date(item.endDate).getTime() + dateDiff);
				})
			});

			// Add copied element into new row.
			newProcedureEntryTask.row = 1;
			newProcedureEntryTask.conflictIndexes = [];
			newEquipment.procEntryTasks.push(newProcedureEntryTask);

			// Normalize required rows.
			let rowsRequired = 1;

			newEquipment.procEntryTasks.forEach(pet => {
				if (pet.row > rowsRequired)
					rowsRequired = pet.row;
			});

			newEquipment.rowsRequired = rowsRequired;

			// Remove element from the old row.
			equipment.procEntryTasks.splice(procedureEntryTaskIndex, 1);

			// Normalize required rows.
			rowsRequired = 1;

			equipment.procEntryTasks.forEach(pet => {
				if (pet.row > rowsRequired)
					rowsRequired = pet.row;
			});

			equipment.rowsRequired = rowsRequired;
		}
		else {
			// Find operation entry task that will be updated (only from equipment operation entry tasks).
			const operationEntryTasks = data.equipment.flatMap(e => e.opEntryTasks);
			const operationEntryTasksToMove = operationEntryTasks.filter(oe => oe.operationId === bar.barEntityId);

			const dateDiff = new Date(info.finalPositionX).getTime() - new Date(bar.startDate).getTime();

			operationEntryTasksToMove.forEach(operationEntryTask => {
				operationEntryTask.startDate = new Date(new Date(operationEntryTask.startDate).getTime() + dateDiff);
				operationEntryTask.endDate = new Date(new Date(operationEntryTask.endDate).getTime() + dateDiff);
			});
		}

		return data;
	};

	const handleBarDrop = (dropInfo) => {
		const data = updateRetrievedData(dropInfo);
		applyRetrievedData(data);
	};

	return (
		<React.Fragment>
			{/* EOC chart page. */}
			{state.loadingCompleted && state.formattedData.length > 0 &&
				<div style={{ height: '800px' }}>
					{/* Header. */}
					{/* Menus. */}
					<div style={{ paddingBottom: "10px", display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							{/* Show Composite Task Label */}
							<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
								<input type="checkbox" checked={state.showOverlay} onChange={() => { }} />
								<label onClick={handleShowOverlay}>Show Composite Task Label</label>
							</div>
						</div>

						<div style={{ display: "flex", alignContent: 'center', justifyContent: "flex-start" }}>
							{/* Show colors by */}
							<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
								<label style={{ marginLeft: "10px" }}>Show Colors by:</label>

								<Select
									name="Colors"
									styles={{
										control: (baseStyles, state) => ({
											...baseStyles,
											width: "130px"
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

									value={{
										value: state.selectedChartColorBy.value,
										label: state.selectedChartColorBy.name,
									}}


									options={state.chartColorsBy.map((pair, index) => {
										return {
											value: pair.value,
											label: pair.name
										}
									})}

									onChange={handleChartColorByChange}
								/>
							</div>

							{/* Show Legend */}
							<div className="label-generic-control-aligned-center" style={{ marginLeft: "30px" }}>
								<input type="checkbox" checked={state.showChartLegend} onChange={() => { }} />
								<label onClick={handleShowChartLegend}>Show Legend</label>
							</div>
						</div>
					</div>

					<div className="page-menu">
						<div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>

							<div style={{ display: "flex", paddingLeft: "10px" }}>
								{/* Show Arrows */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showArrows} onChange={() => { }} />
									<label onClick={handleShowArrows}>Show arrows</label>
								</div>

								{/* Use Relative time */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showRelativeTime} onChange={() => { }} />
									<label onClick={handleShowRelativeTime}>Show relative time</label>
								</div>
							</div>

							<div style={{ display: "flex", paddingRight: "10px" }}>
								{/* Show Primary gridlines */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.showPrimaryGridlines} onChange={() => { }} />
									<label onClick={handleShowPrimaryGridlines}>Primary gridlines</label>
								</div>

								{/* Show Secondary gridlines */}
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
								<div className="label-generic-control-aligned-center" style={{ display: "flex", marginLeft: "10px", alignItems: 'end' }}	>
									<label>Scale:
										<input style={{ marginLeft: "5px", width: "80px" }}
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
						<div className={selectChartClass()} ref={ganttRef}>
							<Gantt
								data={state.formattedData}
								arrows={state.arrows}

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
								barHeight={barHeight}
								rowVerticalPadding={rowVerticalPadding}

								viewScale={state.viewScale}
								fitToWindow={state.fitToWindow}
								timeScale={state.timeScale.name}
								showPrimaryGridlines={state.showPrimaryGridlines}
								showSecondaryGridlines={state.showSecondaryGridlines}

								handleBarClick={handleBarClick}
								handleBarRightClick={handleBarRightClick}
								handleRowClick={handleRowClick}
								handleBarDrop={handleBarDrop}
							/>
						</div>

						{/* Legend */}
						{state.showChartLegend &&
							<div className="gantt-legend">
								{getLegendContent()}
							</div>
						}

					</div>
					{/* Footnotes */}
					<div className="page-footer">
						<div style={{ display: "flex", justifyContent: "flex-start" }}>
							<div style={{ display: "flex", marginLeft: "10px", marginRight: "10px", gap: "15px" }}>
								<div>* Horizontally draggable bars</div>
								<div>** Vertically draggable bars</div>
							</div>
							<div style={{ display: "flex", marginLeft: "10px", marginRight: "10px", alignItems: 'end', gap: "15px" }}>
								<div style={{ display: "flex", alignItems: "center" }}>
									<div
										style={{
											width: "20px",
											height: "15px",
											marginLeft: "5px",
											marginRight: "5px",
											borderStyle: "solid",
											borderColor: "black",
											borderRadius: "2px",
											borderWidth: 2,
											backgroundColor: "transparent"
										}}
									>
									</div>
									<div>Simple Task</div>
								</div>
								<div style={{ display: "flex", alignItems: "center" }}>
									<div
										style={{
											width: "20px",
											height: "15px",
											marginLeft: "5px",
											marginRight: "5px",
											borderStyle: "dotted",
											borderColor: "blue",
											borderRadius: "2px",
											borderWidth: 2,
											backgroundColor: "transparent"
										}}
									></div>
									<div>
										Composite Task
									</div>
								</div>

								<div style={{ display: "flex", alignItems: "center" }}>
									<div
										style={{
											width: "20px",
											height: "15px",
											marginLeft: "5px",
											marginRight: "5px",
											borderStyle: "dotted",
											borderColor: "rgb(190,190,190)",
											borderRadius: "2px",
											borderWidth: 2,
											backgroundColor: "rgb(190,190,190)"
										}}
									>
									</div>
									<div>Outage</div>
								</div>
							</div>
						</div>
					</div>

					{/* Footer. */}
					<div className="page-footer" style={{ width: "1fr" }}>
						(c) Fluidence 2024
					</div>
				</div>
			}

			{state.formattedData.length === 0 &&
				<div className="page-header" style={{ width: "1fr" }}>
					<h1 style={{ textAlign: "center" }}>Scheduler chart</h1>
					<div style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: "semi-bold" }}>No Scheduler Data found</div>
				</div>
			}
		</React.Fragment>
	);
}

export default SchedulerApp;
