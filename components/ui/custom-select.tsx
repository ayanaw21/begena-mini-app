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
			{/* Visible styled trigger button */}
			<div
				className={cn(
					"bg-[#11223e] text-foreground border border-white/15 rounded-xl px-3.5 py-2.5 text-sm w-full flex items-center justify-between gap-2 transition-all shadow-sm",
					"hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
					isOpen && "border-primary ring-2 ring-primary/20 bg-[#162a4d]",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<span className="truncate font-medium text-xs sm:text-sm">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={cn(
						"text-muted-foreground shrink-0 transition-transform duration-200 pointer-events-none",
						isOpen && "rotate-180 text-primary"
					)}
				/>
			</div>

			{/* NATIVE SELECT FOR MOBILE (< md): 
			    Invisible overlay that opens the phone's native wheel/sheet picker. 
			    Works 100% on iOS Safari & Android Chrome without clipping or keyboard overlay bugs. */}
			<select
				disabled={disabled}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={placeholder}
				className="absolute inset-0 w-full h-full opacity-0 cursor-pointer md:hidden z-20 disabled:cursor-not-allowed"
			>
				{normalizedOptions.map((opt) => (
					<option
						key={opt.value}
						value={opt.value}
						disabled={opt.disabled}
						className="bg-slate-900 text-white"
					>
						{opt.label}
					</option>
				))}
			</select>

			{/* DESKTOP CUSTOM DROPDOWN (>= md): 
			    Opens elegant desktop menu when clicked */}
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				className="hidden md:block absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
			/>

			{isOpen && (
				<div className="hidden md:block bg-[#122340] border border-white/20 rounded-xl shadow-2xl absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto py-1.5 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-100">
					{normalizedOptions.length > 0 ? (
						normalizedOptions.map((opt) => {
							const isSelected = opt.value === value;
							return (
								<button
									key={opt.value}
									type="button"
									disabled={opt.disabled}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer",
										isSelected
											? "bg-primary/20 text-primary font-semibold"
											: "text-foreground hover:bg-white/10 hover:text-primary",
										opt.disabled && "opacity-40 cursor-not-allowed"
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
