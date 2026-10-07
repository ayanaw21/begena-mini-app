import React from "react";
import Link from "next/link";

import { PageContainer } from "./ui/page";

const Footer = () => {
	return (
		<footer className="mt-auto border-t border-white/5">
			<PageContainer className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-muted-foreground text-xs">
					© 2025 የአ/አ/ሳ/ቴ/ዩ የበገና ንዑስ ክፍል
				</p>
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
