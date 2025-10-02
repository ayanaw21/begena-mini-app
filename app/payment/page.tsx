"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { UploadButton } from "@uploadthing/react";
import Image from "next/image";
import { sendPayment } from "@/lib/actions/payment";

const Payment = () => {
	const [isPending, startTransition] = useTransition();
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [selectedSection, setSelectedSection] = useState("");
	const [selectedMonth, setSelectedMonth] = useState("");
	const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
	const months = [
		{
			value: "September",
			label: "September",
		},
		{
			value: "October",
			label: "October",
		},
		{
			value: "November",
			label: "November",
		},
		{
			value: "December",
			label: "December",
		},
		{
			value: "January",
			label: "January",
		},
		{
			value: "February",
			label: "February",
		},
		{
			value: "March",
			label: "March",
		},
		{
			value: "April",
			label: "April",
		},
		{
			value: "May",
			label: "May",
		},
	];
	const batches = Array.from({ length: 10 }, (_, i) => ({
		value: i + 1,
		label: `Batch ${i + 1}`,
	}));
	const sections = [
		{ value: "basic-a", label: "Basic A" },
		{ value: "begena-b", label: "Basic B" },
		{ value: "begena-c", label: "Basic C" },
		{ value: "basic-d", label: "Basic D" },
		{ value: "advanced-a", label: "Advanced A" },
		{ value: "advanced-b", label: "Advanced B" },
	];

	const handleSubmit = (formData: FormData) => {
		setError(null); // Clear previous errors
		console.log(imageUrl);

		// Client-side validation
		if (!imageUrl) {
			setError("Please upload a payment screenshot");
			return;
		}

		formData.append("imageUrl", imageUrl);

		startTransition(async () => {
			await sendPayment(formData);
		});
	};

	const removeImage = () => {
		setImageUrl(null);
	};

	return (
		<div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900">
			<nav className="h-30 border-b border-gray-700 w-full flex justify-between items-center px-10">
				<h1 className="text-xl text-amber-400 font-bold">በገና</h1>
				<div className="flex items-center">
					<Link href={"/"}>
						<Button className="font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900">
							Back to Home
						</Button>
					</Link>
				</div>
			</nav>

			<h1 className="mt-10 text-center text-2xl sm:text-4xl text-amber-400 font-bold">
				Submit Payment Proof
			</h1>

			<Card className="mt-10 mx-4 bg-gray-800 border-amber-950">
				<CardContent className="pt-6">
					{/* Error Display */}

					<form action={handleSubmit}>
						<div className="mb-4">
							<label
								htmlFor="fullName"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								ሙሉ ስም
							</label>
							<input
								type="text"
								id="fullName"
								name="fullName"
								required
								placeholder="Enter your full name"
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
								)}
								disabled={isPending}
							/>
						</div>
						<div className="mb-4">
							<label
								htmlFor="begenaId"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								የበገና ID
							</label>
							<input
								type="text"
								id="begenaId"
								name="begenaId"
								required
								placeholder="Enter your Begena ID"
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
								)}
								disabled={isPending}
							/>
						</div>
						<div className="mb-4">
							<label
								htmlFor="section"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								Section
							</label>
							<select
								id="section"
								name="section"
								required
								value={selectedSection}
								onChange={(e) =>
									setSelectedSection(e.target.value)
								}
								disabled={isPending}
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
								)}
							>
								<option value="">Select a section</option>
								{sections.map((section) => (
									<option
										key={section.value}
										value={section.value}
									>
										{section.label}
									</option>
								))}
							</select>
						</div>

						<div className="mb-4">
							<label
								htmlFor="batch"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								Batch
							</label>
							<select
								id="batch"
								name="batch"
								required
								value={selectedBatch || ""}
								onChange={(e) =>
									setSelectedBatch(e.target.value ? Number(e.target.value) : null)
								}
								disabled={isPending}
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
								)}
							>
								<option value="">Select a batch</option>
								{batches.map((batch) => (
									<option
										key={batch.value}
										value={batch.value}
									>
										{batch.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-4">
							<label
								htmlFor="month"
								className="block text-xl font-medium text-amber-400 mb-2"
							>
								Month
							</label>
							<select
								id="month"
								name="month"
								required
								value={selectedMonth}
								onChange={(e) =>
									setSelectedMonth(e.target.value)
								}
								disabled={isPending}
								className={cn(
									"w-full border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100",
									"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
								)}
							>
								<option value="">Select a month</option>
								{months.map((month) => (
									<option
										key={month.value}
										value={month.value}
									>
										{month.label}
									</option>
								))}
							</select>
						</div>

						<div className="mb-6">
							<label className="block text-xl font-medium text-amber-400 mb-2">
								Payment Screenshot
							</label>

							{imageUrl ? (
								<div className="relative mb-4">
									<Image
										src={imageUrl}
										alt="Payment screenshot"
										width={300}
										height={300}
										className="w-full rounded-md max-h-48 object-cover"
									/>
									<Button
										type="button"
										onClick={removeImage}
										className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8"
										disabled={isPending}
									>
										×
									</Button>
								</div>
							) : (
								<UploadButton
									endpoint="imageUploader"
									onClientUploadComplete={(res) => {
										if (res && res[0].url) {
											setImageUrl(res[0].url);
											setError(null);
										}
									}}
									onUploadError={(error: Error) => {
										setError(
											`Upload failed: ${error.message}`
										);
									}}
									appearance={{
										button: {
											backgroundColor: "rgb(251 191 36)",
											color: "rgb(31 41 55)",
											fontWeight: "bold",
										},
										container: {
											width: "100%",
										},
										allowedContent: {
											color: "#9CA3AF",
										},
									}}
								/>
							)}
						</div>
						<div className="text-white p-4">
							<h2 className="text-amber-400 text-2xl">
								የክፍያ መመሪያ
							</h2>
							<p className="pb-2">
								ወርሃዊ የተማሪ ክፍይ ወደ የሚከተለው የባንክ አካውንት ያሰልፉት。
							</p>
							<div className="bg-gray-900 p-5 rounded-md">
								<p>
									ባንክ:{" "}
									<span className="text-amber-400">
										{" "}
										የኢትዮጵያ ንግድ ባንክ
									</span>
								</p>
								<p>
									የአካውንት ስም:{" "}
									<span className="text-amber-400">
										{" "}
										Ayanaw Mengesha and/or Motuma Kidanu
									</span>
								</p>
								<p>
									የአካውንት ቀጥር:{" "}
									<span className="text-amber-400">
										1000720480337
									</span>
								</p>
							</div>
						</div>
						<Button
							type="submit"
							disabled={isPending || !imageUrl}
							className="w-full h-auto py-3 text-md bg-amber-600 hover:bg-amber-700 whitespace-normal break-words disabled:bg-amber-800 disabled:cursor-not-allowed"
						>
							{isPending ? "Submitting..." : "Submit Payment"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Payment;
