"use client";
import React, { useEffect, useState } from "react";
import { Announcement } from "@/types";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

const UserAnnouncement = () => {
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const fetchAnnouncements = async () => {
		try {
			const res = await api.get("/announcements");
			console.log("success");
			setAnnouncements(res.data.announcements);
		} catch (err: unknown) {
			console.error(err);
			toast.error("Failed to fetch announcements");
		}
	};
	useEffect(() => {
		fetchAnnouncements();
	}, []); 
	return (
		<div className="text-gray-300 mt-6">
			{announcements.length  > 0 && (
				<div
					key={announcements[0]._id}
					className="bg-gradient-to-r from-black to-amber-700 text-white p-6 rounded-lg mb-5 mx-5"
				>
					<h3 className="text-2xl text-amber-400">
						{announcements[0].title}
					</h3>
					<p className="text-white text-xl mt-2 p-5">
						{announcements[0].body}
					</p>
					<div className="flex gap-4 items-center justify-center my-5 ">
						<Button className="h-auto py-3 text-md bg-amber-600 hover:bg-amber-700 whitespace-normal break-words min-h-[60px]">
							{announcements[0].date}{" "}
						</Button>
						<Button className=" h-auto py-3 text-md bg-amber-600 hover:bg-amber-700 whitespace-normal break-words min-h-[60px]">
							{announcements[0].time}
						</Button>
					</div>
					<p className="text-amber-400 text-2xl text-center mt-2">የ አ/አ/ሳ/ቴ/ዪ የበገና ክፍል</p>
				</div>
			)}
		</div>
	);
};

export default UserAnnouncement;
