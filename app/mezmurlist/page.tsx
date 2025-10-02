import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../../public/begena.jpg";
const lists = [
	{ zemari: "ደምሴ ደስታ", link: "https://t.me/aastugibibuaebegena/4" },
	{ zemari: "አለቃ ተሰማ ወልደ አማኑኤል(አባ በገና)", link: "t.me/aastugibibuaebegena/6" },
	{ zemari: "መጋቤ ስብሃት አለሙ አጋ", link: "https://t.me/aastugibibuaebegena/2" },
	{ zemari: "ዲ/ን አቤል ተስፋዬ", link: "https://t.me/aastugibibuaebegena/18" },
	{ zemari: "ዘርፉ ደምሴ", link: "https://t.me/aastugibibuaebegena/214" },
	{ zemari: "ሲሳይ ደምሴ", link: "https://t.me/aastugibibuaebegena/10" },
	{ zemari: "መሪጌታ ፍቅሩ ሳህሉ", link: "https://t.me/aastugibibuaebegena/8" },
	{ zemari: "ታፈሰ ተስፋዬ", link: "https://t.me/aastugibibuaebegena/12" },
];

const MezmurList = () => {
	return (
		<div className='"w-full max-w-[750px] mx-auto min-h-screen bg-gray-900'>
			<nav className="h-30 border-b border-gray-700 w-full flex justify-between items-center px-10">
				<div className="flex">
					{/* <Image src={'https://g96xkr7zoc.ufs.sh/f/p0mpb6xeXkhSD7sdTLidP3VtyE9BnNsGgb2co7IuAFYKMaq5'} width={20} height={20} alt="begena" /> */}
					<h1 className="text-xl text-amber-400 font-bold">በገና</h1>
				</div>
				<div className="flex items-center">
					<Link href={"/"}>
						<Button className="font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900">
							Back to Home
						</Button>
					</Link>
				</div>
			</nav>
			<div className="my-6">
				<h1 className="text-4xl font-bold text-amber-400 text-center">
					የበገና ደርዳሪወች ዝርዝር
				</h1>
				<h3 className="text-3xl text-gray-300 text-center mt-5">
					መዝሙሮችን ለማግኘት የዘማሪውን ስም ይጫኑ
				</h3>
			</div>
			{lists.map((list) => (
				<Link key={list.zemari} className="" href={list.link}>
					<div className="p-10  m-10  rounded-md text-center flex flex-col items-center border border-amber-950 bg-gray-800 hover:bg-gray-700">
						<Image
							src={logo}
							alt="pay"
							width={20}
							height={10}
							className="rounded-full w-16 h-16"
						/>
						<p className="text-amber-400 text-2xl mt-5">
							{list.zemari}
						</p>
						<p className="mt-2 text-gray-500">
							የበገና መዝሙሮች ጋር ለመድረስ ይጫኑ
						</p>
					</div>
				</Link>
			))}
			<div className="p-10  m-10  rounded-md flex flex-col  border border-amber-950 bg-gray-900">
				<h1 className="text-2xl text-amber-400">በገና በኢትዮጵያ</h1>
				<p className="text-gray-300 mt-4">
					በገና በኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን የዜማ መሳሪያ ሲሆን በዋናነት ለመለኮታዊ
					የእግዚአብሔር ፈቃድ ማስፈጸሚያ ማለትም ለምስጋናና ለልመና የሚያገለግል ነው። በገና ከብሉይ
					ኪዳን የመጀመሪያ መጽሐፍ ከኦሪት ዘፍጥረት እስከ መጨረሻው የአዲስ ኪዳን መጽሐፍ ዮሐንስ ራእይ
					ድረስ አገልግሎቱ የተጠቀሰ እጅግ ድንቅ መንፈሳዊ የዜማ መሳሪያ ነው።
				</p>

				<p className="text-gray-300 mt-4">
					ከላይ የተጠተቀሱት የበገና ደርራሪያንም በገና በኢትዮጵያ ከትውልድ ወደ ትውልድ እንዲሸጋገርና
					ለበገና ትምህርት መስፋፋት እጅጉን ትልቁን ድርሻ የተወጡ ናቸው፡፡
				</p>
			</div>
		</div>
	);
};

export default MezmurList;
