"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import NoStudentsFound from "@/components/NoStudentsFound";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Section, Student } from "@/types";
import { ChevronDown, Loader2, Phone, Search, Users, X } from "lucide-react";
import Link from "next/link";
import CustomSelect from "@/components/ui/custom-select";
import React, { useState, useEffect, useMemo, useCallback } from "react";

const LoadingState = () => (
	<div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
		<Loader2 size={24} className="text-primary mb-3 animate-spin" />
		<p className="text-sm">ተማሪዎችን በመጫን ላይ...</p>
	</div>
);

interface SectionCardGroup {
	program: string;
	section: string;
	key: string;
	students: Student[];
}

const StudentsPage = () => {
	const { students, loading, fetchStudents } = useStudentStore();
	const [selectedProgram, setSelectedProgram] = useState("All");
	const [selectedSection, setSelectedSection] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [sectionsMap, setSectionsMap] = useState<Record<string, string>>({});
	const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

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
			const name = (mapped || secVal).trim();
			if (/^sec[- ]/i.test(name)) {
				return `Section ${name.replace(/^sec[- ]+/i, "").trim()}`;
			}
			if (name.toLowerCase().startsWith("section") || name.startsWith("ምድብ")) {
				return name;
			}
			return `Section ${name}`;
		},
		[sectionsMap]
	);

	// Extract unique programs in students
	const uniquePrograms = useMemo(() => {
		return [
			...new Set(
				students
					.map((s) => s.program || "")
					.filter((p) => p.trim().length > 0)
			),
		];
	}, [students]);

	// Available sections strictly cascading from selected program
	const availableSections = useMemo(() => {
		const targetStudents =
			selectedProgram === "All"
				? students
				: students.filter((s) => s.program === selectedProgram);

		const secSet = new Set<string>();
		targetStudents.forEach((s) => {
			const name = getSectionName(s.section);
			if (name && name.trim().length > 0) {
				secSet.add(name);
			}
		});

		return Array.from(secSet).sort((a, b) => a.localeCompare(b));
	}, [students, selectedProgram, getSectionName]);

	// Group students by Program + Section and filter by Program, Section, and Search Query
	const displayGroups = useMemo<SectionCardGroup[]>(() => {
		const q = searchQuery.toLowerCase().trim();

		const filtered = students.filter((s) => {
			if (selectedProgram !== "All" && s.program !== selectedProgram) return false;
			if (selectedSection !== "All") {
				const sName = getSectionName(s.section);
				if (sName !== selectedSection && s.section !== selectedSection) return false;
			}
			if (q) {
				const matchName = s.fullName?.toLowerCase().includes(q);
				const matchId = (s.studentId || s.programId || s.begenaId || "").toLowerCase().includes(q);
				const matchPhone = s.phoneNumber?.toLowerCase().includes(q);
				const matchDept = s.department?.toLowerCase().includes(q);
				if (!matchName && !matchId && !matchPhone && !matchDept) return false;
			}
			return true;
		});

		const groupsMap = new Map<string, SectionCardGroup>();

		filtered.forEach((st) => {
			const prog = st.program || "General";
			const secName = getSectionName(st.section);
			const key = `${prog}__${secName}`;

			if (!groupsMap.has(key)) {
				groupsMap.set(key, {
					program: prog,
					section: secName,
					key,
					students: [],
				});
			}
			groupsMap.get(key)!.students.push(st);
		});

		// Sort students inside each group naturally by studentId
		groupsMap.forEach((grp) => {
			grp.students.sort((a, b) => {
				const idA = a.studentId || a.begenaId || "";
				const idB = b.studentId || b.begenaId || "";
				return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
			});
		});

		// Sort groups: first by program name, then by section name
		return Array.from(groupsMap.values()).sort((a, b) => {
			if (a.program !== b.program) return a.program.localeCompare(b.program);
			return a.section.localeCompare(b.section);
		});
	}, [students, selectedProgram, selectedSection, searchQuery, getSectionName]);

	const totalMatchingStudents = useMemo(() => {
		return displayGroups.reduce((acc, g) => acc + g.students.length, 0);
	}, [displayGroups]);

	const handleProgramChange = (prog: string) => {
		setSelectedProgram(prog);
		setSelectedSection("All");
		setExpandedGroup(null);
	};

	const handleSectionChange = (sec: string) => {
		setSelectedSection(sec);
		setExpandedGroup(null);
	};

	const toggleGroup = (groupKey: string) => {
		setExpandedGroup((prev) => (prev === groupKey ? null : groupKey));
	};

	const hasStudents = students.length > 0;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Navbar />

			<PageBody className="py-4 sm:py-8">
				<PageContainer className="space-y-4 sm:space-y-6">
					{/* Compact Mobile-Friendly Banner */}
					<Figure
						src={siteImages.studentsBanner}
						alt="የበገና ንዑስ ክፍል ተማሪዎች"
						ratio="ultrawide"
						priority
						scrim
						className="rounded-2xl overflow-hidden shadow-sm"
					>
						<p className="text-primary text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
							የበገና ንዑስ ክፍል
						</p>
						<h1 className="mt-1 text-xl sm:text-3xl font-extrabold tracking-tight text-white">
							የተማሪዎች ስም ዝርዝር
						</h1>
						{hasStudents && (
							<p className="mt-1 text-xs text-slate-300 font-medium">
								በጠቅላላ {students.length} ተማሪዎች ተመዝግበዋል
							</p>
						)}
					</Figure>

					{/* Header with Title and Quick Action */}
					<div className="flex items-center justify-between gap-3 pt-1">
						<div>
							<h2 className="text-lg sm:text-xl font-bold text-foreground">
								የተማሪዎች መዝገብ
							</h2>
							<p className="text-muted-foreground text-xs sm:text-sm">
								በፕሮግራም እና በምድብ የተመደቡ ተማሪዎችን ይመልከቱ።
							</p>
						</div>
						<Button asChild variant="outline" size="sm" className="shrink-0 text-xs border-white/10">
							<Link href="/schedule">📅 የትምህርት ሰዓት</Link>
						</Button>
					</div>

					{/* Mobile-First Search & Filter Suite */}
					{hasStudents && (
						<div className="space-y-3">
							{/* Instant Search Bar */}
							<div className="relative">
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="ተማሪ በስም ወይም በ ID ይፈልጉ..."
									className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface border border-white/10 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs transition-colors"
										aria-label="Clear search"
									>
										<X size={14} />
									</button>
								)}
							</div>

							{/* Dropdowns Filter Row: 2-column on all viewports */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-surface/80 p-3 sm:p-4 rounded-xl border border-white/5 shadow-sm">
								<div className="space-y-1">
									<label
										htmlFor="programSelect"
										className="text-muted-foreground text-[10px] sm:text-xs font-semibold tracking-wider uppercase"
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

								<div className="space-y-1">
									<label
										htmlFor="sectionSelect"
										className="text-muted-foreground text-[10px] sm:text-xs font-semibold tracking-wider uppercase"
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

							{/* Active Filter / Search Feedback Chip */}
							{(selectedProgram !== "All" || selectedSection !== "All" || searchQuery) && (
								<div className="flex items-center justify-between text-xs text-muted-foreground px-1">
									<span>
										የተገኙ ተማሪዎች: <strong className="text-primary font-semibold">{totalMatchingStudents}</strong>
									</span>
									{(selectedProgram !== "All" || selectedSection !== "All" || searchQuery) && (
										<button
											onClick={() => {
												setSelectedProgram("All");
												setSelectedSection("All");
												setSearchQuery("");
											}}
											className="text-primary hover:underline text-xs"
										>
											ሁሉንም አጽዳ (Reset)
										</button>
									)}
								</div>
							)}
						</div>
					)}

					{loading && <LoadingState />}

					{!loading && !hasStudents && <NoStudentsFound />}

					{!loading && hasStudents && displayGroups.length === 0 && (
						<EmptyState
							icon={<Users size={24} />}
							title="ለተመረጠው ማጣሪያ ምንም ተማሪ አልተገኘም"
							description="እባክዎን ሌላ ፕሮግራም ወይም ምድብ ይምረጡ ወይም ፍለጋውን ይቀይሩ።"
							className="py-12"
						/>
					)}

					{/* Section Groups */}
					{!loading && hasStudents && displayGroups.length > 0 && (
						<div className="space-y-3 sm:space-y-4">
							{displayGroups.map((group) => {
								const isExpanded =
									expandedGroup === group.key ||
									Boolean(searchQuery.trim()) ||
									displayGroups.length === 1;

								return (
									<Panel key={group.key} className="overflow-hidden border border-white/10 rounded-xl shadow-sm">
										{/* Section Accordion Trigger */}
										<button
											type="button"
											onClick={() => toggleGroup(group.key)}
											aria-expanded={isExpanded}
											className="hover:bg-white/[0.03] active:bg-white/[0.05] flex w-full cursor-pointer items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors"
										>
											<div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
												<Badge tone="primary" className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 shrink-0">
													{group.program}
												</Badge>
												<span className="font-bold text-foreground text-sm sm:text-base">
													{group.section}
												</span>
												<span className="text-muted-foreground text-xs font-medium bg-white/5 px-2 py-0.5 rounded-full">
													{group.students.length} ተማሪ
												</span>
											</div>
											<ChevronDown
												size={18}
												className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
													isExpanded ? "rotate-180" : ""
												}`}
											/>
										</button>

										{/* Section Body */}
										{isExpanded && (
											<div className="border-t border-white/5 bg-background/40">
												{group.students.length > 0 ? (
													<>
														{/* MOBILE VIEW (Thumb-Friendly Native Cards - < 640px) */}
														<div className="divide-y divide-white/5 sm:hidden">
															{group.students.map((student, idx) => (
																<div
																	key={student._id || idx}
																	className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
																>
																	<div className="flex items-center gap-3 min-w-0">
																		<div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-primary">
																			{idx + 1}
																		</div>
																		<div className="min-w-0">
																			<div className="font-semibold text-foreground text-sm truncate">
																				{student.fullName}
																			</div>
																			<div className="flex items-center gap-2 mt-0.5 flex-wrap">
																				<span className="font-mono text-primary font-medium bg-primary/15 border border-primary/25 px-1.5 py-0.2 rounded text-[11px]">
																					{student.studentId || student.programId || student.begenaId}
																				</span>
																				{student.department && (
																					<span className="text-muted-foreground text-[11px] truncate max-w-[140px]">
																						{student.department}
																					</span>
																				)}
																			</div>
																		</div>
																	</div>
																	{student.phoneNumber && (
																		<a
																			href={`tel:${student.phoneNumber}`}
																			className="shrink-0 size-8 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary transition-colors"
																			title={`Call ${student.fullName} (${student.phoneNumber})`}
																			aria-label={`Call ${student.fullName}`}
																		>
																			<Phone size={14} />
																		</a>
																	)}
																</div>
															))}
														</div>

														{/* DESKTOP VIEW (Full-Featured Table - >= 640px) */}
														<div className="hidden sm:block overflow-x-auto">
															<table className="w-full text-sm">
																<thead>
																	<tr className="text-muted-foreground text-xs tracking-wider uppercase border-b border-white/5 bg-white/[0.01]">
																		<th className="px-5 py-2.5 text-left font-medium w-12">
																			#
																		</th>
																		<th className="px-5 py-2.5 text-left font-medium">
																			የተማሪ መለያ (ID)
																		</th>
																		<th className="px-5 py-2.5 text-left font-medium">
																			ሙሉ ስም
																		</th>
																		<th className="px-5 py-2.5 text-left font-medium">
																			ክፍል / Department
																		</th>
																		<th className="px-5 py-2.5 text-left font-medium">
																			ስልክ ቁጥር
																		</th>
																	</tr>
																</thead>
																<tbody className="divide-y divide-white/5">
																	{group.students.map((student, idx) => (
																		<tr
																			key={student._id || idx}
																			className="hover:bg-white/[0.03] transition-colors"
																		>
																			<td className="text-muted-foreground px-5 py-3 font-mono text-xs w-12">
																				{idx + 1}
																			</td>
																			<td className="text-primary px-5 py-3 font-mono text-xs font-semibold">
																				{student.studentId || student.programId || student.begenaId}
																			</td>
																			<td className="px-5 py-3 font-medium text-foreground">
																				{student.fullName}
																			</td>
																			<td className="text-muted-foreground px-5 py-3 text-xs">
																				{student.department || "General"}
																			</td>
																			<td className="text-muted-foreground px-5 py-3 font-mono text-xs">
																				{student.phoneNumber ? (
																					<a
																						href={`tel:${student.phoneNumber}`}
																						className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
																					>
																						<Phone size={12} className="text-primary" />
																						{student.phoneNumber}
																					</a>
																				) : (
																					"—"
																				)}
																			</td>
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</>
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
