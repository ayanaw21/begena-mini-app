"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Figure from "@/components/ui/figure";
import PhotoPanel from "@/components/ui/photo-panel";
import { siteImages } from "@/lib/images";
import {
	PageBody,
	PageContainer,
	PageHeader,
	PanelBody,
	PanelHeader,
} from "@/components/ui/page";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { ClassSchedule } from "@/types";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Schedule = () => {
	const [isBasic, setIsBasic] = useState<boolean>(true);
	const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
	const [selectedSection, setSelectedSection] = useState("All");

	const fetchSchedules = async () => {
		try {
			const res = await api.get("/class-schedules");
			// console.log(res);
			setSchedules(res.data.schedules);
		} catch (err: unknown) {
			console.error(err);
			toast.error("Failed to fetch announcements");
		}
	};

	useEffect(() => {
		fetchSchedules();
	}, []);
	const basicSections = [
		...new Set(
			schedules
				.filter((schedule) => schedule.type === "basic")
				.map((schedule) => schedule.section)
		),
	];

	const advancedSections = [
		...new Set(
			schedules
				.filter((schedule) => schedule.type === "advanced")
				.map((schedule) => schedule.section)
		),
	];

	const filteredSchedules = schedules.filter((schedule) => {
		const typeMatch = isBasic
			? schedule.type === "basic"
			: schedule.type === "advanced";
		const sectionMatch =
			selectedSection === "All" || schedule.section === selectedSection;
		return typeMatch && sectionMatch;
	});

	const availableSections = isBasic ? basicSections : advancedSections;

	// Section chips are type-scoped, so reset the filter when the type changes.
	const selectType = (basic: boolean) => {
		setIsBasic(basic);
		setSelectedSection("All");
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<PageBody>
				<PageContainer className="space-y-8">
					<Figure
						src={siteImages.scheduleBanner}
						alt="በገና ደርዳሪ"
						ratio="ultrawide"
						priority
						scrim
					>
						<p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
							የበገና ንዑስ ክፍል
						</p>
						<h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
							የትምህርት ሰዓት
						</h1>
					</Figure>

					<PageHeader
						title="የዚህ ሳምንት መርሃ ግብር"
						description="በምድብዎ የተዘጋጀውን ሳምንታዊ የትምህርት ክፍለ-ጊዜ ይመልከቱ።"
						action={
							<Button asChild variant="outline" size="sm">
								<Link href="/students">የተማሪዎች ዝርዝር</Link>
							</Button>
						}
					/>

					{/* Filters */}
					<div className="flex flex-col gap-4">
						<div
							role="tablist"
							aria-label="የትምህርት ደረጃ"
							className="bg-surface inline-flex w-full rounded-lg border border-white/5 p-1 sm:w-auto"
						>
							{[
								{ label: "ቤዚክ ተማሪዎች", basic: true },
								{ label: "አድቫንስ ተማሪዎች", basic: false },
							].map((tab) => (
								<button
									key={tab.label}
									role="tab"
									aria-selected={isBasic === tab.basic}
									onClick={() => selectType(tab.basic)}
									className={cn(
										"flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
										isBasic === tab.basic
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									{tab.label}
								</button>
							))}
						</div>

						{availableSections.length > 0 && (
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
									ምድብ
								</span>
								{["All", ...availableSections].map((section) => (
									<button
										key={section}
										onClick={() => setSelectedSection(section)}
										className={cn(
											"cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors",
											selectedSection === section
												? "border-primary/40 bg-primary/15 text-primary"
												: "text-muted-foreground hover:text-foreground border-white/10 hover:border-white/20"
										)}
									>
										{section === "All" ? "ሁሉም" : section}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Schedules */}
					<PhotoPanel src={siteImages.scheduleCard} contentClassName="p-0">
						<PanelHeader
							title={`${isBasic ? "ቤዚክ" : "አድቫንስ"} የትምህርት ሰዓት`}
							description={
								selectedSection === "All"
									? "ሁሉም ምድቦች"
									: `ምድብ ${selectedSection}`
							}
						/>
						{filteredSchedules.length > 0 ? (
							<ul className="divide-y divide-white/5">
								{filteredSchedules.map((schedule) => (
									<li
										key={schedule._id}
										className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4"
									>
										<span className="font-medium">
											Section {schedule.section}
										</span>
										<span className="text-muted-foreground flex gap-5 text-sm">
											<span>
												<span className="text-xs tracking-wider uppercase">ቀን</span>{" "}
												<span className="text-foreground">{schedule.date}</span>
											</span>
											<span>
												<span className="text-xs tracking-wider uppercase">ሰዓት</span>{" "}
												<span className="text-foreground">{schedule.time}</span>
											</span>
										</span>
									</li>
								))}
							</ul>
						) : (
							<PanelBody className="text-muted-foreground py-10 text-center text-sm">
								ለዚህ ምድብ የትምህርት ሰዓት አልተገኘም
							</PanelBody>
						)}
					</PhotoPanel>

					{/* Notice */}
					<PhotoPanel
						src={siteImages.noticeCard}
						className="border-primary/20"
						contentClassName="p-5"
					>
						<h2 className="text-primary text-sm font-semibold tracking-wider uppercase">
							ማሳሰቢያ
						</h2>
						<ol className="mt-3 space-y-2">
							{[
								"አቴንዳንስ ግዴታ ስለሆነ ማንም ተማሪ ያለፈቃድ እንዳይቀር።",
								"ሁሉም ተማሪ በተመደበበት Section ብቻ ነው መማር የሚችለው። አስገዳጅ ችግር ከገጠመው ለክላሱ አስተማሪ መናገር አለበት።",
							].map((note, index) => (
								<li
									key={note}
									className="text-muted-foreground flex gap-3 text-sm leading-relaxed"
								>
									<span className="text-primary/70 font-mono text-xs">
										{index + 1}.
									</span>
									{note}
								</li>
							))}
						</ol>
					</PhotoPanel>
				</PageContainer>
			</PageBody>

			<Footer />
		</div>
	);
};

export default Schedule;
