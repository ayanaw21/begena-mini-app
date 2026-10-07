"use client";
import React, { useEffect, useState } from "react";
import { Announcement } from "@/types";
import api from "@/lib/api";
import toast from "react-hot-toast";

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
		<>
			{announcements.length > 0 && (
				<div
					key={announcements[0]._id}
					className="border-primary/25 bg-primary/5 rounded-xl border p-4"
				>
					<div className="flex flex-wrap items-center gap-2">
						<span className="bg-primary/15 text-primary rounded px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
							ማስታወቂያ
						</span>
						<span className="text-muted-foreground text-xs">
							{announcements[0].date} · {announcements[0].time}
						</span>
					</div>

					<h3 className="mt-2 text-base font-semibold">
						{announcements[0].title}
					</h3>
					<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
						{announcements[0].body}
					</p>
				</div>
			)}
		</>
	);
};

export default UserAnnouncement;
