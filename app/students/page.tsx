"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import useStudentStore from "@/stores/studentStore";
import { Student } from "@/types";
import { ChevronDown, ChevronUp, MoveLeft } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const StudentsPage = () => {
	const { students, fetchStudents, getStudentsBySection, getUniqueSections } = useStudentStore();
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);
	const sections = getUniqueSections();
    const toggleSection = (section: string) => {
        setExpandedSection(prev => {
            // If clicking the same section, close it
            if (prev === section) {
                return null;
            }
            // Otherwise, expand the new section
            return section;
        });
    };

	// Check if a section is expanded
	const isSectionExpanded = (section: string) => {
    return expandedSection === section;
};
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
				{sections.map((section, index) => {
                    const isExpanded = isSectionExpanded(section);
                return (
                    
					<div key={section} className="rounded-md p-4">
						<div className="bg-amber-950 p-4 rounded-t-md flex justify-between items-center">
							<h1 className="text-amber-400 text-2xl font-bold">
								Section {section}
							</h1>
                            {isExpanded?(

                                <ChevronUp
                                onClick={() => toggleSection(section)}
								size={30}
								className="font-bold text-gray-700"
                                />
                            ):(
                                <ChevronDown
                                onClick={() => toggleSection(section)}
								size={30}
								className="font-bold text-gray-700"
                                />
                            ) }
						</div>
						<div className={`bg-gray-700 p-3 rounded-b-md ${isExpanded ? 'block' : 'hidden'}`}>
							<div className="flex p-2 gap-3 text-2xl text-amber-400 font-semibold">
								<p>Begena Id</p>
								<p>Full Name</p>
							</div>
							{getStudentsBySection(section).map((student) => (
								<div
									key={student._id}
									className="text-white p-2 flex gap-3 "
								>
									<p className="">{student.begenaId}</p>
									<p>{student.fullName}</p>
								</div>
							))}
						</div>
					</div>
				)})}
			</div>
		</div>
	);
};

export default StudentsPage;
