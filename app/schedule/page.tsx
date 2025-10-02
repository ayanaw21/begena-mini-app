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
  const [selectedSection, setSelectedSection] = useState('All');
	const fetchSchedules = async () => {
		try {
			const res = await api.get("/class-schedules");
			console.log(res);
			setSchedules(res.data.schedules);
		} catch (err: unknown) {
			console.error(err);
			toast.error("Failed to fetch announcements");
		}
	};
	useEffect(() => {
		fetchSchedules();
	}, []);

   const filteredSchedules = schedules.filter(schedule => {
    const typeMatch = isBasic ? schedule.type === 'basic' : schedule.type === 'advanced';
    return typeMatch
  });

  // const filteredSections = ['All', ...new Set(filteredSchedules.map(schedule => schedule.section))];
  // console.log(filteredSchedules);


	return (
		<div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800">
			<Navbar />
			<div className="flex justify-between items-center mt-10 px-8">
				<h1 className="text-4xl text-amber-400">የትምህርት ሰዓት</h1>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
					<Link href="/student_list">
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

			<div className="bg-gray-800 border border-amber-950 p-8 m-8 rounded-md">
				<h1></h1>
				<div className="gap-4 flex flex-col">
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

       {/* <div className="bg-gray-800 border border-amber-950 p-4 mt-4">
        <select 
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded text-center"
        >
          {filteredSections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </div> */}

       <div className="p-8">
        {filteredSchedules.map(schedule => (
          <div key={schedule._id} className="bg-gray-800 p-4 rounded-lg mb-4 text-white">
            <h3 className="text-amber-400 text-xl">Section: {schedule.section}</h3>
            <p>ቀን: {schedule.date}</p>
            <p>ሰዓት: {schedule.time}</p>
            {/* <p>Type: {schedule.type}</p> */}
          </div>
        ))}
        {filteredSchedules.length === 0 && (
          <p className="text-white text-center">No schedules found</p>
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
