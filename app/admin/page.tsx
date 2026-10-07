"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getValidToken } from "@/lib/auth";
import { PageHeader, Panel } from "@/components/ui/page";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Layers,
  Loader2,
  Megaphone,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const sections = [
  {
    heading: "Academics",
    links: [
      {
        href: "/admin/programs",
        icon: BookOpen,
        title: "Programs",
        description: "Begena, Masinko, Kirar and other instruments.",
      },
      {
        href: "/admin/sections",
        icon: Layers,
        title: "Sections & Teachers",
        description: "Main and assistant teacher assignments.",
      },
      {
        href: "/admin/schedules",
        icon: CalendarDays,
        title: "Class Schedules",
        description: "Flexible weekly timetables per section.",
      },
    ],
  },
  {
    heading: "People",
    links: [
      {
        href: "/admin/students",
        icon: Users,
        title: "Students",
        description: "In-person registration and student ID records.",
      },
      {
        href: "/admin/staff",
        icon: UserCog,
        title: "Staff & Instructors",
        description: "Admins, main and assistant staff.",
      },
      {
        href: "/admin/attendance",
        icon: ClipboardCheck,
        title: "Attendance",
        description: "Track present, absent and at-risk students.",
      },
    ],
  },
  {
    heading: "Operations",
    links: [
      {
        href: "/admin/payments",
        icon: CreditCard,
        title: "Payments",
        description: "Verify receipt slips, approve or reject.",
      },
      {
        href: "/admin/announcements",
        icon: Megaphone,
        title: "Announcements",
        description: "Broadcast notices to students.",
      },
    ],
  },
];

export default function AdminHome() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      toast.error("Please log in to continue");
      router.push("/admin/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center gap-3 text-sm">
        <Loader2 size={18} className="text-primary animate-spin" />
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Control panel"
        description="Manage programs, students, schedules and payments for the Begena class."
      />

      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            {section.heading}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <Panel className="hover:border-primary/30 h-full p-5 transition-colors">
                    <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                      <Icon size={17} />
                    </span>
                    <h3 className="group-hover:text-primary mt-3 font-semibold transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {link.description}
                    </p>
                  </Panel>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
