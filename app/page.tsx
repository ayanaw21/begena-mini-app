import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserAnnouncement from "@/components/userAnnouncement";
import Link from "next/link";
import React from "react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800 flex flex-col">
      <UserAnnouncement />
      <Navbar />

      <div className="mt-4 flex flex-col items-center text-center justify-center py-6 font-bold px-4">
        <h1 className="text-amber-400 text-3xl sm:text-4xl leading-snug">
          የ አ/አ/ሳ/ቴ/ዪ <br /> የበገና ንዑስ ክፍል
        </h1>
        <h3 className="text-lg text-gray-400 mt-3 font-medium">
          እንኳን ወደ በገና ቦት በሰላም መጡ!
        </h3>
      </div>

      <div className="px-4 sm:px-8 space-y-5">
        {/* Student Portal Login Card */}
        <Card className="bg-gray-800 border-amber-950 hover:border-amber-400 transition-colors">
          <CardHeader className="p-5">
            <CardTitle className="text-center text-xl text-amber-400 font-bold">
              🎓 የተማሪዎች ፖርታል (Student Portal)
            </CardTitle>
            <CardDescription className="text-center mt-1 text-gray-300 text-xs sm:text-sm">
              በተማሪ ID እና ይለፍ ቃል በመግባት የእርስዎን የትምህርት ክፍለ-ጊዜ፣ የክፍያ ታሪክ እና የክትትል ሁኔታ ይመልከቱ፡፡
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-5 pt-0">
            <Link href={"/student/login"}>
              <Button className="w-full py-3 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-gray-950">
                🎓 ወደ ተማሪ ፖርታል ለመግባት (Student Login)
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Submit Monthly Payment Card */}
        <Card className="bg-gray-800 border-amber-950 hover:border-amber-400 transition-colors">
          <CardHeader className="p-5">
            <CardTitle className="text-center text-xl text-amber-400 font-bold">
              💳 ለበገና ሠልጣኞች (Monthly Payment)
            </CardTitle>
            <CardDescription className="text-center mt-1 text-gray-300 text-xs sm:text-sm">
              በተጠቀሰው አካውንት ቁጥር ወርሃዊ ክፍያዎን ከፍለው የክፍያ ደረሰኝ Screenshot በ IDዎ ይላኩ፡፡
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-5 pt-0">
            <Link href={"/payment"}>
              <Button className="w-full py-3 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-gray-950">
                💳 ወርሃዊ ክፍያ ለመፈጸም (Submit Payment)
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mezmur List Card */}
        <Card className="bg-gray-800 border-amber-950 hover:border-amber-400 transition-colors">
          <CardHeader className="p-5">
            <CardTitle className="text-center text-xl text-amber-400 font-bold">
              🎵 የበገና ዝማሬዎች ማውጫ
            </CardTitle>
            <CardDescription className="text-center mt-1 text-gray-300 text-xs sm:text-sm">
              የተለያዩ የበገና ደርዳሪዎችን ዝማሬ እዚህ ጋር ያገኛሉ (መጋቤ ስብሃት አለሙ አጋ፣ አለቃ ተሰማ፣ ደምሴ ደስታ፣ ዘርፉ ደምሴ...)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-5 pt-0">
            <Link href={"/mezmurlist"}>
              <Button className="w-full py-3 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-gray-950">
                🎵 የበገና ዝማሬዎችን ለማግኘት
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card className="bg-gray-800 border-amber-950 hover:border-amber-400 transition-colors">
          <CardHeader className="p-5">
            <CardTitle className="text-center text-xl text-amber-400 font-bold">
              📅 Class Schedule
            </CardTitle>
            <CardDescription className="text-center mt-1 text-gray-300 text-xs sm:text-sm">
              የዚህ ሳምንት የትምህርት ሰዓቶችን ለማየት እዚህ ጋር ይጫኑ
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center flex gap-3 pb-5 pt-0">
            <Link href={"/schedule"} className="flex-1">
              <Button className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold text-xs sm:text-sm">
                የትምህርት ክፍለ-ጊዜ
              </Button>
            </Link>
            <Link href={"/students"} className="flex-1">
              <Button className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold text-xs sm:text-sm">
                የተማሪዎች ሊስት
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <div className="px-4 sm:px-8 mt-8 mb-6">
        <h2 className="text-center text-xl text-amber-400 font-bold mb-4">
          ስለ በገና ክፍሉ
        </h2>
        <div className="border border-amber-900 bg-gray-800 p-4 sm:p-5 rounded-lg">
          <h3 className="text-lg text-white mb-2 font-bold">የበገና ንዑስ ክፍሉ</h3>
          <ul className="text-gray-400 list-disc list-inside space-y-1.5 text-xs sm:text-sm">
            <li>ስለ በገና ጥናት እንዲሁም ትርጉም አመጣጥ ታሪክ ለአባላት ግንዛቤ እንዲኖራቸው ማድረግ</li>
            <li>በቤዚክ የበገና ስልጠና ተማሪዎችን በማስተማር ማስመረቅ</li>
            <li>የአድቫንስ የበገና ስልጠናን መስጠት</li>
            <li>በተለያዩ ጉባኤያት እና ዝክሮች ላይ የበገና ዝማሬ አገልግሎት በክፍሉ ዘማሪያን ማቅረብ</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
