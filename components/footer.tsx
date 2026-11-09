import React from "react";
import Link from "next/link";
import Image from "next/image";

import { PageContainer } from "./ui/page";

const Footer = () => {
	return (
		<footer className="mt-auto border-t border-white/5">
			<PageContainer className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="relative h-6 w-4 shrink-0 flex items-center justify-center">
						<Image
							src="/logo.jpg"
							alt="የበገና አርማ"
							width={20}
							height={32}
							className="h-full w-auto object-contain opacity-85"
						/>
					</div>
					<p className="text-muted-foreground text-xs">
						© 2025 የአ/አ/ሳ/ቴ/ዩ የበገና ንዑስ ክፍል
					</p>
				</div>
				<nav className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
					<Link href="/schedule" className="hover:text-primary transition-colors">
						የትምህርት ሰዓት
					</Link>
					<Link href="/payment" className="hover:text-primary transition-colors">
						ክፍያ
					</Link>
					<Link href="/mezmurlist" className="hover:text-primary transition-colors">
						ዝማሬዎች
					</Link>
					<Link href="/admin/login" className="hover:text-primary transition-colors">
						Admin
					</Link>
				</nav>
			</PageContainer>
		</footer>
	);
};

export default Footer;
