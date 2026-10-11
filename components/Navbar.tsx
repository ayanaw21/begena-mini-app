"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageContainer } from "./ui/page";
import { cn } from "@/lib/utils";

const links = [
  { href: "/schedule", label: "የትምህርት ሰዓት" },
  { href: "/students", label: "ተማሪዎች" },
  { href: "/mezmurlist", label: "ዝማሬዎች" },
  { href: "/payment", label: "ክፍያ" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [studentHref, setStudentHref] = useState("/student/login");

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    setStudentHref(token ? "/student/dashboard" : "/student/login");
  }, [pathname]);

  return (
    <header className="bg-background/85 sticky top-0 z-50 border-b border-white/5 backdrop-blur">
      <PageContainer className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-primary text-lg font-bold tracking-wide">
            በገና
          </span>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            ንዑስ ክፍል
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={studentHref}>🎓 ተማሪ</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/login">Admin</Link>
          </Button>
        </div>
      </PageContainer>

      {/* On small screens the primary links move to a scrollable strip under the bar. */}
      <nav className="w-full max-w-full overflow-hidden border-t border-white/5 md:hidden">
        <PageContainer className="flex gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </PageContainer>
      </nav>
    </header>
  );
};

export default Navbar;