// AdminSidebar.tsx
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/sections", label: "Sections" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/announcements", label: "Announcements" },
    { href: "/admin/schedules", label: "Class Schedules" },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 border-amber-400 text-amber-400 h-10 w-10 p-0 flex items-center justify-center"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-800 p-4 border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:ml-0
        `}
      >
        <div className="lg:hidden mb-6 pt-12">
          {" "}
          <h2 className="text-amber-400 text-lg font-bold">Menu</h2>
        </div>

        <ul className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-amber-400 hover:text-amber-600 block py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
