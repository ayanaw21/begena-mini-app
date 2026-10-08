import Link from "next/link";
import React from "react";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
import {
  PageBody,
  PageContainer,
  Panel,
} from "@/components/ui/page";

const lists = [
  { zemari: "ደምሴ ደስታ", link: "https://t.me/aastugibibuaebegena/4" },
  {
    zemari: "አለቃ ተሰማ ወልደ አማኑኤል (አባ በገና)",
    link: "https://t.me/aastugibibuaebegena/6",
  },
  { zemari: "መጋቤ ስብሃት አለሙ አጋ", link: "https://t.me/aastugibibuaebegena/2" },
  { zemari: "ዲ/ን አቤል ተስፋዬ", link: "https://t.me/aastugibibuaebegena/18" },
  { zemari: "ዘርፉ ደምሴ", link: "https://t.me/aastugibibuaebegena/214" },
  { zemari: "ሲሳይ ደምሴ", link: "https://t.me/aastugibibuaebegena/10" },
  { zemari: "መሪጌታ ፍቅሩ ሳህሉ", link: "https://t.me/aastugibibuaebegena/8" },
  { zemari: "ታፈሰ ተስፋዬ", link: "https://t.me/aastugibibuaebegena/12" },
];

const MezmurList = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <PageBody>
        <PageContainer className="space-y-8">
          <Figure
            src={siteImages.mezmurHero}
            alt="ባህላዊ በገና"
            ratio="ultrawide"
            priority
            scrim
          >
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              🎵 ዝማሬዎች
            </p>
            <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
              የበገና ደርዳሪዎች ዝርዝር
            </h1>
          </Figure>

          <p className="text-muted-foreground max-w-prose text-sm">
            መዝሙሮችን ለማግኘት የዘማሪውን ስም ይጫኑ። አገናኙ ወደ ቴሌግራም ቻናል ይወስድዎታል።
          </p>

          <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5">
            {lists.map((list) => (
              <li key={list.zemari}>
                <Link
                  href={list.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-surface group flex items-center gap-4 px-4 py-3.5 transition-colors"
                >
                  <span
                    aria-hidden
                    className="bg-primary/10 text-primary ring-primary/20 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1"
                  >
                    {list.zemari.trim().charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="group-hover:text-primary truncate font-medium transition-colors">
                      {list.zemari}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      የበገና መዝሙሮች ጋር ለመድረስ ይጫኑ
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Panel className="overflow-hidden">
            <Figure
              src={siteImages.begenaHistory}
              alt="በገና በኢትዮጵያ"
              ratio="wide"
              className="rounded-none border-0 border-b border-white/5"
            />
            <div className="p-5">
              <h2 className="font-semibold">በገና በኢትዮጵያ</h2>
              <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
                <p>
                  በገና በኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን የዜማ መሳሪያ ሲሆን በዋናነት ለመለኮታዊ
                  የእግዚአብሔር ፈቃድ ማስፈጸሚያ ማለትም ለምስጋናና ለልመና የሚያገለግል ነው። በገና ከብሉይ ኪዳን
                  የመጀመሪያ መጽሐፍ ከኦሪት ዘፍጥረት እስከ መጨረሻው የአዲስ ኪዳን መጽሐፍ ዮሐንስ ራእይ ድረስ
                  አገልግሎቱ የተጠቀሰ እጅግ ድንቅ መንፈሳዊ የዜማ መሳሪያ ነው።
                </p>
                <p>
                  ከላይ የተጠቀሱት የበገና ደርዳሪያንም በገና በኢትዮጵያ ከትውልድ ወደ ትውልድ እንዲሸጋገርና ለበገና
                  ትምህርት መስፋፋት እጅጉን ትልቁን ድርሻ የተወጡ ናቸው።
                </p>
              </div>
            </div>
          </Panel>
        </PageContainer>
      </PageBody>

      <Footer />
    </div>
  );
};

export default MezmurList;
