"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getValidToken } from "@/lib/auth";
import PhotoPanel from "@/components/ui/photo-panel";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
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
        image: siteImages.mezmurHero,
      },
      {
        href: "/admin/sections",
        icon: Layers,
        title: "Sections & Teachers",
        description: "Main and assistant teacher assignments.",
        image: siteImages.scheduleBanner,
      },
      {
        href: "/admin/schedules",
        icon: CalendarDays,
        title: "Class Schedules",
        description: "Flexible weekly timetables per section.",
        image: siteImages.scheduleCard,
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
        image: siteImages.studentsBanner,
      },
      {
        href: "/admin/staff",
        icon: UserCog,
        title: "Staff & Instructors",
        description: "Admins, main and assistant staff.",
        image: siteImages.blessingBegena,
      },
      {
        href: "/admin/attendance",
        icon: ClipboardCheck,
        title: "Attendance",
        description: "Track present, absent and at-risk students.",
        image: siteImages.noticeCard,
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
        image: siteImages.paymentBanner,
      },
      {
        href: "/admin/announcements",
        icon: Megaphone,
        title: "Announcements",
        description: "Broadcast notices to students.",
        image: siteImages.begenaGirl,
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
      <Figure
        src={siteImages.zmarieHero}
        alt="Control Panel"
        ratio="wide"
        className="min-h-[200px] sm:min-h-[260px]"
        priority
        scrim
      >
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          አስተዳዳሪ ፖርታል · Admin Dashboard
        </p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl text-foreground">
          የአስተዳዳሪ ቁጥጥር ማዕከል (Control Panel)
        </h1>
        <p className="text-white/80 max-w-2xl text-xs sm:text-sm mt-1">
          የስልጠና ፕሮግራሞችን፣ የተማሪዎች ምዝገባን፣ የምድብ እና የመምህራን ስምሪትን፣ የክፍያ እና የክትትል ሁኔታዎችን በአንድ ቦታ ይቆጣጠሩ።
        </p>
      </Figure>

      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            {section.heading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <PhotoPanel
                    src={link.image}
                    className="hover:border-primary/40 h-full border-white/10 transition-all duration-200 group-hover:shadow-lg"
                    contentClassName="p-5 flex flex-col h-full"
                  >
                    <span className="bg-primary/20 border border-primary/30 text-primary flex size-10 items-center justify-center rounded-lg shadow-sm">
                      <Icon size={19} />
                    </span>
                    <h3 className="group-hover:text-primary mt-3.5 text-base font-semibold transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-relaxed">
                      {link.description}
                    </p>
                    <div className="text-muted-foreground group-hover:text-primary mt-4 flex items-center text-xs font-medium transition-colors">
                      <span>Open management</span>
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </PhotoPanel>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
