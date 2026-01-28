import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs = 400) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedValue(value);
		}, delayMs);

		return () => clearTimeout(handle);
	}, [value, delayMs]);

	return debouncedValue;
}
