"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="h-16 border-b border-gray-700 w-full flex justify-between items-center px-4 sm:px-6 bg-gray-900">
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-2xl text-amber-400 font-bold tracking-wide">በገና</h1>
      </Link>

      <div className="flex items-center gap-2">
        {pathname !== "/" && (
          <Link href="/">
            <Button className="text-xs font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900/60 px-2.5 py-1.5 h-auto">
              Home
            </Button>
          </Link>
        )}

        <Link href="/student/login">
          <Button className="text-xs font-bold text-amber-400 bg-gray-800 border border-amber-900 hover:bg-amber-900/60 px-2.5 py-1.5 h-auto">
            🎓 ተማሪ
          </Button>
        </Link>

        <Link href="/admin/login">
          <Button className="text-xs font-bold text-amber-400 bg-amber-900 hover:bg-amber-800 px-2.5 py-1.5 h-auto">
            Admin
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;