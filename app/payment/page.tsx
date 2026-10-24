"use client";
import { Button } from "@/components/ui/button";
import Figure from "@/components/ui/figure";
import PhotoPanel from "@/components/ui/photo-panel";
import CustomSelect from "@/components/ui/custom-select";
import { Badge } from "@/components/ui/badge";
import { siteImages } from "@/lib/images";
import {
	PageBody,
	PageContainer,
	PageHeader,
	PanelBody,
	PanelHeader,
} from "@/components/ui/page";
import React, { useState, useTransition, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Check,
	Upload,
	X,
	Building2,
	UserCheck,
	Calendar,
	UploadCloud,
	ShieldCheck,
	History,
	ExternalLink,
	Loader2,
	ArrowRight,
	AlertCircle,
	Edit3,
	Lock,
} from "lucide-react";
import { sendPayment, updatePendingPayment } from "@/lib/actions/payment";
import { getValidStudentToken, getStudentData } from "@/lib/auth";
import { Payment as PaymentRecord } from "@/types";
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
	icon: Icon,
	children,
}: {
	step: number;
	icon: React.ElementType;
	children: React.ReactNode;
}) => (
	<span className="flex items-center gap-2.5">
		<span className="bg-primary/20 text-primary border border-primary/30 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
			{step}
		</span>
		<Icon size={18} className="text-primary shrink-0" />
		<span>{children}</span>
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
	const [selectedProgram, setSelectedProgram] = useState("Basic በገና");
	const [selectedSection, setSelectedSection] = useState("Sec-A");
	const [selectedBatch, setSelectedBatch] = useState("Batch 8");

	// Lookup state
	const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
	const [isLookingUp, setIsLookingUp] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	// Student Login & History state
	const [isLoggedInStudent, setIsLoggedInStudent] = useState(false);
	const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
	const [loadingPayments, setLoadingPayments] = useState(false);
	const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

	// Edit Pending Payment state
	const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
	const [editMonth, setEditMonth] = useState("");
	const [editFile, setEditFile] = useState<File | null>(null);
	const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

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

	// Set of months already submitted (Pending or Approved)
	const submittedMonths = useMemo(() => {
		return new Set(
			paymentHistory
				.filter((p) => p.status === "Pending" || p.status === "Approved")
				.map((p) => p.month)
		);
	}, [paymentHistory]);

	// Fetch payments for a given student ID
	const fetchPaymentsForStudent = useCallback(async (studentId: string) => {
		if (!studentId || studentId.trim().length < 2) {
			setPaymentHistory([]);
			return;
		}
		setLoadingPayments(true);
		try {
			const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const res = await fetch(`${baseUrl}/payments/student/${encodeURIComponent(studentId.trim())}`);
			if (res.ok) {
				const data = await res.json();
				if (data.success && Array.isArray(data.payments)) {
					setPaymentHistory(data.payments);
				} else {
					setPaymentHistory([]);
				}
			}
		} catch (err) {
			console.error("Payment history fetch error:", err);
		} finally {
			setLoadingPayments(false);
		}
	}, []);

	// Auto-fill logged in student info on load
	useEffect(() => {
		const token = getValidStudentToken();
		const student = getStudentData();
		if (token && student?.studentId) {
			setIsLoggedInStudent(true);
			const sId = student.studentId;
			setBegenaId(sId);
			setFullName(student.fullName || "");
			if (student.program) setSelectedProgram(student.program);
			if (student.section) setSelectedSection(student.section);
			if (student.batch) setSelectedBatch(student.batch);
			setFoundStudent({
				fullName: student.fullName || "",
				studentId: sId,
				program: student.program || "Basic በገና",
				section: student.section || "Sec-A",
				batch: student.batch || "Batch 8",
				academicStatus: student.academicStatus || "Active",
			});
			setHasSearched(true);
			fetchPaymentsForStudent(sId);
		}
	}, [fetchPaymentsForStudent]);

	// Auto-lookup student by Student ID
	const performStudentLookup = useCallback(async (idToLookup: string) => {
		if (!idToLookup || idToLookup.trim().length < 2) {
			setFoundStudent(null);
			setHasSearched(false);
			setPaymentHistory([]);
			return;
		}

		setIsLookingUp(true);
		setHasSearched(true);
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
					toast.success(`Verified student: ${s.fullName}`);
					fetchPaymentsForStudent(s.studentId);
				} else {
					setFoundStudent(null);
					setPaymentHistory([]);
				}
			} else {
				setFoundStudent(null);
				setPaymentHistory([]);
			}
		} catch (err) {
			console.error("Lookup error:", err);
			setFoundStudent(null);
		} finally {
			setIsLookingUp(false);
		}
	}, [fetchPaymentsForStudent]);

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

	const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("File size must be less than 5MB");
				return;
			}
			setEditFile(file);
			setEditPreviewUrl(URL.createObjectURL(file));
		}
	};

	const openEditModal = (p: PaymentRecord) => {
		setEditingPayment(p);
		setEditMonth(p.month || "");
		setEditFile(null);
		setEditPreviewUrl(p.screenshot || null);
	};

	const closeEditModal = () => {
		setEditingPayment(null);
		setEditFile(null);
		setEditPreviewUrl(null);
	};

	const handleUpdatePendingPayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingPayment?._id) return;

		if (!editMonth) {
			toast.error("Please select a month");
			return;
		}

		setIsUpdating(true);
		try {
			const formData = new FormData();
			formData.set("month", editMonth);
			const sId = foundStudent?.studentId || begenaId.trim();
			if (sId) formData.set("studentId", sId);
			if (editFile) {
				formData.set("screenshot", editFile);
			}

			const res = await updatePendingPayment(editingPayment._id, formData);
			if (res?.error) {
				toast.error(res.error);
			} else {
				toast.success("Payment receipt updated successfully!");
				closeEditModal();
				if (sId) {
					fetchPaymentsForStudent(sId);
				}
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to update payment");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isPending) return;

		if (!foundStudent) {
			toast.error("You must enter and verify a registered Student ID first.");
			return;
		}

		if (!selectedMonth) {
			toast.error("Please select the month you are paying for");
			return;
		}

		if (submittedMonths.has(selectedMonth)) {
			toast.error(`A payment for ${selectedMonth} has already been submitted. You cannot submit a duplicate.`);
			return;
		}

		if (!selectedFile) {
			toast.error("Please upload a payment screenshot");
			return;
		}

		const formData = new FormData();
		const sId = foundStudent.studentId;
		formData.set("begenaId", sId);
		formData.set("studentId", sId);
		formData.set("fullName", foundStudent.fullName);
		formData.set("program", foundStudent.program || selectedProgram || "Basic በገና");
		formData.set("section", foundStudent.section || selectedSection || "Sec-A");
		formData.set("batch", foundStudent.batch || selectedBatch || "Batch 8");
		formData.set("month", selectedMonth);
		formData.set("screenshot", selectedFile);

		startTransition(async () => {
			const result = await sendPayment(formData);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Payment submitted successfully! Your submission is now Pending review.");
				removeImage();
				setSelectedMonth("");
				fetchPaymentsForStudent(sId);
			}
		});
	};

	// Options for month select, disabling months already submitted
	const monthOptions = [
		{ value: "", label: "ወር ይምረጡ (Select a month)..." },
		...months.map((m) => {
			const isAlreadySubmitted = submittedMonths.has(m.value);
			return {
				value: m.value,
				label: isAlreadySubmitted ? `${m.label} — (ቀድሞ ተከፍሏል / Already Submitted)` : m.label,
				disabled: isAlreadySubmitted,
			};
		}),
	];

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
						<p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase flex items-center gap-1.5">
							<ShieldCheck size={14} /> ወርሃዊ ክፍያ
						</p>
						<h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
							Submit Payment Proof
						</h1>
					</Figure>

					{/* Logged in student banner */}
					{isLoggedInStudent && foundStudent && (
						<div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
							<div className="flex items-center gap-3">
								<div className="size-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/30">
									🎓
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground flex items-center gap-2">
										{foundStudent.fullName}
										<span className="text-xs font-mono text-primary font-normal bg-primary/20 px-2 py-0.5 rounded-full">
											{foundStudent.studentId}
										</span>
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{foundStudent.program} · {foundStudent.section} · {foundStudent.batch}
									</p>
								</div>
							</div>
							<Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold shrink-0 gap-1.5">
								<Link href="/student/dashboard">
									<span>ዳሽቦርድ ሂድ (Dashboard)</span>
									<ArrowRight size={14} />
								</Link>
							</Button>
						</div>
					)}

					<PageHeader
						title="የክፍያ ማረጋገጫ ማስገቢያ"
						description="ተማሪዎች የወርሃዊ ትምህርት ክፍያ ደረሰኝ በ ID ብቻ የሚያስገቡበት ገጽ።"
					/>

					{/* Bank details card with PhotoPanel */}
					<PhotoPanel
						src={siteImages.noticeCard}
						className="border-primary/30 shadow-2xl backdrop-blur"
						contentClassName="p-6"
					>
						<div className="flex items-center gap-3">
							<div className="bg-primary/20 text-primary flex size-10 items-center justify-center rounded-xl border border-primary/30 shrink-0">
								<Building2 size={20} />
							</div>
							<div>
								<h2 className="text-primary text-sm font-semibold tracking-wider uppercase">
									የክፍያ መመሪያ · Bank Transfer Details
								</h2>
								<p className="text-muted-foreground text-xs mt-0.5">
									ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።
								</p>
							</div>
						</div>

						<dl className="mt-5 grid gap-4 sm:grid-cols-3">
							<div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
								<dt className="text-muted-foreground text-xs font-medium">ባንክ (Bank)</dt>
								<dd className="mt-1 text-sm font-semibold text-foreground">
									የኢትዮጵያ ንግድ ባንክ (CBE)
								</dd>
							</div>
							<div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
								<dt className="text-muted-foreground text-xs font-medium">የአካውንት ስም (Account Name)</dt>
								<dd className="mt-1 text-sm font-semibold text-foreground">
									Ayanaw Mengesha and/or Motuma Kidanu
								</dd>
							</div>
							<div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-primary/30 bg-primary/10">
								<dt className="text-muted-foreground text-xs font-medium">የአካውንት ቁጥር (Account Number)</dt>
								<dd className="text-primary mt-1 font-mono text-base font-bold tracking-wider">
									1000720480337
								</dd>
							</div>
						</dl>
					</PhotoPanel>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Step 1 — Student ID */}
						<PhotoPanel
							src={siteImages.studentProfile}
							contentClassName="p-0"
						>
							<PanelHeader
								title={<StepTitle step={1} icon={UserCheck}>የተማሪ ID (Student ID)</StepTitle>}
								action={
									isLookingUp ? (
										<span className="text-primary animate-pulse text-xs font-medium">
											Verifying...
										</span>
									) : null
								}
							/>
							<PanelBody className="space-y-4 p-6">
								<div className="flex flex-col gap-2 sm:flex-row">
									<div className="relative flex-1">
										<input
											type="text"
											id="begenaId"
											name="begenaId"
											required
											value={begenaId}
											onChange={(e) => {
												setBegenaId(e.target.value);
												setHasSearched(false);
											}}
											onBlur={() => !isLoggedInStudent && performStudentLookup(begenaId)}
											placeholder="001/08"
											readOnly={isLoggedInStudent}
											className={`w-full font-mono bg-black/40 border-white/15 focus:border-primary/50 rounded-lg px-3 py-2 text-sm ${
												isLoggedInStudent ? "cursor-not-allowed opacity-80" : ""
											}`}
											disabled={isPending || isLoggedInStudent}
										/>
										{isLoggedInStudent && (
											<Lock size={14} className="absolute right-3 top-3 text-muted-foreground" />
										)}
									</div>

									{!isLoggedInStudent && (
										<Button
											type="button"
											variant="outline"
											onClick={() => performStudentLookup(begenaId)}
											disabled={isLookingUp || !begenaId.trim()}
											className="sm:w-auto"
										>
											{isLookingUp ? "Verifying..." : "Verify ID"}
										</Button>
									)}
								</div>

								<p className="text-muted-foreground text-xs">
									{isLoggedInStudent
										? "ይህ መለያ ከገቡበት የተማሪ መለያ ጋር ተቆልፏል (Locked to your authenticated account)."
										: "ክፍያ ከመላክዎ በፊት በቅድሚያ የተማሪ መለያዎን (ID) አስገብተው Verify ያድርጉ።"}
								</p>

								{foundStudent ? (
									<div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 backdrop-blur-sm">
										<div className="flex items-center justify-between gap-3">
											<span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
												<Check size={16} /> የተረጋገጠ ተማሪ (Verified Student)
											</span>
											<span className="text-muted-foreground font-mono text-xs">
												{foundStudent.studentId}
											</span>
										</div>
										<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-emerald-500/20 pt-3 sm:grid-cols-4">
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
													<dd className="truncate text-sm font-medium text-foreground">
														{item.value}
													</dd>
												</div>
											))}
										</dl>
									</div>
								) : (
									hasSearched &&
									!isLookingUp &&
									begenaId.trim().length >= 2 && (
										<div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-red-300 text-xs">
											<AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
											<div>
												<p className="font-semibold text-red-200">የተማሪ መለያ አልተገኘም (Student ID Not Registered)</p>
												<p className="text-red-300/80 mt-0.5">
													ያስገቡት የተማሪ ID በሲስተሙ ውስጥ አልተገኘም። ክፍያ መላክ የሚችሉት በ 8ኛ ዙር የተመዘገቡ ተማሪዎች ብቻ ናቸው።
												</p>
											</div>
										</div>
									)
								)}
							</PanelBody>
						</PhotoPanel>

						{/* Step 2 — Month */}
						<PhotoPanel
							src={siteImages.scheduleCard}
							contentClassName="p-0"
						>
							<PanelHeader
								title={<StepTitle step={2} icon={Calendar}>የሚከፍሉበት ወር (Month)</StepTitle>}
							/>
							<PanelBody className="p-6">
								<CustomSelect
									id="month"
									value={selectedMonth}
									onChange={(val) => {
										if (submittedMonths.has(val)) {
											toast.error(`A payment for ${val} has already been submitted.`);
											return;
										}
										setSelectedMonth(val);
									}}
									options={monthOptions}
									disabled={isPending || !foundStudent}
								/>
								{!foundStudent && (
									<p className="text-amber-300/80 text-xs mt-2">
										⚠️ ወር ለመምረጥ በቅድሚያ የተማሪ መለያዎን ያረጋግጡ (Verify ID first).
									</p>
								)}
							</PanelBody>
						</PhotoPanel>

						{/* Step 3 — Receipt */}
						<PhotoPanel
							src={siteImages.begenaHistory}
							contentClassName="p-0"
						>
							<PanelHeader
								title={<StepTitle step={3} icon={UploadCloud}>የክፍያ Screenshot (Receipt)</StepTitle>}
							/>
							<PanelBody className="p-6">
								{previewUrl ? (
									<div className="relative">
										<Image
											src={previewUrl}
											alt="Payment screenshot preview"
											width={600}
											height={400}
											className="max-h-72 w-full rounded-xl border border-white/15 object-cover"
										/>
										<button
											type="button"
											onClick={removeImage}
											disabled={isPending}
											aria-label="Remove screenshot"
											className="bg-background/80 hover:text-destructive absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/15 backdrop-blur transition-colors"
										>
											<X size={16} />
										</button>
									</div>
								) : (
									<label
										htmlFor="screenshot-input"
										className={`hover:border-primary/50 hover:bg-primary/10 bg-black/30 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center transition-all ${
											!foundStudent ? "opacity-50 cursor-not-allowed" : ""
										}`}
									>
										<div className="bg-primary/15 text-primary flex size-12 items-center justify-center rounded-full border border-primary/25">
											<Upload size={22} />
										</div>
										<div>
											<span className="text-sm font-semibold text-foreground block">
												Choose payment screenshot
											</span>
											<span className="text-muted-foreground text-xs mt-1 block">
												PNG, JPG or WEBP up to 5MB
											</span>
										</div>
										<input
											type="file"
											accept="image/*"
											id="screenshot-input"
											onChange={handleFileChange}
											disabled={isPending || !foundStudent}
											className="hidden"
										/>
									</label>
								)}
							</PanelBody>
						</PhotoPanel>

						<Button
							type="submit"
							size="lg"
							disabled={isPending || !selectedFile || !foundStudent || !selectedMonth || submittedMonths.has(selectedMonth)}
							className="w-full py-6 text-base font-semibold shadow-xl"
						>
							{isPending
								? "Submitting..."
								: !foundStudent
									? "Please verify Student ID first (መለያ ያረጋግጡ)"
									: "Submit Payment (ክፍያውን መዝግብ)"}
						</Button>
					</form>

					{/* Payment History Section */}
					{(foundStudent || paymentHistory.length > 0 || loadingPayments) && (
						<PhotoPanel
							src={siteImages.orthodoxChurch}
							contentClassName="p-0"
							className="border-white/10 shadow-2xl backdrop-blur mt-8"
						>
							<PanelHeader
								title={
									<span className="flex items-center gap-2">
										<History size={18} className="text-primary" />
										<span>የክፍያ ታሪክ (Payment History)</span>
									</span>
								}
								description={
									foundStudent
										? `የ ${foundStudent.fullName} (${foundStudent.studentId}) የተመዘገቡ ክፍያዎች`
										: "የተመዘገቡ ክፍያዎች ዝርዝር"
								}
								action={
									loadingPayments ? (
										<span className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
											<Loader2 size={12} className="animate-spin" /> በማምጣት ላይ...
										</span>
									) : (
										<span className="text-xs text-muted-foreground font-mono">
											{paymentHistory.length} ክፍያ(ዎች)
										</span>
									)
								}
							/>
							<PanelBody className="p-0">
								{loadingPayments && paymentHistory.length === 0 ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 size={24} className="animate-spin text-primary" />
									</div>
								) : paymentHistory.length === 0 ? (
									<div className="py-12 text-center text-muted-foreground text-sm">
										ምንም የተመዘገበ ክፍያ አልተገኘም (No payment records found).
									</div>
								) : (
									<div className="divide-y divide-white/5">
										{paymentHistory.map((p, idx) => {
											const status = p.status || "Pending";
											const tone = status === "Approved" ? "success" : status === "Rejected" ? "danger" : "warning";
											const isPendingPayment = status === "Pending";

											return (
												<div
													key={p._id || idx}
													className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-3 hover:bg-white/[0.02] transition-colors"
												>
													<div className="flex items-start gap-3">
														<div className="bg-white/5 rounded-lg p-2.5 shrink-0 text-center min-w-[62px] border border-white/5">
															<span className="text-[10px] uppercase font-bold text-muted-foreground block">
																{p.year || "2026"}
															</span>
															<span className="text-xs font-semibold text-primary block truncate max-w-[80px]">
																{p.month}
															</span>
														</div>
														<div>
															<div className="flex items-center gap-2">
																<span className="text-sm font-semibold text-foreground">
																	{p.month} {p.year || "2026"}
																</span>
																<Badge tone={tone}>
																	{status === "Approved" ? "✓ ጸድቋል" : status === "Rejected" ? "✕ አልተፈቀደም" : "⏳ በመጠባበቅ ላይ"}
																</Badge>
															</div>
															<p className="text-xs text-muted-foreground mt-0.5">
																{p.program || "Basic በገና"} · {p.section} · {p.batch}
															</p>
															{p.adminNotes && (
																<p className="text-xs text-amber-300/90 mt-1 italic">
																	ማስታወሻ: {p.adminNotes}
																</p>
															)}
														</div>
													</div>

													<div className="flex items-center gap-2 self-end sm:self-center">
														{isPendingPayment && (
															<Button
																type="button"
																variant="secondary"
																size="sm"
																onClick={() => openEditModal(p)}
																className="text-xs gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
															>
																<Edit3 size={13} /> አስተካክል (Edit)
															</Button>
														)}

														{p.screenshot && (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => setSelectedReceipt(p.screenshot)}
																className="text-xs gap-1.5 border-white/10 hover:border-primary/40"
															>
																<ExternalLink size={12} /> ደረሰኝ እይ
															</Button>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</PanelBody>
						</PhotoPanel>
					)}
				</PageContainer>
			</PageBody>

			{/* Edit Pending Payment Modal */}
			{editingPayment && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
					onClick={closeEditModal}
				>
					<div
						className="relative max-w-lg w-full bg-slate-900 rounded-2xl p-6 border border-white/15 shadow-2xl space-y-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-3 border-b border-white/10">
							<div className="flex items-center gap-2 text-primary font-semibold">
								<Edit3 size={18} />
								<h3>የክፍያ ማስተካከያ (Edit Pending Payment)</h3>
							</div>
							<button
								onClick={closeEditModal}
								className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
							>
								<X size={18} />
							</button>
						</div>

						<p className="text-xs text-muted-foreground">
							ክፍያው በአስተዳዳሪው ከመጽደቁ በፊት የከፈሉበትን ወር ወይም የደረሰኝ ፎቶ እዚህ ማስተካከል ይችላሉ።
						</p>

						<form onSubmit={handleUpdatePendingPayment} className="space-y-4">
							<div>
								<label className="text-xs font-medium text-foreground block mb-1.5">
									የሚከፍሉበት ወር (Month)
								</label>
								<CustomSelect
									id="editMonth"
									value={editMonth}
									onChange={setEditMonth}
									options={months.map((m) => {
										const isTakenByOther =
											submittedMonths.has(m.value) && m.value !== editingPayment.month;
										return {
											value: m.value,
											label: isTakenByOther ? `${m.label} — (ቀድሞ ተከፍሏል)` : m.label,
											disabled: isTakenByOther,
										};
									})}
									disabled={isUpdating}
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-foreground block mb-1.5">
									አዲስ ደረሰኝ Screenshot (አስፈላጊ ከሆነ ይምረጡ)
								</label>
								{editPreviewUrl ? (
									<div className="relative mb-2">
										<img
											src={editPreviewUrl}
											alt="Current receipt"
											className="max-h-48 w-full rounded-xl border border-white/15 object-contain bg-black/40"
										/>
										<label
											htmlFor="edit-screenshot-input"
											className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 cursor-pointer flex items-center gap-1.5"
										>
											<Upload size={12} /> ፎቶ ቀይር
										</label>
									</div>
								) : (
									<label
										htmlFor="edit-screenshot-input"
										className="bg-black/30 hover:bg-black/40 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
									>
										<Upload size={18} className="text-primary" />
										<span className="text-xs text-muted-foreground">አዲስ ደረሰኝ ይምረጡ (PNG, JPG)</span>
									</label>
								)}
								<input
									type="file"
									accept="image/*"
									id="edit-screenshot-input"
									onChange={handleEditFileChange}
									disabled={isUpdating}
									className="hidden"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={closeEditModal}
									disabled={isUpdating}
								>
									ሰርዝ (Cancel)
								</Button>
								<Button
									type="submit"
									size="sm"
									disabled={isUpdating || !editMonth}
									className="bg-primary text-primary-foreground font-semibold"
								>
									{isUpdating ? "በማስቀመጥ ላይ..." : "አስቀምጥ (Save Changes)"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Screenshot preview modal */}
			{selectedReceipt && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
					onClick={() => setSelectedReceipt(null)}
				>
					<div
						className="relative max-w-2xl w-full bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
							<h3 className="text-sm font-semibold text-foreground">የክፍያ ደረሰኝ (Payment Receipt)</h3>
							<button
								onClick={() => setSelectedReceipt(null)}
								className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
							>
								<X size={18} />
							</button>
						</div>
						<div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-auto">
							<img
								src={selectedReceipt}
								alt="Receipt preview"
								className="max-h-[70vh] w-auto rounded-lg object-contain"
							/>
						</div>
					</div>
				</div>
			)}

			<Footer />
		</div>
	);
};

export default Payment;
