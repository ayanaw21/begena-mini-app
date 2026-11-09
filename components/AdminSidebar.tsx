"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Layers,
  Megaphone,
  ClipboardCheck,
  UserCog,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { isTeacher } from "@/lib/auth";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const adminMenu = [
  {
    heading: null,
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Academics",
    items: [
      { href: "/admin/programs", label: "Programs", icon: BookOpen },
      { href: "/admin/sections", label: "Sections", icon: Layers },
      { href: "/admin/schedules", label: "Class Schedules", icon: CalendarDays },
    ],
  },
  {
    heading: "People",
    items: [
      { href: "/admin/students", label: "Students", icon: Users },
      { href: "/admin/staff", label: "Staff & Teachers", icon: UserCog },
      { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isTeacherUser, setIsTeacherUser] = React.useState(false);

  React.useEffect(() => {
    setIsTeacherUser(isTeacher());
  }, []);

  const menuToDisplay = adminMenu
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isTeacherUser) {
          if (item.href === "/admin/staff" || item.href === "/admin/payments") {
            return false;
          }
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "bg-surface fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 transition-transform duration-200 ease-out lg:static lg:translate-x-0 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                በ
              </span>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-semibold tracking-wide">
                  Begena Sub-dept
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {isTeacherUser ? "Teacher Portal" : "Admin Portal"}
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menuToDisplay.map((group, index) => (
              <div key={group.heading ?? index} className={index > 0 ? "mt-5" : ""}>
                {group.heading && (
                  <p className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase text-white/40">
                    {group.heading}
                  </p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
