// Imports needed for React.
import React, { useState, useEffect, useRef, useCallback } from "react";

// Imports for external components / functionality.
import Select from "react-select";

// Imports for our components / functionality.
import Gantt from '@fluidence/react-gantt';
import { useConstructor } from "./hooks/useConstructor.js";
import data from "./data/data.json";
import legendData from "./data/legendData.json";

const localStorageKey = "SchedulerApp";

function SchedulerApp() {
	const ganttRef = useRef(null);

	const barHeight = 35;
	const rowVerticalPadding = 8;

	const columns = [
		{
			text: "Equipment",
			minWidth: 100,
			defaultWidth: 100
		}
	];

	const timeScaleConfigs = {
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

		data:{
			rows:[],
			arrows:[]
		},
		legendData:[],

		maxHeight: 600,

		viewScale: 100,
		timeScaleConfig: timeScaleConfigs.WeekDay,

		showArrows: true,
		autoTimeScale: true,

		loadingCompleted: false,

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
					fitToWindow: savedState.fitToWindow,
					showArrows: savedState.showArrows,
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
				initialState.timeScaleConfig = retrievedState.timeScale;

			if (typeof retrievedState.fitToWindow !== "undefined" && retrievedState.fitToWindow !== null)
				initialState.autoTimeScale = retrievedState.fitToWindow;

			if (typeof retrievedState.viewScale !== "undefined" && retrievedState.viewScale !== null)
				initialState.viewScale = retrievedState.viewScale;

			if (typeof retrievedState.showArrows !== "undefined" && retrievedState.showArrows !== null)
				initialState.showArrows = retrievedState.showArrows;

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

		applyRetrievedData();

		// When the page refreshes react doesn't have the chance to unmount the components as normal so we use the "beforeunload" event.
		window.addEventListener("beforeunload", saveStateToLocalStorage);

		return () => window.removeEventListener("beforeunload", saveStateToLocalStorage);
	}, []);

	const applyRetrievedData = () => {
		const dataLocal = {
			rows: data.rows,
			arrows: state.showArrows? data.arrows: []
		};

		setState(prevState => ({
			...prevState,
			data: dataLocal,
			legendData: legendData,
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

	const handleShowArrows = () => {
			const showArrowsLocal = !state.showArrows;
			const dataLocal = {
				rows: state.data.rows,
				arrows: showArrowsLocal? data.arrows: []
			};

			setState(prevState => ({
				...prevState,
				showArrows: showArrowsLocal,
				data: dataLocal
			}));
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

	const changeScalePercentage = event => {
		const vewScaleLocal = +event.target.value;

		if (vewScaleLocal !== state.viewScale) {
			setState((prevState) => ({
				...prevState,
				viewScale: vewScaleLocal
			}));
		}
	};

	const handleAutoTimeScale = () => {
		setState(prevState => ({
			...prevState,
			autoTimeScale: !state.autoTimeScale
		}));
	};

	const handleShowRelativeTime = () => {
		setState(prevState => ({
			...prevState,
			showRelativeTime: !state.showRelativeTime
		}));
	};

	const getLegendContent = () => {
		let height = ganttRef.current?.clientHeight - 34;

		return (
			<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
				<div style={{ flex: "auto", width: "100%", height: height + "px", overflowY: "auto" }}>
					{legendData.map((item, index) => {
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
										backgroundColor: item.color,
									}}
								>
								</span>

								{item.text}
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	const updateScrollLeft = useCallback((scrollLeft) => {
		ganttInternalParametersRef.current.scrollLeft = scrollLeft;
	}, []);

	const handleBarDrop = (dropInfo) => {
		const rows = [...state.data.rows ];

		// Get bars with relative indexes in row that will be moved
		const initialRowIndex = rows.findIndex(row => row.id === dropInfo.initialRow.id);
		const bars = [];
		rows[initialRowIndex].bars.forEach((bar, index)=> {
			if (bar.id === dropInfo.bar.id
					|| (typeof bar.groupId !== "undefined" && bar.groupId !== null && bar.groupId === dropInfo.bar.groupId)){
				bars.push(bar);
			}
		});

		// Find equivalent horizontal movement in time
		const dateDiff = new Date(dropInfo.finalPositionX).getTime() - new Date(dropInfo.initialPositionX).getTime();

		// Apply start, end changes in bars
		bars.forEach((bar, index) => {
			bar.startDate = new Date(new Date(bar.startDate).getTime()+ dateDiff);
			bar.endDate = new Date(new Date(bar.endDate).getTime() + dateDiff);
		});

		// if bar or group of bars move to another row then move them
		if (dropInfo.initialRow.id !== dropInfo.finalRow.id) {
			const finalRowIndex = rows.findIndex(row => row.id === dropInfo.finalRow.id);

			bars.forEach((bar,index) => {
				const removeIndex = rows[initialRowIndex].bars.findIndex( initialBar => initialBar.id === bar.id);
				rows[initialRowIndex].bars.splice(removeIndex, 1);
				rows[finalRowIndex].bars.push(bar);
			});
		}

		const data = {
			rows: rows,
			arrows: state.arrows
		}

		setState((prevState)=>({
			...prevState,
			data: data
		}));
	};

	return (
		<React.Fragment>
			{/* EOC chart page. */}
			{state.loadingCompleted && state.data?.rows.length > 0 &&
				<div style={{ height: '800px', padding:"10px" }}>
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

								{/* Auto Time Scale */}
								<div className="label-generic-control-aligned-center" style={{ marginLeft: "10px" }}>
									<input type="checkbox" checked={state.autoTimeScale} onChange={() => { }} />
									<label onClick={handleAutoTimeScale}>Auto Time Scale</label>
								</div>

								{/* Zoom */}
								<div className="label-generic-control-aligned-center" style={{ display: "flex", marginLeft: "10px", alignItems: 'end' }}	>
									<label>Zoom
										<input style={{ marginLeft: "5px", width: "80px" }}
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
						<div className="gantt-chart" ref={ganttRef}>
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
								barHeight={barHeight}
								rowVerticalPadding={rowVerticalPadding}

								viewScale={state.viewScale}
								autoTimeScale={state.autoTimeScale}
								timeScale={state.timeScaleConfig.name}
								showPrimaryGridlines={state.showPrimaryGridlines}
								showSecondaryGridlines={state.showSecondaryGridlines}

								handleBarClick={handleBarClick}
								handleBarRightClick={handleBarRightClick}
								handleRowClick={handleRowClick}
								handleBarDrop={handleBarDrop}
							/>
						</div>

						{/* Legend */}
						<div className="gantt-legend">
							{getLegendContent()}
						</div>

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

			{state.data?.rows.length === 0 &&
				<div className="page-header" style={{ width: "1fr" }}>
					<h1 style={{ textAlign: "center" }}>Scheduler chart</h1>
					<div style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: "semi-bold" }}>No Scheduler Data found</div>
				</div>
			}
		</React.Fragment>
	);
}

export default SchedulerApp;
