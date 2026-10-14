"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomMultiSelectOption {
	value: string;
	label: string;
}

export interface CustomMultiSelectProps {
	values: string[];
	onChange: (values: string[]) => void;
	options: (CustomMultiSelectOption | string)[];
	placeholder?: string;
	className?: string;
	id?: string;
	disabled?: boolean;
}

export function CustomMultiSelect({
	values = [],
	onChange,
	options,
	placeholder = "መምህራንን ይምረጡ...",
	className,
	id,
	disabled = false,
}: CustomMultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const normalizedOptions: CustomMultiSelectOption[] = options.map((opt) =>
		typeof opt === "string" ? { value: opt, label: opt } : opt
	);

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

	const toggleValue = (val: string) => {
		if (values.includes(val)) {
			onChange(values.filter((v) => v !== val));
		} else {
			onChange([...values, val]);
		}
	};

	const removeValue = (val: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(values.filter((v) => v !== val));
	};

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
			<div
				role="button"
				tabIndex={disabled ? -1 : 0}
				onClick={() => {
					if (!disabled) setIsOpen((prev) => !prev);
				}}
				onKeyDown={(e) => {
					if (!disabled && (e.key === "Enter" || e.key === " ")) {
						e.preventDefault();
						setIsOpen((prev) => !prev);
					}
				}}
				className={cn(
					"bg-surface-raised text-foreground border border-white/10 rounded-lg px-3 py-2 text-sm w-full flex items-center justify-between gap-2 transition-colors cursor-pointer min-h-[42px]",
					"focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
					isOpen && "border-primary/60 ring-2 ring-primary/20",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<div className="flex flex-wrap gap-1.5 items-center flex-1 min-w-0">
					{values.length === 0 ? (
						<span className="text-muted-foreground truncate">{placeholder}</span>
					) : (
						values.map((v) => {
							const opt = normalizedOptions.find((o) => o.value === v);
							const label = opt ? opt.label : v;
							return (
								<span
									key={v}
									className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30"
								>
									<span className="truncate max-w-[150px]">{label}</span>
									{!disabled && (
										<button
											type="button"
											onClick={(e) => removeValue(v, e)}
											className="hover:text-white rounded-full p-0.5 transition-colors"
											aria-label={`Remove ${label}`}
										>
											<X size={12} />
										</button>
									)}
								</span>
							);
						})
					)}
				</div>
				<ChevronDown
					size={16}
					className={cn(
						"text-muted-foreground shrink-0 transition-transform duration-200 ml-1",
						isOpen && "rotate-180 text-primary"
					)}
				/>
			</div>

			{isOpen && (
				<div className="bg-[#122340] border border-white/15 rounded-xl shadow-2xl absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto py-1.5 backdrop-blur-md transition-all">
					<div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 text-xs text-muted-foreground">
						<span>{values.length} selected</span>
						{values.length > 0 && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onChange([]);
								}}
								className="text-primary hover:underline cursor-pointer"
							>
								Clear all
							</button>
						)}
					</div>

					{normalizedOptions.length > 0 ? (
						normalizedOptions.map((opt) => {
							const isSelected = values.includes(opt.value);
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => toggleValue(opt.value)}
									className={cn(
										"w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer",
										isSelected
											? "bg-primary/20 text-primary font-medium"
											: "text-foreground hover:bg-white/10 hover:text-primary"
									)}
								>
									<span className="truncate">{opt.label}</span>
									<div
										className={cn(
											"h-4 w-4 rounded border flex items-center justify-center shrink-0 ml-2 transition-colors",
											isSelected
												? "border-primary bg-primary text-black"
												: "border-white/30 bg-transparent"
										)}
									>
										{isSelected && <Check size={12} strokeWidth={3} />}
									</div>
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

export default CustomMultiSelect;

