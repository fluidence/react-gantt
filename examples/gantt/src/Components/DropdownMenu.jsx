// Imports needed for React.
import React, { useState, useEffect, useRef } from "react";
import "./Dropdown.css";

export function DropdownMenu(props) {
	/********************
	*** A.P.I v.1.1.0 ***
	********************/

	const inputDataRequiredProps = {
		// Scalar data.

		// caption:
		caption: props.caption,
		// contents:
		contents: props.contents,

		// Functions.

		// handleDropdownMenuItemClick:
		handleDropdownMenuItemClick: props.handleDropdownMenuItemClick
	};

	const inputDataOptionalProps = {
		// Scalar data.

		// style:
		style: {
			captionPadding: "8px",

			menuWidth: "max-content",

			menuContentsTextAlign: "left",
			menuContentsBorder: "1px solid #e5e5e5",
			menuContentsBorderRadius: "4px"
		}

		// Functions.
	};

	const inputData = {
		...inputDataRequiredProps,
		...inputDataOptionalProps
	};

	if (typeof props.style !== "undefined" && props.style !== null) {
		// Only these styles will be considered when provided by the user. Ignore everything else:

		// 1. captionPadding.
		if (typeof props.style.captionPadding !== "undefined" && props.style.captionPadding !== null)
			inputData.style.captionPadding = props.style.captionPadding;

		// 2. menuWidth.
		if (typeof props.style.menuWidth !== "undefined" && props.style.menuWidth !== null)
			inputData.style.menuWidth = props.style.menuWidth;

		// 3. menuContentsTextAlign.
		if (typeof props.style.menuContentsTextAlign !== "undefined" && props.style.menuContentsTextAlign !== null)
			inputData.style.menuContentsTextAlign = props.style.menuContentsTextAlign;

		// 4. menuContentsBorder.
		if (typeof props.style.menuContentsBorder !== "undefined" && props.style.menuContentsBorder !== null)
			inputData.style.menuContentsBorder = props.style.menuContentsBorder;

		// 5. menuContentsBorderRadius.
		if (typeof props.style.menuContentsBorderRadius !== "undefined" && props.style.menuContentsBorderRadius !== null)
			inputData.style.menuContentsBorderRadius = props.style.menuContentsBorderRadius;
	}

	const initialState = {
		isOpen: false
	};

	const [state, setState] = useState(initialState);
	const topLevelElement = useRef();

	useEffect(() => {
		document.addEventListener("click", closeDropdownMenu, { capture: true });

		return function cleanUp() {
			document.removeEventListener("click", closeDropdownMenu, { capture: true });
		}
	}, [])

	// Closes DropdownMenu control.
	const closeDropdownMenu = (event) => {
		let isContained = false;

		if (typeof topLevelElement.current !== "undefined" && topLevelElement.current !== null)
			isContained = topLevelElement.current.contains(event.target);	// The element that was clicked is part of the dropdown menu control.

		if (!isContained)
			handleIsOpenStatus(false);
	};

	const handleIsOpenStatus = (openStatus) => {
		setState(prevState => ({
			...prevState,
			isOpen: openStatus
		}))
	};

	return (
		<div
			ref={topLevelElement}
			className="dropdown"
			tabIndex="-1"	// the div element requires the tabIndex attribute in order to be focusable and to handle keyDown events
		>
			<div
				className="dropdown-caption"
				style={{ padding: inputData.style.captionPadding }}

				onClick={() => {
					handleIsOpenStatus(!state.isOpen);
				}}
			>
				{inputData.caption}
			</div>

			{state.isOpen &&
				<div
					id="dropdown-menu"
					className="dropdown-menu"
					style={{ width: inputData.style.menuWidth }}
				>
					<div
						className="dropdown-menu-contents"
						style={{ textAlign: inputData.style.menuContentsTextAlign, border: inputData.style.menuContentsBorder, borderRadius: inputData.style.menuContentsBorderRadius }}
					>
						{inputData.contents.map((item, index) => {
							return (
								<div
									key={index}
									className={"dropdown-menu-item " + (item.enabled ? "" : "disabled")}

									// In React even if you set pointer-events: none in CSS the event will still fire.
									// So, the condition that applies pointer-events: none should also NOT register an event handler.
									onClick={
										item.enabled
											? () => {
												inputData.handleDropdownMenuItemClick(item);
												handleIsOpenStatus(!state.isOpen);
											}
											: () => { }
									}
								>
									<span>{item.name}</span>
								</div>)
						})}
					</div>
				</div>
			}
		</div>
	);
}
