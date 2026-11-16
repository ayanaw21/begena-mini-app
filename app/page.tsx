import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PageContainer, Panel } from "@/components/ui/page";
import PhotoPanel from "@/components/ui/photo-panel";
import UserAnnouncement from "@/components/userAnnouncement";
import { siteImages } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navbar from "@/components/Navbar";
import { ArrowRight, CalendarDays, GraduationCap, Music, Users } from "lucide-react";

const quickLinks = [
  {
    href: "/teachers",
    icon: GraduationCap,
    emoji: "👨‍🏫",
    title: "መምህራንና አሰልጣኞች",
    description: "የበገና፣ የመሰንቆና የክራር መምህራን ዝርዝር",
  },
  {
    href: "/mezmurlist",
    icon: Music,
    emoji: "🎵",
    title: "የበገና ዝማሬዎች",
    description: "የቀደምትና ወቅታዊ የበገና ደርዳሪዎች መዝሙራት",
  },
  {
    href: "/schedule",
    icon: CalendarDays,
    emoji: "📅",
    title: "የትምህርት ሰዓት",
    description: "የቤዚክና የአድቫንስ ሳምንታዊ ክፍለ-ጊዜ",
  },
  {
    href: "/students",
    icon: Users,
    emoji: "👥",
    title: "የተማሪዎች ዝርዝር",
    description: "በየምድቡ የተመደቡ ተማሪዎች መዝገብ",
  },
];

