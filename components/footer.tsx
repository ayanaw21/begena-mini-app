import React from "react";
import Link from "next/link";
import Image from "next/image";

import { PageContainer } from "./ui/page";

const Footer = () => {
	return (
		<footer className="mt-auto border-t border-white/10 bg-background/50">
			<PageContainer size="wide" className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="relative h-7 w-5 shrink-0 flex items-center justify-center">
						<Image
							src="/logo.jpg"
							alt="የበገና አርማ"
							width={20}
							height={32}
							className="h-full w-auto object-contain opacity-85"
						/>
					</div>
					<div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
						<span className="text-primary text-xs font-bold tracking-wider">
							አ/አ/ሳ/ቴ/ዩ
						</span>
						<p className="text-muted-foreground text-xs">
							© {new Date().getFullYear()} የበገና ንዑስ ክፍል. መብቱ በሕግ የተጠበቀ ነው።
						</p>
					</div>
				</div>
				<nav className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-xs">
					<Link href="/schedule" className="hover:text-primary transition-colors">
						የትምህርት ሰዓት
					</Link>
					<Link href="/students" className="hover:text-primary transition-colors">
						ተማሪዎች
					</Link>
					<Link href="/teachers" className="hover:text-primary transition-colors">
						መምህራን
					</Link>
					<Link href="/mezmurlist" className="hover:text-primary transition-colors">
						ዝማሬዎች
					</Link>
					<Link href="/payment" className="hover:text-primary transition-colors">
						ክፍያ
					</Link>
					<Link href="/admin/login" className="hover:text-primary transition-colors text-white/50">
						Admin
					</Link>
				</nav>
			</PageContainer>
		</footer>
	);
};

export default Footer;
