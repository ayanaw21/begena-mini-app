import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800">
      <nav className="h-30 border-b border-gray-700 w-full flex justify-between items-center px-10">
        <h1 className="text-3xl text-amber-400 font-bold ">በገና</h1>
        <div className="flex items-center">
          <Link href={"/admin/login"}>
            <Button className="font-bold text-amber-400 bg-amber-800 hover:bg-amber-900">
              Admin
            </Button>
          </Link>
        </div>
      </nav>
      <div className="mt-4 flex flex-col items-center text-center justify-center py-10 font-bold">
        <h1 className="text-amber-400 text-4xl">
          የ አ/አ/ሳ/ቴ/ዪ <br /> የበገና ንዑስ ክፍል
        </h1>
        <h3 className="text-xl text-gray-400 mt-5 ">እንኳን ወደ በገና ቦት በሰላም መጡ!</h3>
      </div>
      <div className="px-10">
        <Card className="mt-6 p-7 bg-gray-800 border-amber-950 hover:border-amber-400">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-amber-400">
              ለበገና ሠልጣኞች
            </CardTitle>
            <CardDescription className="text-center mt-2 text-gray-300 text-md">
              በተጠቀሰው አካውንት ቁጥር ወርሃዊ ክፍያዎትን ከፍለው Screenshot እና ስማችሁን እዚህ ላይ ይላኩ፡፡
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center ">
            <Link href={"/payment"}>
              <Button className="w-full h-auto py-3 text-md bg-amber-600 hover:bg-amber-700 whitespace-normal break-words min-h-[60px]">
                ወርሃዊ ክፍያ ለመፈጸም
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="mt-6 p-7 bg-gray-800 border-amber-950 hover:border-amber-400">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-amber-400">
              የበገና ዝማሬዎች ማውጫ
            </CardTitle>
            <CardDescription className="text-center mt-2 text-gray-300 text-md">
              የተለያዩ የበገና ደርዳሪዎችን ዝማሬ እዚህ ጋር ያገኛሉ፡፡ መጋቤ ስብሃት አለሙ አጋ፣ አለቃ ተሰማ ፣
              ደምሴ ደስታ፤ ዘርፉ ደምሴ እና ሌሎችም...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href={"/mezmurlist"}>
              <Button className="w-full h-auto py-3 text-md bg-amber-600 hover:bg-amber-700 whitespace-normal break-words">
                የበገና ዝማሬዎችን ለማግኘት
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="mt-6 p-7 bg-gray-800 border-amber-950 hover:border-amber-400">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-amber-400">
              Class Schedule
            </CardTitle>
            <CardDescription className="text-center mt-2 text-gray-300 text-md">
              የዚህ ሳምንት የትምህርት ሰዓቶን ለማየት እዚህ ጋር ይጫኑ
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center flex gap-3 items-center justify-center">
            <Link href={"/schedule"}>
              <Button className="bg-amber-600 hover:bg-amber-700 h-25 py-4 px-3 whitespace-normal break-words min-h-[60px]">
                የትምህርት ክፍለ-ጊዜ ለማየት
              </Button>
            </Link>
            <Link href={"/student_list"}>
              <Button className=" bg-amber-600 hover:bg-amber-700 h-25 py-3 px-3 whitespace-normal break-words min-h-[60px]">
                የተማሪዎች ሊስት
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5 py-6">
        <h1 className="text-amber-400 text-center text-2xl break-words font-bold">
          ሳምንታዊ የበገና ቤቱ <br /> መርሐ-ግብሮች
        </h1>
        <div className="px-10">
          <Card className="mt-6 p-7 bg-gray-800 border-amber-950">
            <div className="border border-amber-800 rounded-md">
              <h1 className="bg-amber-900 rounded-t-md p-3 text-center text-xl text-white">
                {" "}
                የሙሉ ሳምንቱ ፕሮግራም
              </h1>
              <div className="">
                <ul>
                  <li>ሰኞ</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="px-10 mt-10">
        <h1 className="text-center text-2xl text-amber-400 font-bold mb-10">
          ስለ በገና ክፍሉ
        </h1>
        <div className="border border-amber-900 bg-gray-800 p-5 rounded-lg">
          <div className="">
            <h2 className="text-xl text-white mb-3 ">የበገና ንዑስ ክፍሉ</h2>
            <ol className="text-gray-400 list-disc list-inside pl-4 space-y-2">
              <li>ስለ በገና ጥናት እንዲሁም ትርጉም አመጣጥ ታሪክ ለአባላት ግንዛቤ እንዲኖራችው ማድረግ </li>
              <li>በቤዚክ የበገና ስልጠና ተማሪዎችን በማስተማር ያስመርቃል፡፡ </li>
              <li>የአድቫንስ የበገና ስልጠናን ይሰጣል፡፡ </li>
              <li>በተለያዩ ጉባኤያት እና ዝክሮች ላይ የበገና ዝማሬ አገልግሎት በክፍሉ ዘማሪያን ይሰጣል </li>
            </ol>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
