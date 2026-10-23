import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import Figure from "@/components/ui/figure";
import { PageBody, PageContainer, Panel } from "@/components/ui/page";
import PhotoPanel from "@/components/ui/photo-panel";
import UserAnnouncement from "@/components/userAnnouncement";
import { siteImages } from "@/lib/images";
import Link from "next/link";
import React from "react";
import Navbar from "@/components/Navbar";

const quickLinks = [
  {
    href: "/teachers",
    emoji: "👨‍🏫",
    title: "የመምህራን እና አሰልጣኞች ዝርዝር",
    description: "የበገና፣ የመሰንቆና የክራር መምህራን እና አሰልጣኞችን ይመልከቱ።",
  },
  {
    href: "/mezmurlist",
    emoji: "🎵",
    title: "የበገና ዝማሬዎች ማውጫ",
    description:
      "መጋቤ ስብሃት አለሙ አጋ፣ አለቃ ተሰማ፣ ደምሴ ደስታ፣ ዘርፉ ደምሴ እና ሌሎችም ደርዳሪዎች።",
  },
  {
    href: "/schedule",
    emoji: "📅",
    title: "የትምህርት ክፍለ-ጊዜ",
    description: "የዚህ ሳምንት የቤዚክ እና የአድቫንስ ክፍሎች ሰዓት።",
  },
  {
    href: "/students",
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
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />

      <PageBody>
        <PageContainer className="space-y-10">
          {/* Hero */}
          <section className="space-y-5">
            <Figure
              src={siteImages.hero}
              alt="የበገና መሳሪያ"
              ratio="auto"
              className="w-full max-w-full h-[260px] sm:h-[360px] md:h-[420px]"
              priority
              scrim
            >
              <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                የ አ/አ/ሳ/ቴ/ዪ ግቢ ጉባኤ
              </p>
              <h1 className="mt-1.5 text-3xl font-bold sm:text-4xl">
                የበገና ንዑስ ክፍል
              </h1>
            </Figure>

            <p className="text-muted-foreground max-w-prose text-sm leading-relaxed sm:text-base">
              እንኳን ወደ በገና ቦት በሰላም መጡ። የትምህርት ክፍለ-ጊዜዎን፣ ወርሃዊ ክፍያዎን እና የክትትል
              ሁኔታዎን በአንድ ቦታ ይከታተሉ።
            </p>
          </section>

          <UserAnnouncement />

          {/* Primary actions */}
          <section className="grid gap-4 sm:grid-cols-2">
            <PhotoPanel
              src={siteImages.begenaMisc04}
              className="border-primary/25"
              contentClassName="p-5 flex flex-col h-full"
            >
              <span className="text-2xl">🎓</span>
              <h2 className="mt-3 text-lg font-semibold">የተማሪዎች ፖርታል</h2>
              <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-relaxed">
                በተማሪ ID እና ይለፍ ቃል በመግባት የእርስዎን የትምህርት ክፍለ-ጊዜ፣ የክፍያ ታሪክ እና የክትትል
                ሁኔታ ይመልከቱ።
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/student/login">ወደ ተማሪ ፖርታል ይግቡ</Link>
              </Button>
            </PhotoPanel>

            <PhotoPanel
              src={siteImages.orthodoxChurch}
              className="border-primary/25"
              contentClassName="p-5 flex flex-col h-full"
            >
              <span className="text-2xl">💳</span>
              <h2 className="mt-3 text-lg font-semibold">ወርሃዊ ክፍያ</h2>
              <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-relaxed">
                በተጠቀሰው አካውንት ቁጥር ወርሃዊ ክፍያዎን ከፍለው የክፍያ ደረሰኝ Screenshot በ IDዎ ይላኩ።
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/payment">ክፍያ ለመፈጸም</Link>
              </Button>
            </PhotoPanel>
          </section>

          {/* Secondary links */}
          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              ሌሎች ገጾች
            </h2>
            <PhotoPanel src={siteImages.lalibelaPriest} contentClassName="p-0">
              <div className="divide-y divide-white/10 overflow-hidden rounded-xl">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:bg-white/[0.05] group flex items-start gap-4 px-4 py-4 transition-colors"
                  >
                    <span className="text-xl leading-none">{link.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="group-hover:text-primary block font-medium transition-colors">
                        {link.title}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block text-sm leading-relaxed">
                        {link.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-muted-foreground group-hover:text-primary mt-0.5 transition-colors"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </PhotoPanel>
          </section>

          {/* About */}
          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              ስለ በገና ክፍሉ
            </h2>

            <Figure
              src={siteImages.about}
              alt="የበገና ንዑስ ክፍል ተማሪዎች"
              ratio="wide"
            />

            <Panel className="p-5">
              <h3 className="font-semibold">የበገና ንዑስ ክፍሉ ዓላማ</h3>
              <ul className="mt-3 space-y-2.5">
                {goals.map((goal) => (
                  <li key={goal} className="flex gap-3 text-sm leading-relaxed">
                    <span aria-hidden className="text-primary/60 mt-1.5">
                      <span className="bg-primary/60 block size-1.5 rounded-full" />
                    </span>
                    <span className="text-muted-foreground">{goal}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        </PageContainer>
      </PageBody>

      <Footer />
    </div>
  );
};

export default Home;
