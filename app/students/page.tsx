"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import NoStudentsFound from "@/components/NoStudentsFound";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
import {
	PageBody,
	PageContainer,
	PageHeader,
	Panel,
} from "@/components/ui/page";
import useStudentStore from "@/stores/studentStore";
import api from "@/lib/api";
import { Section } from "@/types";
import { ChevronDown, Loader2, Users } from "lucide-react";
import Link from "next/link";
import CustomSelect from "@/components/ui/custom-select";
import React, { useState, useEffect, useMemo, useCallback } from "react";

const LoadingState = () => (
	<div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
		<Loader2 size={24} className="text-primary mb-3 animate-spin" />
		<p className="text-sm">ተማሪዎችን በመጫን ላይ...</p>
	</div>
);

const StudentsPage = () => {
	const { students, loading, fetchStudents } = useStudentStore();
	const [selectedProgram, setSelectedProgram] = useState("All");
	const [selectedSection, setSelectedSection] = useState("All");
	const [sectionsMap, setSectionsMap] = useState<Record<string, string>>({});
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	useEffect(() => {
		fetchStudents();
		api.get("/sections")
			.then((res) => {
				if (res.data?.sections) {
					const map: Record<string, string> = {};
					res.data.sections.forEach((sec: Section) => {
						if (sec._id && sec.section) {
							map[sec._id] = sec.section;
						}
					});
					setSectionsMap(map);
				}
			})
			.catch(() => null);
	}, [fetchStudents]);

	const getSectionName = useCallback(
		(secVal?: string) => {
			if (!secVal) return "ያልተጠቀሰ";
			const mapped = sectionsMap[secVal];
			const name = mapped || secVal;
			if (name.toLowerCase().includes("section") || name.startsWith("ምድብ")) {
				return name;
			}
			return `Section ${name}`;
		},
		[sectionsMap]
	);

	// Extract unique programs
	const uniquePrograms = useMemo(() => {
		return [
			...new Set(
				students
					.map((s) => s.program || "")
					.filter((p) => p.trim().length > 0)
			),
		];
	}, [students]);

	// Filter students by program
	const programStudents = useMemo(() => {
		if (selectedProgram === "All") return students;
		return students.filter((s) => s.program === selectedProgram);
	}, [students, selectedProgram]);

	// Extract sections available for selected program
	const availableSections = useMemo(() => {
		return [
			...new Set(
				programStudents
					.map((s) => getSectionName(s.section))
					.filter((sec) => sec.trim().length > 0)
			),
		];
	}, [programStudents, getSectionName]);

	// Final filtered students list
	const filteredStudents = useMemo(() => {
		return programStudents.filter((student) => {
			if (selectedSection === "All") return true;
			const secName = getSectionName(student.section);
			return secName === selectedSection || student.section === selectedSection;
		});
	}, [programStudents, selectedSection, getSectionName]);

	// Unique sections in the filtered dataset
	const displaySections = useMemo(() => {
		return [
			...new Set(
				filteredStudents.map((s) => getSectionName(s.section))
			),
		];
	}, [filteredStudents, getSectionName]);

	const handleProgramChange = (prog: string) => {
		setSelectedProgram(prog);
		setSelectedSection("All");
		setExpandedSection(null);
	};

	const handleSectionChange = (sec: string) => {
		setSelectedSection(sec);
		if (sec !== "All") {
			setExpandedSection(sec);
		} else {
			setExpandedSection(null);
		}
	};

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	const hasStudents = students.length > 0;

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<PageBody>
				<PageContainer className="space-y-8">
					<Figure
						src={siteImages.studentsBanner}
						alt="የበገና ንዑስ ክፍል ተማሪዎች"
						ratio="ultrawide"
						priority
						scrim
					>
						<p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
							የበገና ንዑስ ክፍል
						</p>
						<h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
							የተማሪዎች ስም ዝርዝር
						</h1>
					</Figure>

					<PageHeader
						title="የተማሪዎች መዝገብ"
						description="በፕሮግራም እና በምድብ የተመደቡ ተማሪዎችን ይመልከቱ።"
						action={
							<Button asChild variant="outline" size="sm">
								<Link href="/schedule">የትምህርት ሰዓት</Link>
							</Button>
						}
					/>

					{/* Two Dropdowns Filter Row */}
					{hasStudents && (
						<div className="bg-surface grid gap-4 rounded-xl border border-white/5 p-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<label
									htmlFor="programSelect"
									className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase"
								>
									ፕሮግራም (Program)
								</label>
								<CustomSelect
									id="programSelect"
									value={selectedProgram}
									onChange={handleProgramChange}
									options={[
										{ value: "All", label: "ሁሉም ፕሮግራሞች (All Programs)" },
										...uniquePrograms.map((prog) => ({ value: prog, label: prog })),
									]}
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="sectionSelect"
									className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase"
								>
									ምድብ / ክፍል (Section)
								</label>
								<CustomSelect
									id="sectionSelect"
									value={selectedSection}
									onChange={handleSectionChange}
									options={[
										{ value: "All", label: "ሁሉም ምድቦች (All Sections)" },
										...availableSections.map((sec) => ({ value: sec, label: sec })),
									]}
								/>
							</div>
						</div>
					)}

					{loading && <LoadingState />}

					{!loading && !hasStudents && <NoStudentsFound />}

					{!loading && hasStudents && displaySections.length === 0 && (
						<EmptyState
							icon={<Users size={24} />}
							title="ለተመረጠው ማጣሪያ ምንም ተማሪ አልተገኘም"
							description="እባክዎን ሌላ ፕሮግራም ወይም ምድብ ይምረጡ።"
							className="py-12"
						/>
					)}

					{!loading && hasStudents && displaySections.length > 0 && (
						<div className="space-y-4">
							{displaySections.map((section) => {
								const isExpanded =
									expandedSection === section ||
									selectedSection === section ||
									displaySections.length === 1;

								const sectionStudents = filteredStudents.filter(
									(student) => getSectionName(student.section) === section
								);

								return (
									<Panel key={section} className="overflow-hidden">
										<button
											type="button"
											onClick={() => toggleSection(section)}
											aria-expanded={isExpanded}
											className="hover:bg-white/[0.03] flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
										>
											<span className="flex items-baseline gap-3">
												<span className="font-semibold text-foreground">
													{section}
												</span>
												<span className="text-muted-foreground text-xs">
													{sectionStudents.length} ተማሪ
												</span>
											</span>
											<ChevronDown
												size={18}
												className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
													isExpanded ? "rotate-180" : ""
												}`}
											/>
										</button>

										{isExpanded && (
											<div className="border-t border-white/5">
												{sectionStudents.length > 0 ? (
													<div className="overflow-x-auto">
														<table className="w-full text-sm">
															<thead>
																<tr className="text-muted-foreground text-xs tracking-wider uppercase border-b border-white/5 bg-white/[0.01]">
																	<th className="px-5 py-2.5 text-left font-medium">
																		Program ID
																	</th>
																	<th className="px-5 py-2.5 text-left font-medium">
																		Full Name
																	</th>
																	<th className="px-5 py-2.5 text-left font-medium hidden sm:table-cell">
																		Program
																	</th>
																</tr>
															</thead>
															<tbody className="divide-y divide-white/5">
																{sectionStudents.map((student) => (
																	<tr
																		key={student._id}
																		className="hover:bg-white/[0.03] transition-colors"
																	>
																		<td className="text-muted-foreground px-5 py-3 font-mono text-xs">
																			{student.programId || student.begenaId || student.studentId}
																		</td>
																		<td className="px-5 py-3 font-medium text-foreground">
																			{student.fullName}
																		</td>
																		<td className="text-muted-foreground px-5 py-3 text-xs hidden sm:table-cell">
																			{student.program || "—"}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												) : (
													<EmptyState
														icon={<Users size={20} />}
														title="በዚህ ምድብ ተማሪ የለም"
														className="py-8"
													/>
												)}
											</div>
										)}
									</Panel>
								);
							})}
						</div>
					)}
				</PageContainer>
			</PageBody>

			<Footer />
		</div>
	);
};

export default StudentsPage;

