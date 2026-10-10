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
import { ClassSchedule, Section } from "@/types";
import Link from "next/link";
import CustomSelect from "@/components/ui/custom-select";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

const Schedule = () => {
	const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
	const [sectionsMap, setSectionsMap] = useState<Record<string, string>>({});
	const [selectedProgram, setSelectedProgram] = useState("All");
	const [selectedSection, setSelectedSection] = useState("All");

	const fetchSchedules = async () => {
		try {
			const [schedRes, secRes] = await Promise.all([
				api.get("/class-schedules"),
				api.get("/sections").catch(() => null),
			]);

			if (secRes?.data?.sections) {
				const map: Record<string, string> = {};
				secRes.data.sections.forEach((sec: Section) => {
					if (sec._id && sec.section) {
						map[sec._id] = sec.section;
					}
				});
				setSectionsMap(map);
			}

			if (schedRes.data?.schedules) {
				setSchedules(schedRes.data.schedules);
			}
		} catch (err: unknown) {
			console.error(err);
			toast.error("የትምህርት ሰዓት መረጃ መጫን አልተቻለም");
		}
	};

	useEffect(() => {
		fetchSchedules();
	}, []);

	const getSectionName = useCallback(
		(secVal: string) => {
			if (!secVal) return "Section";
			const mapped = sectionsMap[secVal];
			const name = mapped || secVal;
			if (name.toLowerCase().includes("section") || name.startsWith("ምድብ")) {
				return name;
			}
			return `Section ${name}`;
		},
		[sectionsMap]
	);

	const uniquePrograms = useMemo(() => {
		return [
			...new Set(
				schedules
					.map((s) => s.program || "")
					.filter((p) => p.length > 0)
			),
		];
	}, [schedules]);

	const programFilteredSchedules = useMemo(() => {
		if (selectedProgram === "All") return schedules;
		return schedules.filter((s) => s.program === selectedProgram);
	}, [schedules, selectedProgram]);

	const availableSections = useMemo(() => {
		return [
			...new Set(
				programFilteredSchedules.map((s) => getSectionName(s.section))
			),
		];
	}, [programFilteredSchedules, getSectionName]);

	const filteredSchedules = useMemo(() => {
		return programFilteredSchedules.filter((schedule) => {
			const secName = getSectionName(schedule.section);
			return (
				selectedSection === "All" ||
				secName === selectedSection ||
				schedule.section === selectedSection
			);
		});
	}, [programFilteredSchedules, selectedSection, getSectionName]);

	const selectProgram = (program: string) => {
		setSelectedProgram(program);
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
						{/* Program dropdown */}
						{uniquePrograms.length > 1 && (
							<div className="flex items-center gap-3">
								<span className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
									ፕሮግራም
								</span>
								<div className="w-64">
									<CustomSelect
										value={selectedProgram}
										onChange={selectProgram}
										options={[
											{ value: "All", label: "ሁሉም ፕሮግራሞች" },
											...uniquePrograms.map((prog) => ({ value: prog, label: prog })),
										]}
									/>
								</div>
							</div>
						)}

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
							title={
								selectedProgram !== "All"
									? `${selectedProgram} የትምህርት ሰዓት`
									: "የትምህርት ሰዓት"
							}
							description={
								[
									selectedProgram !== "All" ? selectedProgram : null,
									selectedSection === "All"
										? "ሁሉም ምድቦች"
										: selectedSection,
								]
									.filter(Boolean)
									.join(" · ")
							}
						/>
						{filteredSchedules.length > 0 ? (
							<ul className="divide-y divide-white/5">
								{filteredSchedules.map((schedule) => (
									<li
										key={schedule._id}
										className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4"
									>
										<span className="font-medium">
											{getSectionName(schedule.section)}
										</span>
										<div className="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:gap-5">
											{schedule.sessions && schedule.sessions.length > 0 ? (
												schedule.sessions.map((session, idx) => (
													<span key={idx} className="flex gap-4">
														<span>
															<span className="text-xs tracking-wider uppercase">ቀን</span>{" "}
															<span className="text-foreground">{session.day}</span>
														</span>
														<span>
															<span className="text-xs tracking-wider uppercase">ሰዓት</span>{" "}
															<span className="text-foreground">
																{session.startTime} - {session.endTime}
															</span>
														</span>
													</span>
												))
											) : (
												<span className="flex gap-5">
													{schedule.date && (
														<span>
															<span className="text-xs tracking-wider uppercase">ቀን</span>{" "}
															<span className="text-foreground">{schedule.date}</span>
														</span>
													)}
													{schedule.time && (
														<span>
															<span className="text-xs tracking-wider uppercase">ሰዓት</span>{" "}
															<span className="text-foreground">{schedule.time}</span>
														</span>
													)}
												</span>
											)}
										</div>
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

