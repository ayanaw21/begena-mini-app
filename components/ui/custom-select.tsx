"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [coords, setCoords] = useState<{
		top: number;
		left: number;
		width: number;
		openUpwards: boolean;
	} | null>(null);

	// Ensure portal only mounts on the client
	useEffect(() => {
		setMounted(true);
	}, []);

	// Normalize options to object format
	const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
		typeof opt === "string" ? { value: opt, label: opt } : opt
	);

	const selectedOption = normalizedOptions.find((opt) => opt.value === value);

	// Update dropdown position relative to viewport
	const updatePosition = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUpwards = spaceBelow < 220 && rect.top > 220;

		setCoords({
			top: openUpwards ? rect.top - 6 : rect.bottom + 6,
			left: rect.left,
			width: rect.width,
			openUpwards,
		});
	}, []);

	// Calculate position when opening
	useEffect(() => {
		if (isOpen) {
			updatePosition();
		}
	}, [isOpen, updatePosition]);

	// Close on click / touch outside, and update position on scroll or resize
	useEffect(() => {
		if (!isOpen) return;

		const handleOutside = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node;
			const clickedInsideTrigger =
				containerRef.current && containerRef.current.contains(target);
			const clickedInsideMenu =
				menuRef.current && menuRef.current.contains(target);

			if (!clickedInsideTrigger && !clickedInsideMenu) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		const handleScrollOrResize = () => {
			updatePosition();
		};

		document.addEventListener("mousedown", handleOutside);
		document.addEventListener("touchstart", handleOutside);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);

		return () => {
			document.removeEventListener("mousedown", handleOutside);
			document.removeEventListener("touchstart", handleOutside);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
		};
	}, [isOpen, updatePosition]);

	return (
		<div
			ref={containerRef}
			className={cn("relative w-full text-left select-none", className)}
			id={id}
		>
			{/* Themed Trigger Button: Works on both Mobile & Desktop */}
			<button
				ref={triggerRef}
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

			{/* Custom Themed Dropdown Menu: Portaled directly to document.body so it is NEVER overlapped or clipped */}
			{isOpen &&
				coords &&
				mounted &&
				createPortal(
					<div
						ref={menuRef}
						role="listbox"
						style={{
							position: "fixed",
							left: coords.left,
							top: coords.openUpwards ? "auto" : coords.top,
							bottom: coords.openUpwards
								? window.innerHeight - coords.top
								: "auto",
							width: coords.width,
							zIndex: 99999,
						}}
						className={cn(
							"max-h-64 overflow-y-auto overscroll-contain",
							"bg-[#122340]/98 backdrop-blur-xl border border-primary/35 rounded-xl",
							"shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(229,184,66,0.18)]",
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
					</div>,
					document.body
				)}
		</div>
	);
}

export default CustomSelect;
