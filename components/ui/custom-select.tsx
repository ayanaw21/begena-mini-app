"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface CustomSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: (CustomSelectOption | string)[];
	placeholder?: string;
	className?: string;
	id?: string;
	disabled?: boolean;
}

export function CustomSelect({
	value,
	onChange,
	options,
	placeholder = "ይምረጡ...",
	className,
	id,
	disabled = false,
}: CustomSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Normalize options to object format
	const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
		typeof opt === "string" ? { value: opt, label: opt } : opt
	);

	const selectedOption = normalizedOptions.find((opt) => opt.value === value);

	// Close on click / touch outside
	useEffect(() => {
		const handleOutside = (event: MouseEvent | TouchEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleOutside);
			document.addEventListener("touchstart", handleOutside);
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("mousedown", handleOutside);
			document.removeEventListener("touchstart", handleOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative w-full text-left select-none",
				isOpen && "z-50",
				className
			)}
			id={id}
		>
			{/* Themed Trigger Button: Works on both Mobile & Desktop */}
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				className={cn(
					"w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-left text-sm transition-all shadow-sm outline-none cursor-pointer",
					"bg-[#11223e] hover:bg-[#152a4d] text-foreground border border-primary/25 hover:border-primary/50",
					"focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
					isOpen && "border-primary ring-2 ring-primary/25 bg-[#162a4d]",
					disabled && "opacity-50 cursor-not-allowed hover:border-primary/25 hover:bg-[#11223e]"
				)}
			>
				<span
					className={cn(
						"truncate font-medium text-xs sm:text-sm",
						!selectedOption && "text-muted-foreground"
					)}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={cn(
						"text-primary/70 shrink-0 transition-transform duration-200 pointer-events-none",
						isOpen && "rotate-180 text-primary"
					)}
				/>
			</button>

			{/* Custom Themed Dropdown Menu: Styled with Begena Deep Navy & Radiant Gold */}
			{isOpen && (
				<div
					role="listbox"
					className={cn(
						"absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto overscroll-contain",
						"bg-[#122340]/98 backdrop-blur-xl border border-primary/35 rounded-xl",
						"shadow-[0_12px_32px_rgba(0,0,0,0.65),0_0_18px_rgba(229,184,66,0.12)]",
						"py-1.5 px-1 animate-in fade-in-50 zoom-in-95 duration-100"
					)}
				>
					{normalizedOptions.length > 0 ? (
						normalizedOptions.map((opt) => {
							const isSelected = opt.value === value;
							return (
								<button
									key={opt.value}
									type="button"
									role="option"
									aria-selected={isSelected}
									disabled={opt.disabled}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"w-full text-left px-3.5 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer",
										isSelected
											? "bg-primary/20 text-primary font-semibold"
											: "text-foreground/90 hover:bg-primary/15 hover:text-primary active:bg-primary/20",
										opt.disabled && "opacity-40 cursor-not-allowed"
									)}
								>
									<span className="truncate">{opt.label}</span>
									{isSelected && (
										<Check size={15} className="text-primary shrink-0 ml-2" />
									)}
								</button>
							);
						})
					) : (
						<div className="px-3.5 py-2.5 text-xs text-muted-foreground text-center">
							ምንም አማራጭ አልተገኘም
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default CustomSelect;
