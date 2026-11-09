"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageContainer } from "./ui/page";
import { cn } from "@/lib/utils";
import { getValidToken, isTeacher, removeToken, getValidStudentToken, removeStudentToken } from "@/lib/auth";

const links = [
  { href: "/schedule", label: "የትምህርት ሰዓት" },
  { href: "/students", label: "ተማሪዎች" },
  { href: "/teachers", label: "መምህራን" },
  { href: "/mezmurlist", label: "ዝማሬዎች" },
  { href: "/payment", label: "ክፍያ" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminHref, setAdminHref] = useState("/admin/login");

  useEffect(() => {
    const studentToken = getValidStudentToken();
    setIsStudentLoggedIn(Boolean(studentToken));

    const token = getValidToken();
    if (token) {
      if (isTeacher()) {
        setIsTeacherLoggedIn(true);
        setIsAdminLoggedIn(false);
        setAdminHref("/admin");
      } else {
        setIsTeacherLoggedIn(false);
        setIsAdminLoggedIn(true);
        setAdminHref("/admin");
      }
    } else {
      setIsTeacherLoggedIn(false);
      setIsAdminLoggedIn(false);
      setAdminHref("/admin/login");
    }
  }, [pathname]);

  return (
    <header className="bg-background/85 sticky top-0 z-50 border-b border-white/5 backdrop-blur">
      <PageContainer className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-6 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="የበገና አርማ"
              width={28}
              height={44}
              className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary text-lg font-bold tracking-wide">
              በገና
            </span>
            <span className="text-muted-foreground hidden text-xs sm:inline">
              ንዑስ ክፍል
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {(isTeacherLoggedIn || isAdminLoggedIn) && (
            <Link
              href="/admin"
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors mr-1",
                pathname.startsWith("/admin")
                  ? "text-primary bg-primary/20"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              {isAdminLoggedIn ? "Admin Dashboard" : "መምህር / Staff Portal"}
            </Link>
          )}
          {isStudentLoggedIn && (
            <Link
              href="/student/dashboard"
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors mr-1",
                pathname === "/student/dashboard"
                  ? "text-primary bg-primary/20"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              Dashboard
            </Link>
          )}
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
          {isStudentLoggedIn ? (
            <>
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold">
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeStudentToken();
                  window.location.href = "/student/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Logout
              </Button>
            </>
          ) : (isTeacherLoggedIn || isAdminLoggedIn) ? (
            <>
              <Button
                asChild
                size="sm"
                className={isTeacherLoggedIn ? "bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold" : ""}
              >
                <Link href="/admin">{isTeacherLoggedIn ? "Staff Dashboard" : "Admin"}</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeToken();
                  window.location.href = "/admin/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/student/login">🎓 ተማሪ</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={adminHref}>Admin</Link>
              </Button>
            </>
          )}
        </div>
      </PageContainer>

      {/* On small screens the primary links move to a scrollable strip under the bar. */}
      <nav className="w-full max-w-full overflow-hidden border-t border-white/5 md:hidden">
        <PageContainer className="flex gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {(isTeacherLoggedIn || isAdminLoggedIn) && (
            <Link
              href="/admin"
              className={cn(
                "rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors font-semibold",
                pathname.startsWith("/admin")
                  ? "text-primary bg-primary/20"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              {isAdminLoggedIn ? "Admin Dashboard" : "መምህር Portal"}
            </Link>
          )}
          {isStudentLoggedIn && (
            <Link
              href="/student/dashboard"
              className={cn(
                "rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors font-semibold",
                pathname === "/student/dashboard"
                  ? "text-primary bg-primary/20"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              Dashboard
            </Link>
          )}
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
