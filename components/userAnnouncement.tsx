"use client";
import React, { useEffect, useState } from "react";
import { Announcement } from "@/types";
import api from "@/lib/api";
import PhotoPanel from "@/components/ui/photo-panel";
import { PanelHeader } from "@/components/ui/page";
import { siteImages } from "@/lib/images";
import { Bell } from "lucide-react";

const UserAnnouncement = () => {
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchAnnouncements = async () => {
		try {
			const res = await api.get("/announcements");
			if (res.data?.announcements) {
				setAnnouncements(res.data.announcements);
			}
		} catch (err: unknown) {
			console.error("Failed to fetch announcements:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAnnouncements();
	}, []);

	if (loading || announcements.length === 0) return null;

	return (
		<PhotoPanel
			src={siteImages.begenaGirl}
			className="border-primary/30 shadow-2xl backdrop-blur"
			contentClassName="p-0"
		>
			<PanelHeader
				title={
					<span className="flex items-center gap-2 text-primary font-semibold">
						<Bell size={18} className="shrink-0" />
						<span>ማስታወቂያዎች (Announcements)</span>
					</span>
				}
				description={`${announcements.length} ማስታወቂያ${announcements.length > 1 ? "ዎች" : ""}`}
			/>

			<ul className="divide-y divide-white/10">
				{announcements.map((item) => (
					<li key={item._id} className="p-5 hover:bg-white/[0.03] transition-colors min-w-0">
						<div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
							<h3 className="text-base font-semibold text-foreground break-words min-w-0">
								{item.title}
							</h3>
							{(item.date || item.time) && (
								<span className="bg-primary/15 text-primary border border-primary/20 rounded-md px-2.5 py-0.5 text-xs font-mono shrink-0">
									{[item.date, item.time].filter(Boolean).join(" · ")}
								</span>
							)}
						</div>
						<p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-line break-words min-w-0">
							{item.body}
						</p>
					</li>
				))}
			</ul>
		</PhotoPanel>
	);
};

export default UserAnnouncement;
