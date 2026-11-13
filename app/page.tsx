import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import Figure from "@/components/ui/figure";
import { PageBody, PageContainer, Panel } from "@/components/ui/page";
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
    title: "የመምህራን እና አሰልጣኞች ዝርዝር",
    description: "የበገና፣ የመሰንቆና የክራር መምህራን እና አሰልጣኞችን ይመልከቱ።",
  },
  {
    href: "/mezmurlist",
    icon: Music,
    emoji: "🎵",
    title: "የበገና ዝማሬዎች ማውጫ",
    description:
      "መጋቤ ስብሃት አለሙ አጋ፣ አለቃ ተሰማ፣ ደምሴ ደስታ፣ ዘርፉ ደምሴ እና ሌሎችም ደርዳሪዎች።",
  },
  {
    href: "/schedule",
    icon: CalendarDays,
    emoji: "📅",
    title: "የትምህርት ክፍለ-ጊዜ",
    description: "የዚህ ሳምንት የቤዚክ እና የአድቫንስ ክፍሎች ሰዓት።",
  },
  {
    href: "/students",
    icon: Users,
    emoji: "👥",
    title: "የተማሪዎች ዝርዝር",
    description: "በየምድቡ የተመደቡ ተማሪዎችን ይመልከቱ።",
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
        {/* Full-width Hero Banner spanning 100% screen width on desktop */}
        <section className="relative w-full overflow-hidden border-b border-white/10 bg-surface/40">
          <div className="relative h-[380px] sm:h-[480px] md:h-[540px] lg:h-[600px] w-full">
            <Image
              src={siteImages.hero}
              alt="የበገና መሳሪያ"
              fill
              priority
              placeholder="blur"
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Scrim gradients for high-contrast typography on any screen */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent hidden md:block" />

            {/* Overlaid Hero Content */}
            <div className="absolute inset-0 flex items-end">
              <PageContainer size="wide" className="pb-10 sm:pb-14 lg:pb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold tracking-widest uppercase backdrop-blur-md">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  አ/አ/ሳ/ቴ/ዩ ግቢ ጉባኤ
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-md">
                  በገና ንዑስ ክፍል
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                  የስልጠና ክፍለ-ጊዜዎን፣ ወርሃዊ ክፍያዎን እና የክትትል ሁኔታዎን በአንድ ቦታ ይከታተሉ።
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                    <Link href="/student/login">🎓 ወደ ተማሪ ፖርታል</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/15 bg-white/5 hover:bg-white/10 text-foreground">
                    <Link href="/schedule">📅 የትምህርት ሰዓት</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                    <Link href="/payment">💳 ወርሃዊ ክፍያ</Link>
                  </Button>
                </div>
              </PageContainer>
            </div>
          </div>
        </section>

        {/* Main Body Content inside Wide Responsive Container */}
        <PageContainer size="wide" className="py-10 sm:py-14 lg:py-16 space-y-12 sm:space-y-16">
          {/* Announcements Banner */}
          <UserAnnouncement />

          {/* Primary Action Cards (2-column layout on tablet/desktop) */}
          <section className="space-y-4">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              ዋና አገልግሎቶች
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <PhotoPanel
                src={siteImages.begenaMisc04}
                className="border-primary/25 rounded-2xl shadow-sm"
                contentClassName="p-6 sm:p-8 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 text-2xl flex items-center justify-center mb-4">
                    🎓
                  </div>
                  <h3 className="text-xl font-bold text-foreground">የተማሪዎች ፖርታል</h3>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
                    በተማሪ ID እና ይለፍ ቃል በመግባት የእርስዎን የትምህርት ክፍለ-ጊዜ፣ የክፍያ ታሪክ እና የክትትል
                    ሁኔታ ይመልከቱ።
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button asChild className="w-full sm:w-auto px-6 font-semibold">
                    <Link href="/student/login">ወደ ተማሪ ፖርታል ይግቡ →</Link>
                  </Button>
                </div>
              </PhotoPanel>

              <PhotoPanel
                src={siteImages.orthodoxChurch}
                className="border-primary/25 rounded-2xl shadow-sm"
                contentClassName="p-6 sm:p-8 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 text-2xl flex items-center justify-center mb-4">
                    💳
                  </div>
                  <h3 className="text-xl font-bold text-foreground">ወርሃዊ ክፍያ</h3>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
                    በተጠቀሰው የባንክ አካውንት ቁጥር ወርሃዊ ክፍያዎን ከፍለው የክፍያ ደረሰኝ Screenshot በ IDዎ ይላኩ።
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button asChild variant="outline" className="w-full sm:w-auto px-6 border-white/15 bg-white/5 hover:bg-white/10 font-semibold">
                    <Link href="/payment">ክፍያ ለመፈጸም →</Link>
                  </Button>
                </div>
              </PhotoPanel>
            </div>
          </section>

          {/* Quick Links: Modern 4-Column Card Grid on Desktop */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                ፈጣን ማውጫዎች
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-surface/70 p-5 hover:border-primary/50 hover:bg-surface/90 hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{link.emoji}</span>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* About Section: 2-Column Desktop Split */}
          <section className="space-y-4">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              ስለ በገና ክፍሉ
            </h2>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
              {/* Photo on left */}
              <div className="relative min-h-[300px] lg:min-h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-sm">
                <Image
                  src={siteImages.about}
                  alt="የበገና ንዑስ ክፍል ተማሪዎች"
                  fill
                  placeholder="blur"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider">የአገልግሎት ዘመን</span>
                    <p className="text-white text-base font-semibold mt-1">የበገና ንዑስ ክፍል ተማሪዎችና አገልጋዮች</p>
                  </div>
                </div>
              </div>

              {/* Goals on right */}
              <Panel className="p-6 sm:p-8 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-3">
                    <span className="size-2 rounded-full bg-primary" />
                    ራዕይ እና ተልዕኮ
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">የበገና ንዑስ ክፍሉ ዓላማ</h3>
                  <ul className="mt-5 space-y-3.5">
                    {goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed">
                        <span aria-hidden className="text-primary mt-1 shrink-0 font-bold">
                          ✓
                        </span>
                        <span className="text-muted-foreground">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between text-xs text-muted-foreground">
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
