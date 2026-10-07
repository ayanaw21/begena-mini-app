"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";

import { adminMenu } from "./AdminSidebar";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({
  onToggleSidebar,
  isSidebarOpen,
}: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentLabel =
    adminMenu
      .flatMap((group) => group.items)
      .find((item) => item.href === pathname)?.label ?? "Admin";

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="bg-background/85 sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/5 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
        <h1 className="truncate text-base font-semibold sm:text-lg">
          {currentLabel}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" target="_blank">
            <ExternalLink size={14} />
            <span className="hidden sm:inline">View site</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
