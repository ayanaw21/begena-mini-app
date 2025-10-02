"use client";
import Link from "next/link";
import React from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-800 p-4 border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}
      >
        <div className="lg:hidden mb-6 pt-4">
          <h2 className="text-amber-400 text-lg font-bold">Menu</h2>
        </div>

        <ul className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-amber-400 hover:text-amber-600 block py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
                onClick={onClose}
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
