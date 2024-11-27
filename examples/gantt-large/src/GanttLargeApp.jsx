// Imports needed for React.
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Imports for external components / functionality.
import Select from "react-select";

// Imports for our components / functionality.
import Gantt from "@fluidence/react-gantt";
import { DropdownMenu } from "./Components/DropdownMenu.jsx";
import data from "./data/data.json";
import { useConstructor } from "./hooks/useConstructor.js";

const localStorageKey = "GanttLargeApp";

function GanttLargeApp() {
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

	const detailLevels = [
		{ id: 1, name: "Campaign", enabled: true },
		{ id: 2, name: "Batch", enabled: true },
		{ id: 3, name: "Procedure", enabled: true },
		{ id: 4, name: "Operation", enabled: true },
	];

	const timeScaleConfigs = {
		"HourTenmin":
		{
			name: "HourTenmin",
			displayName: "hour / ten min"
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
		data: {
			rows:[],
			arrows:[]
		},
		showRelativeTime: false,

		columns: columns,

		maxHeight: 780,

		viewScale: 0,
		timeScaleConfig: timeScaleConfigs.WeekDay,

		showChartLegend: false,
		autoTimeScale: true,

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
					timeScaleConfig: savedState.timeScaleConfig,
					viewScale: savedState.viewScale,
					autoTimeScale: savedState.autoTimeScale,
					showRelativeTime: savedState.showRelativeTime,
					showPrimaryGridlines: savedState.showPrimaryGridlines,
					showSecondaryGridlines: savedState.showSecondaryGridlines
				};
			}
		};

		const retrievedState = retrieveStateFromLocalStorage();

		// There is a relevant key in local storage but there might be a chance where not all of the settings have a value. Use the retrieved value for each setting only if there is one.
		if (typeof retrievedState !== "undefined" && retrievedState !== null) {
			if (typeof retrievedState.timeScaleConfig !== "undefined" && retrievedState.timeScaleConfig !== null)
				initialState.timeScaleConfig = retrievedState.timeScaleConfig;

			if (typeof retrievedState.viewScale !== "undefined" && retrievedState.viewScale !== null)
				initialState.viewScale = retrievedState.viewScale;

			if (typeof retrievedState.autoTimeScale !== "undefined" && retrievedState.autoTimeScale !== null)
				initialState.autoTimeScale = retrievedState.autoTimeScale;

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
				timeScaleConfig: stateRef.current.timeScaleConfig,
				autoTimeScale: stateRef.current.autoTimeScale,
				viewScale: stateRef.current.viewScale,
				scrollLeft: ganttInternalParametersRef.current.scrollLeft,
				showRelativeTime: stateRef.current.showRelativeTime,
				showPrimaryGridlines: stateRef.current.showPrimaryGridlines,
				showSecondaryGridlines: stateRef.current.showSecondaryGridlines,
			}));
		};

		setState(prevState => ({
			...prevState,
			data: data,
			loadingCompleted: true
		}));

		// When the page refreshes react doesn't have the chance to unmount the components as normal so we use the "beforeunload" event.
		window.addEventListener("beforeunload", saveToLocalStorage);

		return () => window.removeEventListener("beforeunload", saveToLocalStorage);
	}, []);

	// When this state property changes update Gantt accordingly.
	useEffect(() => {
		setState(prevState => ({
			...prevState,
			data: data
		}));
	}, [state.showRelativeTime])

	const updateWidths = useCallback((widthInfo) => {
		ganttInternalParametersRef.current.columnWidths = widthInfo.columnWidths;
		ganttInternalParametersRef.current.gridWidth = widthInfo.gridWidth;
	}, []);

	const updateRowStatus = useCallback((rowStatus) => {
		ganttInternalParametersRef.current.rowStatus = rowStatus;
	}, []);

	const handleBarClick = useCallback((barClickInfo) => {
		// Add your own implementation here...
	}, []);

	const handleDetailLevelChange = (detailLevel) => {
		const types = state.detailLevels.filter((level) => level.id < detailLevel.id).map((item) => item.name.toLowerCase());

		const getRowStatus = (rows) => {
			let rowStatus = {};

			for (let row of rows) {
				let isExpanded = types.includes(row.rowEntityType.toLowerCase());
				rowStatus[row.id] = { isExpanded: isExpanded };
				rowStatus = { ...rowStatus, ...getRowStatus(row.childRows) };
			}

			return rowStatus;
		};

		const rowStatusLocal = getRowStatus(state.data.rows);

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
		const value = +event.target.value;

		if (value !== state.viewScale) {
			setState((prevState) => ({
				...prevState,
				viewScale: value
			}));
		}
	};

	const handleAutoTimeScale = () => {
		setState(prevState => ({
			...prevState,
			autoTimeScale: !state.autoTimeScale
		}));
	};

	const updateScrollLeft = useCallback((scrollLeft) => {
		ganttInternalParametersRef.current.scrollLeft = scrollLeft;
	}, []);

	return (
		<React.Fragment>
			{/* Gantt chart page. */}
			{state.loadingCompleted && state.data?.rows.length > 0 &&
				<div style={{ height: '800px', padding:"10px" }}>
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

								{/* Auto Time Scale */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.autoTimeScale} onChange={() => { }} />
									<label onClick={handleAutoTimeScale}>Auto time scale</label>
								</div>

								{/* Zoom */}
								<div className="label-generic-control-aligned-center"
									style={{ display: "flex", marginLeft: "10px", alignItems: 'end' }}>
									<label>Zoom
										<input
											style={{ marginLeft: "5px", width: "80px" }}
											type="range"
											min={0}
											max={100}
											onChange={changeScalePercentage}
											value={state.viewScale}
										/>
									</label>
								</div>

								{/* Time Scale */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<label>Time scale:</label>

									<Select
										name="selectTimeScale"
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

										isDisabled={state.autoTimeScale}

										value={{
											value: state.timeScaleConfig.name,
											label: state.timeScaleConfig.displayName
										}}

										options={Object.keys(timeScaleConfigs).map((key, index) => {
											return {
												value: timeScaleConfigs[key].name,
												label: timeScaleConfigs[key].displayName
											}
										})}

										onChange={(timeScaleConfig) => {
											const timeScaleConfigLocal = {
												name: timeScaleConfig.value,
												displayName: timeScaleConfig.label
											};

											setState(prevState => ({
												...prevState,
												timeScaleConfig: timeScaleConfigLocal
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
								data={state.data}

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
								autoTimeScale={state.autoTimeScale}
								timeScale={state.timeScaleConfig.name}
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

			{state.data?.rows.length === 0 &&
				<div className="page-header" style={{ width: "1fr" }}>
					<h1 style={{ textAlign: "center" }}>Gantt</h1>
					<div style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: "semi-bold" }}>No Gantt Data found</div>
				</div>
			}
		</React.Fragment>
	);
}

export default GanttLargeApp;