const goals = [
  "ስለ በገና ጥናት እንዲሁም ትርጉም አመጣጥ ታሪክ ለአባላት ግንዛቤ እንዲኖራቸው ማድረግ",
  "በቤዚክ የበገና ስልጠና ተማሪዎችን በማስተማር ማስመረቅ",
  "የአድቫንስ የበገና ስልጠናን መስጠት",
  "በተለያዩ ጉባኤያት እና ዝክሮች ላይ የበገና ዝማሬ አገልግሎት በክፍሉ ዘማሪያን ማቅረብ",
];

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Full-width Responsive Hero Banner */}
        <section className="relative w-full overflow-hidden border-b border-white/10 bg-surface/40">
          <div className="relative h-[340px] sm:h-[460px] md:h-[520px] lg:h-[580px] w-full">
            <Image
              src={siteImages.hero}
              alt="የበገና መሳሪያ"
              fill
              priority
              placeholder="blur"
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Scrim gradients for high-contrast typography across viewports */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent hidden sm:block" />

            {/* Overlaid Hero Content */}
            <div className="absolute inset-0 flex items-end">
              <PageContainer size="wide" className="pb-6 sm:pb-12 lg:pb-16 space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] sm:text-xs font-semibold tracking-wider sm:tracking-widest uppercase backdrop-blur-md">
                  <span className="size-1.5 sm:size-2 rounded-full bg-primary animate-pulse" />
                  አ/አ/ሳ/ቴ/ዩ ግቢ ጉባኤ
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-foreground drop-shadow-md">
                  በገና ንዑስ ክፍል
                </h1>
                <p className="text-muted-foreground text-xs sm:text-base lg:text-lg max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                  የስልጠና ክፍለ-ጊዜዎን፣ ወርሃዊ ክፍያዎን እና የክትትል ሁኔታዎን በአንድ ቦታ ይከታተሉ።
                </p>

                {/* Mobile-First Action Suite */}
                <div className="pt-1.5 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 h-11 sm:h-12 px-6">
                    <Link href="/student/login">🎓 ወደ ተማሪ ፖርታል</Link>
                  </Button>
                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-10 sm:h-12 border-white/15 bg-white/5 hover:bg-white/10 text-foreground text-xs sm:text-sm font-semibold">
                      <Link href="/schedule">📅 የትምህርት ሰዓት</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-10 sm:h-12 border-white/15 bg-white/5 hover:bg-white/10 text-foreground text-xs sm:text-sm font-semibold">
                      <Link href="/payment">💳 ወርሃዊ ክፍያ</Link>
                    </Button>
                  </div>
                </div>
              </PageContainer>
            </div>
          </div>
        </section>

        {/* Main Body Content inside Responsive Container */}
        <PageContainer size="wide" className="py-6 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
          {/* Announcements Banner */}
          <UserAnnouncement />

          {/* Quick Access: 2-Column Grid on Mobile, 4-Column on Desktop */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-muted-foreground text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
                ፈጣን ማውጫዎች
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-surface/80 p-3.5 sm:p-5 hover:border-primary/50 hover:bg-surface/95 active:scale-[0.98] transition-all duration-200 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl">{link.emoji}</span>
                      <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all sm:size-4" />
                    </div>
                    <h3 className="mt-2.5 sm:mt-4 font-bold text-foreground group-hover:text-primary transition-colors text-xs sm:text-base leading-snug">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Primary Action Cards: 2-column on tablet/desktop, stacked on mobile */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-muted-foreground text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
              ዋና አገልግሎቶች
            </h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <PhotoPanel
                src={siteImages.begenaMisc04}
                className="border-primary/25 rounded-2xl shadow-sm"
                contentClassName="p-5 sm:p-7 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="size-10 sm:size-12 rounded-xl bg-primary/10 border border-primary/20 text-xl sm:text-2xl flex items-center justify-center mb-3 sm:mb-4">
                    🎓
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">የተማሪዎች ፖርታል</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm leading-relaxed">
                    በተማሪ ID እና ይለፍ ቃል በመግባት የእርስዎን የትምህርት ክፍለ-ጊዜ፣ የክፍያ ታሪክ እና የክትትል
                    ሁኔታ ይመልከቱ።
                  </p>
                </div>
                <div className="mt-5 pt-3 sm:pt-4 border-t border-white/10">
                  <Button asChild className="w-full sm:w-auto px-6 font-semibold h-10 sm:h-11">
                    <Link href="/student/login">ወደ ተማሪ ፖርታል ይግቡ →</Link>
                  </Button>
                </div>
              </PhotoPanel>

              <PhotoPanel
                src={siteImages.orthodoxChurch}
                className="border-primary/25 rounded-2xl shadow-sm"
                contentClassName="p-5 sm:p-7 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="size-10 sm:size-12 rounded-xl bg-primary/10 border border-primary/20 text-xl sm:text-2xl flex items-center justify-center mb-3 sm:mb-4">
                    💳
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">ወርሃዊ ክፍያ</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm leading-relaxed">
                    በተጠቀሰው የባንክ አካውንት ቁጥር ወርሃዊ ክፍያዎን ከፍለው የክፍያ ደረሰኝ Screenshot በ IDዎ ይላኩ።
                  </p>
                </div>
                <div className="mt-5 pt-3 sm:pt-4 border-t border-white/10">
                  <Button asChild variant="outline" className="w-full sm:w-auto px-6 border-white/15 bg-white/5 hover:bg-white/10 font-semibold h-10 sm:h-11">
                    <Link href="/payment">ክፍያ ለመፈጸም →</Link>
                  </Button>
                </div>
              </PhotoPanel>
            </div>
          </section>

          {/* About Section: Responsive Photo & Goals */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-muted-foreground text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
              ስለ በገና ክፍሉ
            </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
              {/* Photo */}
              <div className="relative aspect-[16/9] lg:min-h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-sm">
                <Image
                  src={siteImages.about}
                  alt="የበገና ንዑስ ክፍል ተማሪዎች"
                  fill
                  placeholder="blur"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-4 sm:p-6">
                  <div>
                    <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider">የአገልግሎት ዘመን</span>
                    <p className="text-white text-sm sm:text-base font-bold mt-0.5">የበገና ንዑስ ክፍል ተማሪዎችና አገልጋዮች</p>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <Panel className="p-5 sm:p-7 flex flex-col justify-between rounded-2xl border border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm mb-2 sm:mb-3">
                    <span className="size-2 rounded-full bg-primary" />
                    ራዕይ እና ተልዕኮ
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">የበገና ንዑስ ክፍሉ ዓላማ</h3>
                  <ul className="mt-3.5 sm:mt-5 space-y-2.5 sm:space-y-3.5">
                    {goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-base leading-relaxed">
                        <span aria-hidden className="text-primary mt-0.5 shrink-0 font-bold">
                          ✓
                        </span>
                        <span className="text-muted-foreground">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 items-center justify-between text-xs text-muted-foreground">
                  <span>አ/አ/ሳ/ቴ/ዩ ግቢ ጉባኤ የበገና ንዑስ ክፍል</span>
                  <Link href="/schedule" className="text-primary hover:underline font-medium">
                    የትምህርት ሰዓት ይመልከቱ →
                  </Link>
                </div>
              </Panel>
            </div>
          </section>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
