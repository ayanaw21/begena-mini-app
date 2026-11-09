"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getValidToken, isTeacher, getUserName } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const sections = [
  {
    heading: "የትምህርት ክፍል (Academics)",
    links: [
      {
        href: "/admin/programs",
        icon: BookOpen,
        title: "የስልጠና ፕሮግራሞች",
        description: "የበገና፣ መሰንቆና ሌሎች መሣሪያዎች ፕሮግራሞች አስተዳደር",
      },
      {
        href: "/admin/sections",
        icon: Layers,
        title: "ክፍሎች እና ምድቦች",
        description: "የተማሪዎች ክፍፍልና የመምህራን ስምሪት",
      },
      {
        href: "/admin/schedules",
        icon: CalendarDays,
        title: "የትምህርት ክፍለ-ጊዜ",
        description: "የሳምንቱ የትምህርት ቀናትና ሰዓታት ሰሌዳ",
      },
    ],
  },
  {
    heading: "ተማሪዎችና መምህራን (People)",
    links: [
      {
        href: "/admin/students",
        icon: Users,
        title: "የተማሪዎች ማህደር",
        description: "የተማሪዎች ምዝገባ፣ መታወቂያ እና የትምህርት ደረጃ",
      },
      {
        href: "/admin/staff",
        icon: UserCog,
        title: "መምህራን እና ሠራተኞች",
        description: "ዋና እና ረዳት መምህራን፣ አስተዳዳሪዎች ዝርዝር",
      },
      {
        href: "/admin/attendance",
        icon: ClipboardCheck,
        title: "የአቴንዳንስ ክትትል",
        description: "የዕለት ክትትል መመዝገቢያና የፈቃድ/ቀሪ ሁኔታ",
      },
    ],
  },
  {
    heading: "ክፍያና ማስታወቂያ (Operations)",
    links: [
      {
        href: "/admin/payments",
        icon: CreditCard,
        title: "የክፍያ ማስተዳደሪያ",
        description: "ወርሃዊ ክፍያዎችን መከታተያ እና ዝርዝር መያዣ",
      },
      {
        href: "/admin/announcements",
        icon: Megaphone,
        title: "ማስታወቂያዎች",
        description: "ለተማሪዎች የሚተላለፉ መልዕክቶች እና ማሳወቂያዎች",
      },
    ],
  },
];

export default function AdminHome() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userName, setUserName] = useState("");
  const [userIsTeacher, setUserIsTeacher] = useState(false);

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      toast.error("Please log in to continue");
      router.push("/admin/login");
    } else {
      setUserName(getUserName() || "Staff Member");
      setUserIsTeacher(isTeacher());
      setIsChecking(false);
    }
  }, [router]);

  const visibleSections = sections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        if (userIsTeacher) {
          if (link.href === "/admin/staff" || link.href === "/admin/payments") {
            return false;
          }
        }
        return true;
      }),
    }))
    .filter((sec) => sec.links.length > 0);

  if (isChecking) {
    return (
      <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center gap-3 text-sm">
        <Loader2 size={18} className="text-primary animate-spin" />
        በማጣራት ላይ...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clean Modern Welcome Header */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <Badge tone={userIsTeacher ? "info" : "primary"}>
                {userIsTeacher ? "መምህር" : "አስተዳዳሪና መምህር"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              እንኳን ደህና መጡ፣ {userName}
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              የስልጠና ፕሮግራሞችን፣ የተማሪዎች ምዝገባን፣ የምድብ እና የመምህራን ስምሪትን፣ የክፍያ እና የክትትል ሁኔታዎችን በአንድ ቦታ ይቆጣጠሩ።
            </p>
          </div>
        </div>
      </div>

      {/* Clean Category Grids */}
      {visibleSections.map((section) => (
        <section key={section.heading} className="space-y-3.5">
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
            {section.heading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <div className="rounded-xl border border-white/10 bg-surface p-5 hover:border-primary/40 hover:bg-white/[0.02] transition-all duration-150 flex flex-col h-full shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="size-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                        <Icon size={19} />
                      </span>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors text-xs flex items-center gap-1 font-medium">
                        ይመልከቱ
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <h3 className="text-base font-semibold group-hover:text-primary transition-colors text-foreground">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 flex-1 text-xs sm:text-sm leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
