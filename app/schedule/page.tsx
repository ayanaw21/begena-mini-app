'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Schedule = () => {
  const [isBasic , setIsBasic] = useState<boolean>(true)
	return (
		<div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 md:border md:border-gray-800">
			<Navbar />
			<div className="flex justify-between items-center mt-10 px-8">
				<h1 className="text-4xl text-amber-400">የትምህርት ሰዓት</h1>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
					<Link href="/student_list">
						<Button className="text-2xl text-amber-400 bg-gray-700 border-amber-400">Students</Button>
					</Link>
          <Link href="/student_list">
						<Button className="text-2xl text-gray-100 bg-gray-700 border-amber-400 "><MoveLeft/> ለመመለስ</Button>
					</Link>
				</div>
			</div>

      <div className="bg-gray-800 border border-amber-950 p-10 m-10 rounded-md">
        <h1></h1>
        <div className="gap-4 flex flex-col">

        <Button className={`text-2xl text-gray-100 whitespace-normal break-words min-h-[40px] ${isBasic ? 'bg-amber-600':'bg-gray-700 '} `} onClick={()=>setIsBasic(true)}>ቤዚክ ተማሪዎች</Button>
        <Button className={`text-2xl text-gray-100 whitespace-normal break-words min-h-[40px] ${!isBasic ? 'bg-amber-600 ' : 'bg-gray-600'} `} onClick={()=>setIsBasic(false)}>አድቫንስ ተማሪዎች</Button>
        </div>
      </div>

		</div>
	);
};

export default Schedule;
