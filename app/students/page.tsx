"use client";
import Navbar from "@/components/Navbar";
import NoSectionsFound from "@/components/NoSectionsFound";
import NoStudentsFound from "@/components/NoStudentsFound";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Student } from "@/types";
import { ChevronDown, ChevronUp, Loader2, MoveLeft, Users } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

// Loading component
const LoadingSpinner = () => (
	<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
		<Loader2 size={64} className="text-amber-400 animate-spin mb-4" />
		<h2 className="text-2xl font-semibold text-gray-300 mb-2">
			Loading Students
		</h2>
		<p className="text-gray-400 max-w-md">
			Please wait while we fetch the student data...
		</p>
	</div>
);

const StudentsPage = () => {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const fetchStudents = useCallback(async () => {
		try {
			setLoading(true);
			const res = await api.get("/students", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			setStudents(res.data.students);
		} catch (err) {
			console.error(err);
			toast.error("Failed to fetch students");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

	const sections = () => {
		return Array.from(new Set(students.map((s) => s.section)));
	};

	const getStudentsBySection = (section: string) => {
		return students.filter((student) => student.section === section);
	};

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => {
			if (prev === section) {
				return null;
			}
			return section;
		});
	};

	const isSectionExpanded = (section: string) => {
		return expandedSection === section;
	};

	// Check if there are any students
	const hasStudents = students.length > 0;
	// Check if there are any sections
	const hasSections = sections().length > 0;

	return (
		<div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800">
			<Navbar />
			<div className="flex justify-between items-center mt-10 px-8">
				<h1 className="text-4xl text-amber-400">የተማሪዎች ስም ዝርዝር</h1>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
					<Link href="/schedule">
						<Button className="text-2xl text-amber-400 bg-gray-700 border-amber-400">
							Schedules
						</Button>
					</Link>
					<Link href="/">
						<Button className="text-2xl text-gray-100 bg-gray-700 border-amber-400 ">
							<MoveLeft /> ለመመለስ
						</Button>
					</Link>
				</div>
			</div>

			<div className="p-10">
				{/* Show loading spinner */}
				{loading && <LoadingSpinner />}
				
				{/* Show content when not loading */}
				{!loading && (
					<>
						{/* Show empty state when no students exist */}
						{!hasStudents && <NoStudentsFound />}

						{/* Show empty state when students exist but no sections */}
						{hasStudents && !hasSections && <NoSectionsFound />}

						{/* Show sections when both students and sections exist */}
						{hasStudents && hasSections && sections().map((section, index) => {
							const isExpanded = isSectionExpanded(section);
							const sectionStudents = getStudentsBySection(section);

							return (
								<div
									key={section}
									className="rounded-md p-4"
								>
									<div className="bg-amber-950 p-4 rounded-t-md flex justify-between items-center">
										<h1 className="text-amber-400 text-2xl font-bold">
											Section {section}
										</h1>
										{isExpanded ? (
											<ChevronUp
												onClick={() =>
													toggleSection(section)
												}
												size={30}
												className="font-bold text-gray-700 cursor-pointer hover:text-amber-400 transition-colors"
											/>
										) : (
											<ChevronDown
												onClick={() =>
													toggleSection(section)
												}
												size={30}
												className="font-bold text-gray-700 cursor-pointer hover:text-amber-400 transition-colors"
											/>
										)}
									</div>
									<div
										className={`bg-gray-700 p-3 rounded-b-md ${
											isExpanded ? "block" : "hidden"
										}`}
									>
										{sectionStudents.length > 0 ? (
											<>
												<div className="flex p-2 gap-3 text-2xl text-amber-400 font-semibold">
													<p>Begena Id</p>
													<p>Full Name</p>
												</div>
												{sectionStudents.map(
													(student) => (
														<div
															key={
																student._id
															}
															className="text-white p-2 flex gap-3 hover:bg-gray-600 rounded transition-colors"
														>
															<p className="">
																{
																	student.begenaId
																}
															</p>
															<p>
																{
																	student.fullName
																}
															</p>
														</div>
													)
												)}
											</>
										) : (
											<div className="text-center py-8 text-gray-400">
												<Users
													size={32}
													className="mx-auto mb-2"
												/>
												<p>
													No students in this
													section
												</p>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
};

export default StudentsPage;