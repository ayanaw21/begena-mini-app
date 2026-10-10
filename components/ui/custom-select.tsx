"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
	value: string;
	label: string;
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

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
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
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			className={cn("relative w-full text-left select-none", className)}
			id={id}
		>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"bg-surface-raised text-foreground border border-white/10 rounded-lg px-3.5 py-2.5 text-sm w-full flex items-center justify-between gap-2 transition-colors cursor-pointer",
					"focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
					isOpen && "border-primary/60 ring-2 ring-primary/20",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<span className="truncate">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={cn(
						"text-muted-foreground shrink-0 transition-transform duration-200",
						isOpen && "rotate-180 text-primary"
					)}
				/>
			</button>

			{isOpen && (
				<div className="bg-[#122340] border border-white/15 rounded-xl shadow-2xl absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto py-1.5 backdrop-blur-md transition-all">
					{normalizedOptions.length > 0 ? (
						normalizedOptions.map((opt) => {
							const isSelected = opt.value === value;
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer",
										isSelected
											? "bg-primary/20 text-primary font-medium"
											: "text-foreground hover:bg-white/10 hover:text-primary"
									)}
								>
									<span className="truncate">{opt.label}</span>
									{isSelected && <Check size={14} className="text-primary shrink-0 ml-2" />}
								</button>
							);
						})
					) : (
						<div className="px-3.5 py-2 text-xs text-muted-foreground text-center">
							ምንም አማራጭ አልተገኘም
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default CustomSelect;

