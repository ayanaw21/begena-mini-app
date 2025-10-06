"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ClassSchedule } from "@/types";
import { MoveLeft } from "lucide-react";
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

	return (
		<div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800">
			<Navbar />
			<div className="flex justify-between items-center mt-10 px-8">
				<h1 className="text-4xl text-amber-400">የትምህርት ሰዓት</h1>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
					<Link href="/students">
						<Button className="text-2xl text-amber-400 bg-gray-700 border-amber-400">
							Students
						</Button>
					</Link>
					<Link href="/">
						<Button className="text-2xl text-gray-100 bg-gray-700 border-amber-400 ">
							<MoveLeft /> ለመመለስ
						</Button>
					</Link>
				</div>
			</div>

			{/* Type Selector */}
			<div className="bg-gray-800 border border-amber-950 p-8 m-8 rounded-md">
				<h1 className="text-3xl text-amber-400">ቤዚክ ወይስ አድቫንስ?</h1>
				<div className="gap-4 flex flex-col mt-3">
					<Button
						className={`text-md text-gray-100 whitespace-normal break-words min-h-[60px] ${
							isBasic ? "bg-amber-600" : "bg-gray-700 "
						} `}
						onClick={() => setIsBasic(true)}
					>
						ቤዚክ ተማሪዎች
					</Button>
					<Button
						className={`text-md text-gray-100 whitespace-normal break-words min-h-[60px] ${
							!isBasic ? "bg-amber-600 " : "bg-gray-600"
						} `}
						onClick={() => setIsBasic(false)}
					>
						አድቫንስ ተማሪዎች
					</Button>
				</div>
			</div>

			{/* Section Selector - FIXED: Added container div */}
			<div className="bg-gray-800 border border-amber-950 p-8 m-8 rounded-md">
				<h1 className="text-3xl text-amber-400 mb-4">
					ምድብ (Section) ምረጥ
				</h1>
				<div className="grid grid-cols-2 gap-4">
					<Button
						className={`text-md text-gray-100 whitespace-normal break-words min-h-[60px] ${
							selectedSection === "All"
								? "bg-amber-600"
								: "bg-gray-700"
						}`}
						onClick={() => setSelectedSection("All")}
					>
						ሁሉም
					</Button>
					{availableSections.map((section) => (
						<Button
							key={section}
							className={`text-md text-gray-100 whitespace-normal break-words min-h-[60px] ${
								selectedSection === section
									? "bg-amber-600"
									: "bg-gray-700"
							}`}
							onClick={() => setSelectedSection(section)}
						>
							{section}
						</Button>
					))}
				</div>
			</div>

			{/* Display Schedules */}
			<div className="bg-gray-800 border border-amber-950 p-8 m-8 rounded-md">
				<h2 className="bg-amber-900 rounded-t-md p-3 text-center text-xl text-white">
					{isBasic ? "ቤዚክ" : "አድቫንስ"} የትምህርት ሰዓት{" "}
					{selectedSection !== "All" ? `- ${selectedSection}` : ""}
				</h2>
				
					{filteredSchedules.map((schedule) => (
						<div
							key={schedule._id}
							className="bg-gray-700 p-6 rounded-b-lg mb-4 text-white"
						>
							<h3 className="text-amber-400 text-xl mb-2">
								Section: {schedule.section}
							</h3>
							<p className="text-lg">ቀን: {schedule.date}</p>
							<p className="text-lg">ሰዓት: {schedule.time}</p>
						</div>
					))}
			
				{filteredSchedules.length === 0 && (
					<p className="text-white text-center text-xl bg-gray-700 p-6 rounded-b-lg mb-4">
						ለዚህ ምድብ የትምህርት ሰዓት አልተገኘም
					</p>
				)}
			</div>

			<div className="bg-gray-800 border border-amber-950 p-8 m-8 rounded-md">
				<h1 className="text-2xl text-amber-400">ማሳሰቢያ</h1>
				<ol className="text-gray-400 list-disc list-inside pl-4 space-y-2">
					<li>አቴንዳንስ ግዴታ ስለሆነ ማንም ተማሪ ያለፈቃድ እንዳይቀር። </li>
					<li>
						ሁሉም ሰማሪ በተመደበበት Section ብቻ ነው መማር ሚችለው አስገዳች ችግር ከገጠመው
						ለክላሱ አስተማሪ መናገር አለበት፡፡
					</li>
				</ol>
			</div>
			<Footer />
		</div>
	);
};

export default Schedule;
