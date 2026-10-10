"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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

import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";

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
          "bg-surface relative fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-white/10 transition-transform duration-200 ease-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Background photo panel layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Image
            src={siteImages.authPanel}
            alt=""
            aria-hidden
            fill
            priority
            sizes="256px"
            className="object-cover opacity-25"
          />
          <div className="from-surface/90 via-surface/95 to-surface absolute inset-0 bg-gradient-to-b backdrop-blur-xs" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col min-h-0">
          <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-primary text-lg font-bold tracking-wide">
                በገና
              </span>
              <span className="text-muted-foreground text-xs">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {adminMenu.map((group, index) => (
              <div key={group.heading ?? index} className={index > 0 ? "mt-6" : ""}>
                {group.heading && (
                  <p className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    {group.heading}
                  </p>
                )}
                <ul className="space-y-0.5">
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
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary/15 text-primary font-medium border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <Icon size={16} className="shrink-0" />
                          {item.label}
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
