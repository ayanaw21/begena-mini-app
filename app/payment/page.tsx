"use client";
import { Button } from "@/components/ui/button";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
import {
	Field,
	PageBody,
	PageContainer,
	Panel,
	PanelBody,
	PanelHeader,
} from "@/components/ui/page";
import React, { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { Check, Upload, X } from "lucide-react";
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

const StepTitle = ({
	step,
	children,
}: {
	step: number;
	children: React.ReactNode;
}) => (
	<span className="flex items-center gap-2.5">
		<span className="bg-primary/15 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
			{step}
		</span>
		{children}
	</span>
);

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

		if (isPending) return;

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
				toast.error(result.error);
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
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<PageBody>
				<PageContainer className="space-y-8">
					<Figure
						src={siteImages.paymentBanner}
						alt="ባህላዊ በገና"
						ratio="ultrawide"
						priority
						scrim
					>
						<p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
							💳 ወርሃዊ ክፍያ
						</p>
						<h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
							Submit Payment Proof
						</h1>
					</Figure>

					<p className="text-muted-foreground max-w-prose text-sm">
						ተማሪዎች የክፍያ ደረሰኝ በ ID ብቻ የሚያስገቡበት ገጽ።
					</p>

					{/* Bank details come first — the receipt cannot exist before the transfer. */}
					<Panel className="border-primary/20 bg-primary/5 p-5">
						<h2 className="text-primary text-sm font-semibold tracking-wider uppercase">
							የክፍያ መመሪያ · Bank Transfer
						</h2>
						<p className="text-muted-foreground mt-1.5 text-sm">
							ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።
						</p>
						<dl className="mt-4 grid gap-3 sm:grid-cols-3">
							<div>
								<dt className="text-muted-foreground text-xs">ባንክ</dt>
								<dd className="mt-0.5 text-sm font-medium">
									የኢትዮጵያ ንግድ ባንክ (CBE)
								</dd>
							</div>
							<div>
								<dt className="text-muted-foreground text-xs">የአካውንት ስም</dt>
								<dd className="mt-0.5 text-sm font-medium">
									Ayanaw Mengesha and/or Motuma Kidanu
								</dd>
							</div>
							<div>
								<dt className="text-muted-foreground text-xs">የአካውንት ቁጥር</dt>
								<dd className="text-primary mt-0.5 font-mono text-sm font-semibold">
									1000720480337
								</dd>
							</div>
						</dl>
					</Panel>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Step 1 — Student ID */}
						<Panel>
							<PanelHeader
								title={<StepTitle step={1}>የተማሪ ID (Student ID)</StepTitle>}
								action={
									isLookingUp ? (
										<span className="text-primary animate-pulse text-xs">
											Verifying...
										</span>
									) : null
								}
							/>
							<PanelBody className="space-y-3">
								<div className="flex flex-col gap-2 sm:flex-row">
									<input
										type="text"
										id="begenaId"
										name="begenaId"
										required
										value={begenaId}
										onChange={(e) => setBegenaId(e.target.value)}
										onBlur={() => performStudentLookup(begenaId)}
										placeholder="BG2026-0001"
										className="flex-1 font-mono"
										disabled={isPending}
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => performStudentLookup(begenaId)}
										className="sm:w-auto"
									>
										Verify ID
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">
									Enter your assigned Student ID to auto-link your program,
									section and full name.
								</p>

								{foundStudent ? (
									<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5">
										<div className="flex items-center justify-between gap-3">
											<span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
												<Check size={14} /> Verified student
											</span>
											<span className="text-muted-foreground font-mono text-xs">
												{foundStudent.studentId}
											</span>
										</div>
										<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-emerald-500/15 pt-3 sm:grid-cols-4">
											{[
												{ label: "Full Name", value: foundStudent.fullName },
												{ label: "Program", value: foundStudent.program },
												{ label: "Section", value: foundStudent.section },
												{ label: "Batch", value: foundStudent.batch },
											].map((item) => (
												<div key={item.label} className="min-w-0">
													<dt className="text-muted-foreground text-[11px]">
														{item.label}
													</dt>
													<dd className="truncate text-sm font-medium">
														{item.value}
													</dd>
												</div>
											))}
										</dl>
									</div>
								) : (
									begenaId.length >= 3 &&
									!isLookingUp && (
										<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3.5 py-3">
											<span className="text-muted-foreground text-xs">
												ID not pre-registered yet? You can still submit your
												receipt.
											</span>
											<button
												type="button"
												onClick={() => setManualMode(!manualMode)}
												className="text-primary cursor-pointer text-xs font-semibold hover:underline"
											>
												{manualMode ? "Hide form" : "Enter name manually"}
											</button>
										</div>
									)
								)}

								{!foundStudent && manualMode && (
									<Field label="Full Name (ሙሉ ስም)" htmlFor="fullName">
										<input
											id="fullName"
											type="text"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											placeholder="Enter your full name"
										/>
									</Field>
								)}
							</PanelBody>
						</Panel>

						{/* Step 2 — Month */}
						<Panel>
							<PanelHeader
								title={<StepTitle step={2}>የሚከፍሉበት ወር (Month)</StepTitle>}
							/>
							<PanelBody>
								<select
									id="month"
									name="month"
									required
									value={selectedMonth}
									onChange={(e) => setSelectedMonth(e.target.value)}
									disabled={isPending}
								>
									<option value="">Select a month (ወር ይምረጡ)</option>
									{months.map((month) => (
										<option key={month.value} value={month.value}>
											{month.label}
										</option>
									))}
								</select>
							</PanelBody>
						</Panel>

						{/* Step 3 — Receipt */}
						<Panel>
							<PanelHeader
								title={
									<StepTitle step={3}>የክፍያ Screenshot (Receipt)</StepTitle>
								}
							/>
							<PanelBody>
								{previewUrl ? (
									<div className="relative">
										<Image
											src={previewUrl}
											alt="Payment screenshot preview"
											width={600}
											height={400}
											className="max-h-72 w-full rounded-lg border border-white/10 object-cover"
										/>
										<button
											type="button"
											onClick={removeImage}
											disabled={isPending}
											aria-label="Remove screenshot"
											className="bg-background/80 hover:text-destructive absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 backdrop-blur transition-colors"
										>
											<X size={15} />
										</button>
									</div>
								) : (
									<label
										htmlFor="screenshot-input"
										className="hover:border-primary/40 hover:bg-primary/5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-9 text-center transition-colors"
									>
										<Upload size={20} className="text-muted-foreground" />
										<span className="text-sm font-medium">
											Choose payment screenshot
										</span>
										<span className="text-muted-foreground text-xs">
											PNG, JPG or WEBP up to 5MB
										</span>
										<input
											type="file"
											accept="image/*"
											id="screenshot-input"
											onChange={handleFileChange}
											disabled={isPending}
											className="hidden"
										/>
									</label>
								)}
							</PanelBody>
						</Panel>

						<Button
							type="submit"
							size="lg"
							disabled={isPending || !selectedFile || !begenaId}
							className="w-full"
						>
							{isPending ? "Submitting..." : "Submit Payment (ክፍያውን መዝግብ)"}
						</Button>
					</form>
				</PageContainer>
			</PageBody>

			<Footer />
		</div>
	);
};

export default Payment;
