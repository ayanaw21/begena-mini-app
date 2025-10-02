"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({
  onToggleSidebar,
  isSidebarOpen,
}: AdminNavbarProps) {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="h-16 bg-gray-800 flex justify-between items-center px-4 sm:px-6 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden bg-gray-800 border-amber-400 text-amber-400 h-10 w-10 p-0 flex items-center justify-center"
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <h1 className="text-amber-400 text-xl sm:text-2xl font-bold truncate">
          Admin Panel
        </h1>
      </div>

      <Button
        className="bg-amber-600 hover:bg-amber-700 text-sm sm:text-base"
        onClick={logout}
        size="sm"
      >
        Logout
      </Button>
    </nav>
  );
}
