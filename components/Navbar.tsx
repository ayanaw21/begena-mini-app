"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [studentHref, setStudentHref] = useState("/student/login");

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      setStudentHref("/student/dashboard");
    } else {
      setStudentHref("/student/login");
    }
  }, [pathname]);

  return (
    <nav className="h-16 border-b border-gray-700 w-full flex justify-between items-center px-3 sm:px-6 bg-gray-900 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl text-amber-400 font-bold tracking-wide">በገና</h1>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {pathname !== "/" && (
          <Link href="/">
            <Button className="text-[11px] sm:text-xs font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900/60 px-2 sm:px-3 py-1.5 h-auto">
              Home
            </Button>
          </Link>
        )}

        <Link href={studentHref}>
          <Button className="text-[11px] sm:text-xs font-bold text-amber-400 bg-gray-800 border border-amber-900 hover:bg-amber-900/60 px-2 sm:px-3 py-1.5 h-auto">
            🎓 ተማሪ
          </Button>
        </Link>

        <Link href="/admin/login">
          <Button className="text-[11px] sm:text-xs font-bold text-amber-400 bg-amber-900 hover:bg-amber-800 px-2.5 sm:px-3 py-1.5 h-auto">
            Admin
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;