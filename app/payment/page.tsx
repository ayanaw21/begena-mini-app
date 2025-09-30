import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import React from 'react'
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { useTransition } from 'react';

const Payment = () => {
    	const [isPending, startTransition] = useTransition();
	const [imageUrl, setImageUrl] = useState<string | null>(null);
  return (
    <div className='w-full max-w-[750px] mx-auto min-h-screen bg-gray-900'>
        <nav className="h-30 border-b border-gray-700 w-full flex justify-between items-center px-10">
				<h1 className="text-xl text-amber-400 font-bold ">በገና</h1>
				<div className="flex items-center">
					<Link href={"/"}>
						<Button className="font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900">
							Back to Home
						</Button>
					</Link>
				</div>
			</nav>
            <h1 className='mt-10  text-center text-2xl sm:text-4xl text-amber-400 font-bold '>Submit Payment Proof</h1>

            <Card className='mt-10  bg-gray-800 border-amber-950'>
                <CardContent>
                    <form action="">
                        <div>
							<label
								htmlFor="title"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								ሙሉ ስም
							</label>
							<input
								type="text"
								id="title"
								name="title"
								required
								placeholder="Enter your full name"
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								)}
							/>
						</div>
                        <div>
							<label
								htmlFor="title"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								Section
							</label>
							<input
								type=''
								id="title"
								name="title"
								required
								placeholder="Enter your full name"
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								)}
							/>
						</div>
                        <div>
							<label htmlFor="">Trip Image</label>
                            {/* {imageUrl && (
                                <Image src={imageUrl} alt="Trip Preview" width={300} height={300} className="w-full rounded-md max-h-48 object-cover" />
                            )} */}
							<UploadButton
								endpoint={"imageUploader"}
								onClientUploadComplete={(res) => {
									if (res && res[0].ufsUrl) {
										setImageUrl(res[0].ufsUrl);
									}
								}}
								onUploadError={(error) => {
									console.error("Upload:  ", error);
								}}
							/>
						</div>
                    </form>
                </CardContent>
            </Card>
    </div>
  )
}

export default Payment