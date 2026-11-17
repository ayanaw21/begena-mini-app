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
        setAdminHref("/teacher/dashboard");
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
    <header className="bg-background/95 sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <PageContainer size="wide" className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 lg:gap-8 px-3 sm:px-6">
        {/* Brand logo & title - adaptive sizing for mobile */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 whitespace-nowrap">
          <div className="relative h-8 w-6 sm:h-10 sm:w-7 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="የበገና አርማ"
              width={28}
              height={44}
              className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap shrink-0">
            <span className="text-primary text-sm sm:text-lg font-bold tracking-wide whitespace-nowrap">
              አ/አ/ሳ/ቴ/ዩ
            </span>
            <span className="text-foreground text-xs sm:text-sm font-semibold whitespace-nowrap hidden min-[370px]:inline">
              በገና ንዑስ ክፍል
            </span>
            <span className="text-foreground text-xs font-semibold whitespace-nowrap min-[370px]:hidden">
              በገና
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                pathname === link.href
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side auth buttons - compact & touch-friendly on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {pathname.startsWith("/admin") && (isTeacherLoggedIn || isAdminLoggedIn) ? (
            <>
              <Button
                asChild
                size="sm"
                className={cn(
                  "font-semibold text-xs sm:text-sm shadow-sm h-8 sm:h-9 px-2.5 sm:px-3",
                  isTeacherLoggedIn
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Link href={isTeacherLoggedIn ? "/teacher/dashboard" : "/admin"}>
                  {isTeacherLoggedIn ? "መምህር (Teacher)" : "Admin"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeToken();
                  window.location.href = "/admin/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs h-8 sm:h-9 px-2 sm:px-3"
              >
                Logout
              </Button>
            </>
          ) : pathname.startsWith("/student") && isStudentLoggedIn ? (
            <>
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm">
                <Link href="/student/dashboard">
                  <span className="hidden sm:inline">Portal</span>
                  <span className="sm:hidden">🎓 ፖርታል</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeStudentToken();
                  window.location.href = "/student/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs h-8 sm:h-9 px-2 sm:px-3"
              >
                Logout
              </Button>
            </>
          ) : (isTeacherLoggedIn || isAdminLoggedIn) ? (
            <>
              <Button
                asChild
                size="sm"
                className={cn(
                  "font-semibold text-xs sm:text-sm shadow-sm h-8 sm:h-9 px-2.5 sm:px-3",
                  isTeacherLoggedIn
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Link href={isTeacherLoggedIn ? "/teacher/dashboard" : "/admin"}>
                  {isTeacherLoggedIn ? "መምህር (Teacher)" : "Admin"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeToken();
                  window.location.href = "/admin/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs h-8 sm:h-9 px-2 sm:px-3"
              >
                Logout
              </Button>
            </>
          ) : isStudentLoggedIn ? (
            <>
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm">
                <Link href="/student/dashboard">
                  <span className="hidden sm:inline">Student Portal</span>
                  <span className="sm:hidden">🎓 ፖርታል</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeStudentToken();
                  window.location.href = "/student/login";
                }}
                className="text-muted-foreground hover:text-foreground text-xs h-8 sm:h-9 px-2 sm:px-3"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                <Link href="/student/login">🎓 ተማሪ</Link>
              </Button>
              <Button asChild size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3 font-semibold">
                <Link href={adminHref}>Admin</Link>
              </Button>
            </>
          )}
        </div>
      </PageContainer>

      {/* On small screens the primary links move to a scrollable strip under the bar. */}
      <nav className="w-full max-w-full overflow-hidden border-t border-white/5 md:hidden bg-background/95 backdrop-blur-md">
        <PageContainer size="wide" className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 scrollbar-none touch-pan-x">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors font-medium border shrink-0",
                pathname === link.href
                  ? "border-primary/50 bg-primary/20 text-primary font-semibold shadow-sm"
                  : "border-white/10 text-muted-foreground hover:text-foreground bg-white/[0.03]"
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
