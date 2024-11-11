// Imports needed for React.
import { useRef } from "react";

export function useConstructor(callback) {
	const hasBeenCalled = useRef(false);

	if (hasBeenCalled.current)
		return;

	callback();

	hasBeenCalled.current = true;
}
