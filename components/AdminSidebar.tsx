import Link from "next/link";
import React from "react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <ul className="flex flex-col gap-4">
        <li>
          <Link href="/admin" className="text-amber-400 hover:text-amber-600">
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/admin/students"
            className="text-amber-400 hover:text-amber-600"
          >
            Students
          </Link>
        </li>
        <li>
          <Link
            href="/admin/sections"
            className="text-amber-400 hover:text-amber-600"
          >
            Sections
          </Link>
        </li>
        <li>
          <Link
            href="/admin/payments"
            className="text-amber-400 hover:text-amber-600"
          >
            Payments
          </Link>
        </li>
        <li>
          <Link
            href="/admin/announcements"
            className="text-amber-400 hover:text-amber-600"
          >
            Announcements
          </Link>
        </li>
        <li>
          <Link
            href="/admin/schedules"
            className="text-amber-400 hover:text-amber-600"
          >
            Class Schedules
          </Link>
        </li>
      </ul>
    </aside>
  );
}
