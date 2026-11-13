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

	// Group students by Program + Section so identical section names (Sec-A) NEVER merge across programs!
	const displayGroups = useMemo<SectionCardGroup[]>(() => {
		const filtered = students.filter((s) => {
			if (selectedProgram !== "All" && s.program !== selectedProgram) return false;
			if (selectedSection !== "All") {
				const sName = getSectionName(s.section);
				if (sName !== selectedSection && s.section !== selectedSection) return false;
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
	}, [students, selectedProgram, selectedSection, getSectionName]);

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

					{/* Two Dropdowns Filter Row with cascading section */}
					{hasStudents && (
						<div className="bg-surface grid gap-4 rounded-xl border border-white/5 p-4 sm:grid-cols-2 shadow-sm">
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

					{!loading && hasStudents && displayGroups.length === 0 && (
						<EmptyState
							icon={<Users size={24} />}
							title="ለተመረጠው ማጣሪያ ምንም ተማሪ አልተገኘም"
							description="እባክዎን ሌላ ፕሮግራም ወይም ምድብ ይምረጡ።"
							className="py-12"
						/>
					)}

					{!loading && hasStudents && displayGroups.length > 0 && (
						<div className="space-y-4">
							{displayGroups.map((group) => {
								const isExpanded =
									expandedGroup === group.key ||
									displayGroups.length === 1;

								return (
									<Panel key={group.key} className="overflow-hidden">
										<button
											type="button"
											onClick={() => toggleGroup(group.key)}
											aria-expanded={isExpanded}
											className="hover:bg-white/[0.03] flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
										>
											<div className="flex items-center gap-3 flex-wrap">
												<Badge tone="primary" className="text-xs font-semibold px-2.5 py-0.5">
													{group.program}
												</Badge>
												<span className="font-semibold text-foreground text-base">
													{group.section}
												</span>
												<span className="text-muted-foreground text-xs font-medium">
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

										{isExpanded && (
											<div className="border-t border-white/5">
												{group.students.length > 0 ? (
													<div className="overflow-x-auto">
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
																	<th className="px-5 py-2.5 text-left font-medium hidden sm:table-cell">
																		ክፍል / Department
																	</th>
																	<th className="px-5 py-2.5 text-left font-medium hidden md:table-cell">
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
																		<td className="text-muted-foreground px-5 py-3 text-xs hidden sm:table-cell">
																			{student.department || "General"}
																		</td>
																		<td className="text-muted-foreground px-5 py-3 font-mono text-xs hidden md:table-cell">
																			{student.phoneNumber || "—"}
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
