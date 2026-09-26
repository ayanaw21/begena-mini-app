"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { sendPayment } from "@/lib/actions/payment";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

interface FoundStudent {
  fullName: string;
  studentId: string;
  program: string;
  section: string;
  batch: string;
  academicStatus?: string;
}

const Payment = () => {
	const [isPending, startTransition] = useTransition();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// Form values
	const [begenaId, setBegenaId] = useState("");
	const [selectedMonth, setSelectedMonth] = useState("");

	// Auto-filled / fallback values
	const [fullName, setFullName] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("በገና (Begena)");
	const [selectedSection, setSelectedSection] = useState("Section A");
	const [selectedBatch, setSelectedBatch] = useState("Batch 1");

	// Lookup state
	const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
	const [isLookingUp, setIsLookingUp] = useState(false);
	const [manualMode, setManualMode] = useState(false);

	const months = [
		{ value: "October", label: "ጥቅምት (October)" },
		{ value: "November", label: "ሕዳር (November)" },
		{ value: "December", label: "ታሕሳስ (December)" },
		{ value: "January", label: "ጥር (January)" },
		{ value: "February", label: "የካቲት (February)" },
		{ value: "March", label: "መጋቢት (March)" },
		{ value: "April", label: "ሚያዚያ (April)" },
		{ value: "May", label: "ግንቦት (May)" },
	];

	// Auto-lookup student by Student ID
	const performStudentLookup = useCallback(async (idToLookup: string) => {
		if (!idToLookup || idToLookup.trim().length < 2) {
			setFoundStudent(null);
			return;
		}

		setIsLookingUp(true);
		try {
			const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const res = await fetch(`${baseUrl}/students/lookup/${encodeURIComponent(idToLookup.trim())}`);
			if (res.ok) {
				const data = await res.json();
				if (data.success && data.student) {
					const s: FoundStudent = data.student;
					setFoundStudent(s);
					setFullName(s.fullName || "");
					if (s.program) setSelectedProgram(s.program);
					if (s.section) setSelectedSection(s.section);
					if (s.batch) setSelectedBatch(s.batch);
					toast.success(`Verified: ${s.fullName}`);
				}
			} else {
				setFoundStudent(null);
			}
		} catch (err) {
			console.error("Lookup error:", err);
		} finally {
			setIsLookingUp(false);
		}
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("File size must be less than 5MB");
				return;
			}
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const removeImage = () => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!begenaId.trim()) {
			toast.error("Please enter your Student ID");
			return;
		}

		if (!selectedMonth) {
			toast.error("Please select the month you are paying for");
			return;
		}

		if (!selectedFile) {
			toast.error("Please upload a payment screenshot");
			return;
		}

		const formData = new FormData();
		const sId = begenaId.trim();
		formData.set("begenaId", sId);
		formData.set("studentId", sId);
		formData.set("fullName", foundStudent?.fullName || fullName.trim() || `Student ${sId}`);
		formData.set("program", foundStudent?.program || selectedProgram || "በገና (Begena)");
		formData.set("section", foundStudent?.section || selectedSection || "Section A");
		formData.set("batch", foundStudent?.batch || selectedBatch || "Batch 1");
		formData.set("month", selectedMonth);
		formData.set("screenshot", selectedFile);

		startTransition(async () => {
			const result = await sendPayment(formData);
			if (result?.error) {
				toast.error(`${result.error}. Please contact the admins.`);
			} else {
				toast.success("Payment submitted successfully!");
				removeImage();
				setBegenaId("");
				setFullName("");
				setSelectedMonth("");
				setFoundStudent(null);
				(e.target as HTMLFormElement).reset();
			}
		});
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white flex flex-col w-full">
			<Navbar />

			<main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
				<h1 className="text-center text-3xl sm:text-4xl text-amber-400 font-bold mb-2">
					Submit Payment Proof
				</h1>
				<p className="text-center text-gray-400 text-sm mb-6">
					ተማሪዎች የክፍያ ደረሰኝ በ ID ብቻ የሚያስገቡበት ገጽ
				</p>

				<Card className="bg-gray-800 border border-amber-950/60 shadow-xl">
					<CardContent className="pt-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Step 1: Student ID Input */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<label
										htmlFor="begenaId"
										className="block text-lg font-bold text-amber-400"
									>
										የተማሪ ID (Student ID)
									</label>
									{isLookingUp && (
										<span className="text-xs text-amber-400 animate-pulse">
											Verifying Student ID...
										</span>
									)}
								</div>

								<div className="flex gap-2">
									<input
										type="text"
										id="begenaId"
										name="begenaId"
										required
										value={begenaId}
										onChange={(e) => {
											setBegenaId(e.target.value);
										}}
										onBlur={() => performStudentLookup(begenaId)}
										placeholder="Enter Student ID (e.g. BG2026-0001, MS2026-0001)"
										className={cn(
											"flex-1 border border-gray-600 px-4 py-3 bg-gray-700 text-gray-100 font-mono text-lg",
											"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500",
										)}
										disabled={isPending}
									/>
									<button
										type="button"
										onClick={() => performStudentLookup(begenaId)}
										className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold text-sm rounded-md transition-colors"
									>
										Verify ID
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1">
									Enter your assigned Student ID to auto-link your program, section & full name.
								</p>
							</div>

							{/* Verified Student Details Card */}
							{foundStudent ? (
								<div className="p-4 bg-gradient-to-r from-green-950/90 to-gray-800 border border-green-600/80 rounded-lg space-y-2 shadow-md">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="bg-green-500 text-gray-950 p-1 rounded-full text-xs font-bold">✓</span>
											<span className="font-bold text-green-300 text-sm">Verified Student Found</span>
										</div>
										<span className="text-[11px] bg-green-900/80 text-green-200 px-2 py-0.5 rounded border border-green-700 font-mono">
											{foundStudent.studentId}
										</span>
									</div>

									<div className="grid grid-cols-2 gap-2 text-sm pt-1 border-t border-green-900/60">
										<div>
											<span className="text-gray-400 text-xs block">Full Name:</span>
											<span className="font-semibold text-white">{foundStudent.fullName}</span>
										</div>
										<div>
											<span className="text-gray-400 text-xs block">Program:</span>
											<span className="font-semibold text-amber-400">{foundStudent.program}</span>
										</div>
										<div>
											<span className="text-gray-400 text-xs block">Section:</span>
											<span className="font-semibold text-white">{foundStudent.section}</span>
										</div>
										<div>
											<span className="text-gray-400 text-xs block">Batch:</span>
											<span className="font-semibold text-white">{foundStudent.batch}</span>
										</div>
									</div>
								</div>
							) : (
								begenaId.length >= 3 && !isLookingUp && (
									<div className="p-3 bg-gray-900/80 border border-amber-900/60 rounded-md text-xs text-gray-300 flex items-center justify-between">
										<span>
											ID not pre-registered yet? You can still submit your payment receipt!
										</span>
										<button
											type="button"
											onClick={() => setManualMode(!manualMode)}
											className="text-amber-400 underline font-semibold hover:text-amber-300 ml-2"
										>
											{manualMode ? "Hide Form" : "Enter Name"}
										</button>
									</div>
								)
							)}

							{/* Optional Manual Name input if unverified ID */}
							{(!foundStudent && manualMode) && (
								<div className="p-3 bg-gray-900/90 rounded-md border border-gray-700 space-y-3">
									<div>
										<label className="block text-xs font-medium text-amber-400 mb-1">
											Full Name (ሙሉ ስም)
										</label>
										<input
											type="text"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											placeholder="Enter your full name"
											className="w-full border border-gray-600 px-3 py-2 bg-gray-800 text-white rounded text-sm"
										/>
									</div>
								</div>
							)}

							{/* Step 2: Select Payment Month */}
							<div>
								<label
									htmlFor="month"
									className="block text-lg font-bold text-amber-400 mb-2"
								>
									የሚከፍሉበት ወር (Month)
								</label>
								<select
									id="month"
									name="month"
									required
									value={selectedMonth}
									onChange={(e) => setSelectedMonth(e.target.value)}
									disabled={isPending}
									className={cn(
										"w-full border border-gray-600 px-4 py-3 bg-gray-700 text-gray-100 text-lg",
										"rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500",
									)}
								>
									<option value="">Select a month (ወር ይምረጡ)</option>
									{months.map((month) => (
										<option key={month.value} value={month.value}>
											{month.label}
										</option>
									))}
								</select>
							</div>

							{/* Step 3: Payment Screenshot Upload */}
							<div>
								<label className="block text-lg font-bold text-amber-400 mb-2">
									የክፍያ Screenshot (Payment Receipt Slip)
								</label>

								{previewUrl ? (
									<div className="relative mb-4">
										<Image
											src={previewUrl}
											alt="Payment screenshot preview"
											width={300}
											height={300}
											className="w-full rounded-md max-h-60 object-cover border border-amber-900"
										/>
										<Button
											type="button"
											onClick={removeImage}
											className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8 rounded-full flex items-center justify-center"
											disabled={isPending}
										>
											×
										</Button>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-amber-400 rounded-lg p-6 bg-gray-700/50 transition-colors">
										<input
											type="file"
											accept="image/*"
											id="screenshot-input"
											onChange={handleFileChange}
											disabled={isPending}
											className="hidden"
										/>
										<label
											htmlFor="screenshot-input"
											className="cursor-pointer flex flex-col items-center gap-2"
										>
											<span className="bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold px-6 py-2.5 rounded-md text-sm transition-colors">
												Choose Payment Image Screenshot
											</span>
											<span className="text-gray-400 text-xs">
												PNG, JPG, WEBP up to 5MB
											</span>
										</label>
									</div>
								)}
							</div>

							{/* Payment Bank Details Instructions */}
							<div className="text-white p-4 bg-gray-900/90 rounded-lg border border-gray-700">
								<h2 className="text-amber-400 text-lg font-bold mb-2">
									የክፍያ መመሪያ (Bank Transfer Details)
								</h2>
								<p className="pb-2 text-xs text-gray-300">
									ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ!
								</p>
								<div className="bg-gray-950 p-4 rounded-md space-y-1 text-sm">
									<p>
										ባንክ:{" "}
										<span className="text-amber-400 font-semibold">
											የኢትዮጵያ ንግድ ባንክ (CBE)
										</span>
									</p>
									<p>
										የአካውንት ስም:{" "}
										<span className="text-amber-400 font-semibold">
											Ayanaw Mengesha and/or Motuma Kidanu
										</span>
									</p>
									<p>
										የአካውንት ቁጥር:{" "}
										<span className="text-amber-400 font-mono font-bold">
											1000720480337
										</span>
									</p>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isPending || !selectedFile || !begenaId}
								className="w-full py-4 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-gray-950 disabled:bg-amber-900/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
							>
								{isPending ? "Submitting Payment..." : "Submit Payment (ክፍያውን መዝግብ)"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</main>
			<Footer />
		</div>
	);
};

export default Payment;
