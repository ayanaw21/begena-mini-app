import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../../public/begena.jpg";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import {
  PageBody,
  PageContainer,
  PageHeader,
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
          <PageHeader
            eyebrow="🎵 ዝማሬዎች"
            title="የበገና ደርዳሪዎች ዝርዝር"
            description="መዝሙሮችን ለማግኘት የዘማሪውን ስም ይጫኑ። አገናኙ ወደ ቴሌግራም ቻናል ይወስድዎታል።"
          />

          <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5">
            {lists.map((list) => (
              <li key={list.zemari}>
                <Link
                  href={list.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-surface group flex items-center gap-4 px-4 py-3.5 transition-colors"
                >
                  <Image
                    src={logo}
                    alt=""
                    width={40}
                    height={40}
                    className="ring-primary/20 size-10 shrink-0 rounded-full object-cover ring-1"
                  />
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

          <Panel className="p-5">
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
          </Panel>
        </PageContainer>
      </PageBody>

      <Footer />
    </div>
  );
};

export default MezmurList;
