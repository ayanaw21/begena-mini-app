"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import NoSectionsFound from "@/components/NoSectionsFound";
import NoStudentsFound from "@/components/NoStudentsFound";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
	PageBody,
	PageContainer,
	PageHeader,
	Panel,
} from "@/components/ui/page";
import useStudentStore from "@/stores/studentStore";
import { ChevronDown, Loader2, Users } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const LoadingState = () => (
	<div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
		<Loader2 size={24} className="text-primary mb-3 animate-spin" />
		<p className="text-sm">ተማሪዎችን በመጫን ላይ...</p>
	</div>
);

const StudentsPage = () => {
	const {
		students,
		loading,
		fetchStudents,
		getStudentsBySection,
		getUniqueSections,
	} = useStudentStore();
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

	const sections = getUniqueSections();

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	const hasStudents = students.length > 0;
	const hasSections = sections.length > 0;

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<PageBody>
				<PageContainer className="space-y-8">
					<PageHeader
						eyebrow="የበገና ንዑስ ክፍል"
						title="የተማሪዎች ስም ዝርዝር"
						description="ተማሪዎች በየምድባቸው ተዘርዝረዋል። ዝርዝሩን ለማየት ምድቡን ይጫኑ።"
						action={
							<Button asChild variant="outline" size="sm">
								<Link href="/schedule">የትምህርት ሰዓት</Link>
							</Button>
						}
					/>

					{loading && <LoadingState />}

					{!loading && !hasStudents && <NoStudentsFound />}
					{!loading && hasStudents && !hasSections && <NoSectionsFound />}

					{!loading && hasStudents && hasSections && (
						<div className="space-y-3">
							{sections.map((section) => {
								const isExpanded = expandedSection === section;
								const sectionStudents = getStudentsBySection(section);

								return (
									<Panel key={section} className="overflow-hidden">
										<button
											type="button"
											onClick={() => toggleSection(section)}
											aria-expanded={isExpanded}
											className="hover:bg-white/[0.03] flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
										>
											<span className="flex items-baseline gap-3">
												<span className="font-semibold">Section {section}</span>
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
													<table className="w-full text-sm">
														<thead>
															<tr className="text-muted-foreground text-xs tracking-wider uppercase">
																<th className="w-40 px-5 py-2 text-left font-medium">
																	Begena ID
																</th>
																<th className="px-5 py-2 text-left font-medium">
																	Full Name
																</th>
															</tr>
														</thead>
														<tbody className="divide-y divide-white/5">
															{sectionStudents.map((student) => (
																<tr
																	key={student._id}
																	className="hover:bg-white/[0.03] transition-colors"
																>
																	<td className="text-muted-foreground px-5 py-2.5 font-mono text-xs">
																		{student.begenaId}
																	</td>
																	<td className="px-5 py-2.5">
																		{student.fullName}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												) : (
													<EmptyState
														icon={<Users size={20} />}
														title="No students in this section"
														className="py-10"
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
