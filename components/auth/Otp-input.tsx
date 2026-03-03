"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface OtpInputProps {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	disabled?: boolean;
	hasError?: boolean;
}

const OtpInput = ({
	value,
	onChange,
	length = 6,
	disabled = false,
	hasError = false,
}: OtpInputProps) => {
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

	// Sync digits array from string value
	const digits = value
		.split("")
		.concat(Array(length).fill(""))
		.slice(0, length);

	const focusBox = (index: number) => {
		setTimeout(() => inputsRef.current[index]?.focus(), 0);
	};

	// Auto-focus first box on mount
	useEffect(() => {
		focusBox(0);
	}, []);

	const handleChange = (index: number, char: string) => {
		// Only accept digits
		if (!/^\d$/.test(char)) return;

		const next = digits.map((d, i) => (i === index ? char : d));
		onChange(next.join("").replace(/ /g, ""));

		// Advance to next
		if (index < length - 1) focusBox(index + 1);
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace") {
			e.preventDefault();
			if (digits[index]) {
				// Clear current box
				const next = digits.map((d, i) => (i === index ? "" : d));
				onChange(next.join("").replace(/ /g, ""));
			} else if (index > 0) {
				// Move back and clear
				const next = digits.map((d, i) => (i === index - 1 ? "" : d));
				onChange(next.join("").replace(/ /g, ""));
				focusBox(index - 1);
			}
		} else if (e.key === "ArrowLeft" && index > 0) {
			focusBox(index - 1);
		} else if (e.key === "ArrowRight" && index < length - 1) {
			focusBox(index + 1);
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasted = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, length);
		if (!pasted) return;
		onChange(pasted.padEnd(length, "").slice(0, length).replace(/ /g, ""));
		// Focus last filled box
		focusBox(Math.min(pasted.length, length - 1));
	};

	return (
		<div className='flex items-center justify-center gap-3' dir='ltr'>
			{Array.from({ length }).map((_, index) => (
				<input
					key={index}
					ref={(el) => {
						inputsRef.current[index] = el;
					}}
					type='text'
					inputMode='numeric'
					maxLength={1}
					value={digits[index] || ""}
					disabled={disabled}
					onChange={(e) => handleChange(index, e.target.value)}
					onKeyDown={(e) => handleKeyDown(index, e)}
					onPaste={handlePaste}
					onFocus={(e) => e.target.select()}
					className={cn(
						// Base
						"w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-neutral-100 dark:bg-slate-800 outline-none transition-all duration-150 select-none caret-transparent",
						// Normal
						"border-neutral-300 dark:border-slate-600",
						// Filled
						digits[index] &&
							!hasError &&
							"border-primary bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary",
						// Focused
						"focus:border-primary focus:ring-2 focus:ring-primary/20",
						// Error
						hasError &&
							"border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 focus:ring-red-300/30",
						// Disabled
						disabled && "opacity-50 cursor-not-allowed",
					)}
				/>
			))}
		</div>
	);
};

export default OtpInput;
