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
import React, { useState, useTransition, useCallback, useEffect, useMemo, useRef } from "react";
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
	Copy,
} from "lucide-react";
import api from "@/lib/api";
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
	<span className="flex items-center gap-2">
		<span className="bg-primary/20 text-primary border border-primary/30 flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
			{step}
		</span>
		<Icon size={16} className="text-primary shrink-0 sm:size-[18px]" />
		<span className="text-sm sm:text-base font-semibold">{children}</span>
	</span>
);

// Client-side image compressor: Resizes large phone photos (often 5-10MB) to ~300KB before upload
const compressImageFile = async (file: File): Promise<File> => {
	if (!file.type.startsWith("image/") || file.size < 800 * 1024) {
		return file; // If already under 800KB or not image, skip
	}
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new window.Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const maxDim = 1600;
				let width = img.width;
				let height = img.height;
				if (width > height && width > maxDim) {
					height = Math.round((height * maxDim) / width);
					width = maxDim;
				} else if (height > maxDim) {
					width = Math.round((width * maxDim) / height);
					height = maxDim;
				}
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					canvas.toBlob(
						(blob) => {
							if (blob) {
								const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
									type: "image/jpeg",
									lastModified: Date.now(),
								});
								resolve(compressedFile);
							} else {
								resolve(file);
							}
						},
						"image/jpeg",
						0.82
					);
				} else {
					resolve(file);
				}
			};
			img.onerror = () => resolve(file);
			img.src = e.target?.result as string;
		};
		reader.onerror = () => resolve(file);
		reader.readAsDataURL(file);
	});
};

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

	// Dynamic Bank Account Settings
	const [bankSettings, setBankSettings] = useState({
		bankName: "Commercial Bank of Ethiopia (CBE)",
		accountName: "Ayanaw Mengesha and/or Motuma Kidanu",
		accountNumber: "1000720480337",
		instructions: "ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።",
	});
	const [accountCopied, setAccountCopied] = useState(false);

	useEffect(() => {
		api.get("/payments/settings")
			.then((res) => {
				if (res.data?.settings) {
					setBankSettings({
						bankName: res.data.settings.bankName || "Commercial Bank of Ethiopia (CBE)",
						accountName: res.data.settings.accountName || "Ayanaw Mengesha and/or Motuma Kidanu",
						accountNumber: res.data.settings.accountNumber || "1000720480337",
						instructions: res.data.settings.instructions || "ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።",
					});
				}
			})
			.catch(() => null);
	}, []);

	const copyAccountNumber = async () => {
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(bankSettings.accountNumber.trim());
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = bankSettings.accountNumber.trim();
				textarea.style.position = "fixed";
				textarea.style.left = "-9999px";
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			setAccountCopied(true);
			toast.success("የሂሳብ ቁጥር ተገልብጧል (Account number copied!)");
			setTimeout(() => setAccountCopied(false), 2500);
		} catch {
			toast.error("ኮፒ ማድረግ አልተቻለም");
		}
	};

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
			const res = await api.get(`/payments/student/${encodeURIComponent(studentId.trim())}`);
			if (res.data?.success && Array.isArray(res.data.payments)) {
				setPaymentHistory(res.data.payments);
			} else {
				setPaymentHistory([]);
			}
		} catch (err) {
			console.error("Payment history fetch error:", err);
		} finally {
			setLoadingPayments(false);
		}
	}, []);

	// Auto-lookup student by Student ID
	const performStudentLookup = useCallback(async (idToLookup: string) => {
		const cleanId = idToLookup ? idToLookup.trim() : "";
		if (!cleanId || cleanId.length < 2) {
			setFoundStudent(null);
			setHasSearched(false);
			setPaymentHistory([]);
			return;
		}

		setIsLookingUp(true);
		setHasSearched(true);
		try {
			const res = await api.get(`/students/lookup/${encodeURIComponent(cleanId)}`);
			if (res.data?.success && res.data.student) {
				const s: FoundStudent = res.data.student;
				setFoundStudent(s);
				setFullName(s.fullName || "");
				if (s.program) setSelectedProgram(s.program);
				if (s.section) setSelectedSection(s.section);
				if (s.batch) setSelectedBatch(s.batch);
				toast.success(`ተማሪ ተረጋግጧል: ${s.fullName}`);
				fetchPaymentsForStudent(s.studentId);
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

	// Auto-fill logged in student info on load
	useEffect(() => {
		const token = getValidStudentToken();
		const student = getStudentData();
		const sId = student?.studentId || student?.programId || student?.begenaId;
		if (token && sId) {
			setIsLoggedInStudent(true);
			setBegenaId(sId);
			setFullName(student.fullName || "");
			if (student.program) setSelectedProgram(student.program);
			if (student.section) setSelectedSection(student.section);
			if (student.batch) setSelectedBatch(student.batch);
			// Hydrate student immediately so the form is never blocked
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

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			toast.loading("ደረሰኝ በማዘጋጀት ላይ...", { id: "compress-img" });
			const processed = await compressImageFile(file);
			toast.dismiss("compress-img");
			setSelectedFile(processed);
			setPreviewUrl(URL.createObjectURL(processed));
		}
	};

	const removeImage = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
	};

	const openEditModal = (p: PaymentRecord) => {
		setEditingPayment(p);
		setEditMonth(p.month || "");
		setEditFile(null);
		setEditPreviewUrl(p.screenshot || null);
	};

	const closeEditModal = () => {
		setEditingPayment(null);
		setEditMonth("");
		setEditFile(null);
		setEditPreviewUrl(null);
	};

	const handleUpdatePendingPayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingPayment?._id) return;

		if (!editMonth) {
			toast.error("እባክዎን ወር ይምረጡ");
			return;
		}

		setIsUpdating(true);
		try {
			const formData = new FormData();
			formData.set("month", editMonth);
			const sId = foundStudent?.studentId || begenaId.trim();
			if (sId) formData.set("studentId", sId);
			if (editFile) {
				const processed = await compressImageFile(editFile);
				formData.set("screenshot", processed);
			}

			const res = await updatePendingPayment(editingPayment._id, formData);
			if (res?.error) {
				toast.error(res.error);
			} else {
				toast.success("የክፍያ ደረሰኝ በተሳካ ሁኔታ ተስተካክሏል!");
				closeEditModal();
				if (sId) {
					fetchPaymentsForStudent(sId);
				}
			}
		} catch (err) {
			console.error(err);
			toast.error("ማስተካከል አልተቻለም");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isPending) return;

		if (!foundStudent) {
			toast.error("እባክዎ መጀመሪያ የተማሪ ID አስገብተው ያረጋግጡ (Verify ID)");
			return;
		}

		if (!selectedMonth) {
			toast.error("እባክዎ የሚከፍሉበትን ወር ይምረጡ");
			return;
		}

		if (submittedMonths.has(selectedMonth)) {
			toast.error(`ለ ${selectedMonth} ወር ክፍያ ቀድሞ ተልኳል። ድጋሚ መላክ አይቻልም።`);
			return;
		}

		if (!selectedFile) {
			toast.error("እባክዎን የክፍያ ደረሰኝ (Screenshot) ያስገቡ");
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
				toast.success("ክፍያው በተሳካ ሁኔታ ተልኳል! በቅርቡ ይጸድቃል።");
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
				label: isAlreadySubmitted ? `${m.label} — (ቀድሞ ተከፍሏል)` : m.label,
				disabled: isAlreadySubmitted,
			};
		}),
	];

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Navbar />

			<PageBody className="py-4 sm:py-8">
				<PageContainer className="space-y-4 sm:space-y-6 px-3 sm:px-6">
					{/* Compact Banner */}
					<Figure
						src={siteImages.paymentBanner}
						alt="ባህላዊ በገና"
						ratio="ultrawide"
						priority
						scrim
						className="rounded-2xl overflow-hidden shadow-sm"
					>
						<p className="text-primary text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase flex items-center gap-1.5">
							<ShieldCheck size={14} /> ወርሃዊ ክፍያ
						</p>
						<h1 className="mt-1 text-xl sm:text-3xl font-extrabold tracking-tight text-white">
							የክፍያ ማረጋገጫ ማስገቢያ
						</h1>
					</Figure>

					{/* Logged in student banner */}
					{isLoggedInStudent && foundStudent && (
						<div className="rounded-xl border border-primary/30 bg-primary/10 p-3 sm:p-4 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
							<div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
								<div className="size-9 sm:size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-primary/30">
									🎓
								</div>
								<div className="min-w-0">
									<p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 truncate">
										{foundStudent.fullName}
										<span className="text-[11px] font-mono text-primary bg-primary/20 px-2 py-0.5 rounded-full shrink-0">
											{foundStudent.studentId}
										</span>
									</p>
									<p className="text-[11px] text-muted-foreground truncate">
										{foundStudent.program} · {foundStudent.section}
									</p>
								</div>
							</div>
							<Button asChild size="sm" className="w-full sm:w-auto h-8 text-xs bg-primary text-primary-foreground font-semibold shrink-0 gap-1.5">
								<Link href="/student/dashboard">
									<span>ወደ ዳሽቦርድ ሂድ</span>
									<ArrowRight size={13} />
								</Link>
							</Button>
						</div>
					)}

					{/* Bank Details Card: Optimized for quick one-tap copy on phones */}
					<PhotoPanel
						src={siteImages.noticeCard}
						className="border-primary/30 shadow-md backdrop-blur rounded-2xl"
						contentClassName="p-4 sm:p-6"
					>
						<div className="flex items-center gap-2.5">
							<div className="bg-primary/20 text-primary flex size-8 sm:size-9 items-center justify-center rounded-lg border border-primary/30 shrink-0">
								<Building2 size={18} />
							</div>
							<div className="min-w-0">
								<h2 className="text-primary text-xs sm:text-sm font-bold tracking-wider uppercase">
									የክፍያ መመሪያ (Bank Transfer)
								</h2>
								<p className="text-muted-foreground text-[11px] sm:text-xs truncate">
									{bankSettings.instructions || "ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።"}
								</p>
							</div>
						</div>

						<div className="mt-3.5 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
							<div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
								<span className="text-muted-foreground text-[10px] sm:text-xs font-medium block">ባንክ (Bank)</span>
								<span className="text-xs sm:text-sm font-bold text-foreground block mt-0.5">
									{bankSettings.bankName}
								</span>
							</div>

							<div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
								<span className="text-muted-foreground text-[10px] sm:text-xs font-medium block">የአካውንት ስም (Account Name)</span>
								<span className="text-xs sm:text-sm font-semibold text-foreground block mt-0.5 truncate">
									{bankSettings.accountName}
								</span>
							</div>

							<div className="bg-primary/10 rounded-xl p-3 border border-primary/35 flex items-center justify-between gap-2">
								<div className="min-w-0">
									<span className="text-muted-foreground text-[10px] sm:text-xs font-medium block">የሂሳብ ቁጥር (Account Number)</span>
									<span className="text-primary font-mono text-sm sm:text-base font-extrabold tracking-wider block mt-0.5 truncate">
										{bankSettings.accountNumber}
									</span>
								</div>
								<button
									type="button"
									onClick={copyAccountNumber}
									className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
								>
									{accountCopied ? <Check size={14} /> : <Copy size={14} />}
									<span>{accountCopied ? "ተገልብጧል" : "ኮፒ አድርግ"}</span>
								</button>
							</div>
						</div>
					</PhotoPanel>

					{/* 3-Step Payment Form */}
					<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
						{/* Step 1 — Student ID */}
						<PhotoPanel
							src={siteImages.studentProfile}
							contentClassName="p-4 sm:p-5"
							className="rounded-2xl"
						>
							<div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
								<StepTitle step={1} icon={UserCheck}>የተማሪ ID (Student ID)</StepTitle>
								{isLookingUp && (
									<span className="text-primary text-xs font-medium flex items-center gap-1 animate-pulse">
										<Loader2 size={12} className="animate-spin" /> በማረጋገጥ ላይ...
									</span>
								)}
							</div>

							<div className="mt-3.5 space-y-3">
								<div className="flex flex-col sm:flex-row gap-2">
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
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													performStudentLookup(begenaId);
												}
											}}
											onBlur={() => !isLoggedInStudent && performStudentLookup(begenaId)}
											placeholder="ምሳሌ፡ 001/08 ወይም 15/03"
											readOnly={isLoggedInStudent}
											className={`w-full h-11 font-mono bg-black/40 border border-white/15 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3.5 text-sm text-foreground ${
												isLoggedInStudent ? "cursor-not-allowed opacity-80" : ""
											}`}
											disabled={isPending || isLoggedInStudent}
										/>
										{isLoggedInStudent && (
											<Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
										)}
									</div>

									{!isLoggedInStudent && (
										<Button
											type="button"
											variant="secondary"
											onClick={() => performStudentLookup(begenaId)}
											disabled={isLookingUp || !begenaId.trim()}
											className="h-11 px-5 text-xs sm:text-sm font-semibold shrink-0 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
										>
											{isLookingUp ? "በማረጋገጥ ላይ..." : "ID አረጋግጥ (Verify ID)"}
										</Button>
									)}
								</div>

								{foundStudent ? (
									<div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 sm:p-3.5 backdrop-blur-sm">
										<div className="flex items-center justify-between gap-2">
											<span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-300">
												<Check size={16} /> የተረጋገጠ ተማሪ (Verified)
											</span>
											<span className="text-primary font-mono text-xs font-bold bg-primary/20 px-2 py-0.5 rounded">
												{foundStudent.studentId}
											</span>
										</div>
										<dl className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-emerald-500/20 pt-2.5 text-xs">
											<div>
												<dt className="text-muted-foreground text-[10px]">ሙሉ ስም</dt>
												<dd className="font-semibold text-foreground truncate">{foundStudent.fullName}</dd>
											</div>
											<div>
												<dt className="text-muted-foreground text-[10px]">ፕሮግራም</dt>
												<dd className="font-medium text-foreground truncate">{foundStudent.program}</dd>
											</div>
											<div>
												<dt className="text-muted-foreground text-[10px]">ምድብ</dt>
												<dd className="font-medium text-foreground truncate">{foundStudent.section}</dd>
											</div>
											<div>
												<dt className="text-muted-foreground text-[10px]">ዙር</dt>
												<dd className="font-medium text-foreground truncate">{foundStudent.batch}</dd>
											</div>
										</dl>
									</div>
								) : (
									hasSearched &&
									!isLookingUp &&
									begenaId.trim().length >= 2 && (
										<div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-xs">
											<AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
											<div>
												<p className="font-bold text-red-200">የተማሪ መለያ አልተገኘም (ID Not Found)</p>
												<p className="text-red-300/80 mt-0.5 text-[11px]">
													እባክዎ የተማሪ መለያዎን (ID) በትክክል መጻፉን ያረጋግጡ (ምሳሌ፡ 001/08 ወይም 15/03)።
												</p>
											</div>
										</div>
									)
								)}
							</div>
						</PhotoPanel>

						{/* Step 2 — Month */}
						<PhotoPanel
							src={siteImages.scheduleCard}
							contentClassName="p-4 sm:p-5"
							className="rounded-2xl"
						>
							<div className="pb-3 border-b border-white/5">
								<StepTitle step={2} icon={Calendar}>የሚከፍሉበት ወር (Month)</StepTitle>
							</div>
							<div className="mt-3.5 space-y-2">
								<CustomSelect
									id="month"
									value={selectedMonth}
									onChange={(val) => {
										if (submittedMonths.has(val)) {
											toast.error(`ለ ${val} ወር ቀድሞ ክፍያ ተልኳል`);
											return;
										}
										setSelectedMonth(val);
									}}
									options={monthOptions}
									disabled={isPending || !foundStudent}
								/>
								{!foundStudent && (
									<p className="text-amber-300/90 text-xs mt-1">
										⚠️ ወር ለመምረጥ በቅድሚያ የተማሪ መለያዎን ያረጋግጡ (Verify ID first).
									</p>
								)}
							</div>
						</PhotoPanel>

						{/* Step 3 — Receipt Upload */}
						<PhotoPanel
							src={siteImages.begenaHistory}
							contentClassName="p-4 sm:p-5"
							className="rounded-2xl"
						>
							<div className="pb-3 border-b border-white/5">
								<StepTitle step={3} icon={UploadCloud}>የክፍያ Screenshot (Receipt)</StepTitle>
							</div>
							<div className="mt-3.5">
								{previewUrl ? (
									<div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40">
										<Image
											src={previewUrl}
											alt="Payment screenshot preview"
											width={600}
											height={400}
											className="max-h-64 sm:max-h-80 w-full object-contain"
										/>
										<button
											type="button"
											onClick={removeImage}
											disabled={isPending}
											aria-label="Remove screenshot"
											className="bg-black/70 hover:bg-red-600 text-white absolute top-3 right-3 size-8 flex items-center justify-center rounded-full border border-white/20 backdrop-blur transition-colors"
										>
											<X size={16} />
										</button>
									</div>
								) : (
									<label
										htmlFor="screenshot-input"
										className={`hover:border-primary/50 hover:bg-primary/10 bg-black/30 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-white/20 px-4 py-8 text-center transition-all ${
											!foundStudent ? "opacity-50 cursor-not-allowed" : ""
										}`}
									>
										<div className="bg-primary/15 text-primary flex size-11 items-center justify-center rounded-full border border-primary/25">
											<Upload size={20} />
										</div>
										<div>
											<span className="text-xs sm:text-sm font-bold text-foreground block">
												የክፍያ ደረሰኝ (Screenshot) ይምረጡ
											</span>
											<span className="text-muted-foreground text-[11px] mt-0.5 block">
												ፎቶ ወይም ስክሪንሾት (PNG, JPG, WEBP)
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
							</div>
						</PhotoPanel>

						{/* Submit Button: Full-width, thumb-friendly on phones */}
						<Button
							type="submit"
							size="lg"
							disabled={isPending || !selectedFile || !foundStudent || !selectedMonth || submittedMonths.has(selectedMonth)}
							className="w-full h-12 text-sm sm:text-base font-bold shadow-lg shadow-primary/25 rounded-xl"
						>
							{isPending ? (
								<span className="flex items-center gap-2">
									<Loader2 size={16} className="animate-spin" /> በማስገባት ላይ...
								</span>
							) : !foundStudent ? (
								"እባክዎ መጀመሪያ የተማሪ ID ያረጋግጡ"
							) : (
								"ክፍያውን አስገባ (Submit Payment Proof) →"
							)}
						</Button>
					</form>

					{/* Payment History Section */}
					{(foundStudent || paymentHistory.length > 0 || loadingPayments) && (
						<PhotoPanel
							src={siteImages.orthodoxChurch}
							contentClassName="p-0"
							className="border-white/10 shadow-md backdrop-blur rounded-2xl overflow-hidden mt-6"
						>
							<PanelHeader
								title={
									<span className="flex items-center gap-2 text-sm sm:text-base">
										<History size={16} className="text-primary" />
										<span>የክፍያ ታሪክ (Payment History)</span>
									</span>
								}
								description={
									foundStudent
										? `${foundStudent.fullName} (${foundStudent.studentId})`
										: "የተመዘገቡ ክፍያዎች"
								}
								action={
									loadingPayments ? (
										<span className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
											<Loader2 size={12} className="animate-spin" /> በማምጣት ላይ...
										</span>
									) : (
										<span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-full">
											{paymentHistory.length} ክፍያ(ዎች)
										</span>
									)
								}
							/>
							<PanelBody className="p-0">
								{loadingPayments && paymentHistory.length === 0 ? (
									<div className="flex items-center justify-center py-10">
										<Loader2 size={22} className="animate-spin text-primary" />
									</div>
								) : paymentHistory.length === 0 ? (
									<div className="py-10 text-center text-muted-foreground text-xs sm:text-sm px-4">
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
													className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 gap-2.5 hover:bg-white/[0.02] transition-colors"
												>
													<div className="flex items-start gap-2.5 sm:gap-3">
														<div className="bg-white/5 rounded-lg p-2 shrink-0 text-center min-w-[56px] border border-white/5">
															<span className="text-[10px] uppercase font-bold text-muted-foreground block">
																{p.year || "2026"}
															</span>
															<span className="text-xs font-bold text-primary block truncate max-w-[70px]">
																{p.month}
															</span>
														</div>
														<div className="min-w-0">
															<div className="flex items-center gap-2 flex-wrap">
																<span className="text-xs sm:text-sm font-bold text-foreground">
																	{p.month} {p.year || "2026"}
																</span>
																<Badge tone={tone} className="text-[10px] sm:text-xs">
																	{status === "Approved" ? "✓ ጸድቋል" : status === "Rejected" ? "✕ ውድቅ ተደርጓል" : "⏳ በመጠባበቅ ላይ"}
																</Badge>
															</div>
															<p className="text-[11px] text-muted-foreground mt-0.5 truncate">
																{p.program || "Basic በገና"} · {p.section}
															</p>
															{p.adminNotes && (
																<p className="text-[11px] text-amber-300/90 mt-0.5 italic">
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
																className="h-7 text-xs gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
															>
																<Edit3 size={12} /> አስተካክል
															</Button>
														)}

														{p.screenshot && (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => setSelectedReceipt(p.screenshot)}
																className="h-7 text-xs gap-1 border-white/10 hover:border-primary/40"
															>
																<ExternalLink size={12} /> ደረሰኝ
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
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md"
					onClick={closeEditModal}
				>
					<div
						className="relative max-w-lg w-full bg-slate-900 rounded-2xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-3 border-b border-white/10">
							<div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
								<Edit3 size={18} />
								<h3>የክፍያ ማስተካከያ (Edit Payment)</h3>
							</div>
							<button
								onClick={closeEditModal}
								className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleUpdatePendingPayment} className="space-y-4">
							<div className="space-y-1">
								<label className="text-xs font-semibold text-foreground block">
									የሚከፍሉበት ወር *
								</label>
								<CustomSelect
									value={editMonth}
									onChange={setEditMonth}
									options={months}
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-semibold text-foreground block">
									አዲስ ደረሰኝ (Screenshot) ይምረጡ (አማራጭ)
								</label>
								{editPreviewUrl ? (
									<div className="relative rounded-xl overflow-hidden border border-white/10">
										<Image
											src={editPreviewUrl}
											alt="Edit receipt preview"
											width={400}
											height={250}
											className="max-h-48 w-full object-contain bg-black/50"
										/>
										<button
											type="button"
											onClick={() => {
												setEditFile(null);
												setEditPreviewUrl(null);
											}}
											className="absolute top-2 right-2 size-7 rounded-full bg-black/70 text-white flex items-center justify-center"
										>
											<X size={14} />
										</button>
									</div>
								) : (
									<label className="border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05]">
										<Upload size={18} className="text-primary" />
										<span className="text-xs text-foreground font-medium">አዲስ ደረሰኝ ይምረጡ</span>
										<input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													setEditFile(file);
													setEditPreviewUrl(URL.createObjectURL(file));
												}
											}}
											className="hidden"
										/>
									</label>
								)}
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
								<Button type="button" variant="ghost" size="sm" onClick={closeEditModal}>
									ሰርዝ
								</Button>
								<Button type="submit" size="sm" disabled={isUpdating} className="font-bold">
									{isUpdating ? "በማስተካከል ላይ..." : "አዘምን (Update)"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Fullscreen Receipt Modal */}
			{selectedReceipt && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 backdrop-blur-md"
					onClick={() => setSelectedReceipt(null)}
				>
					<div
						className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-3.5 border-b border-white/10">
							<span className="text-xs sm:text-sm font-semibold text-foreground">የክፍያ ደረሰኝ (Receipt)</span>
							<button
								onClick={() => setSelectedReceipt(null)}
								className="text-muted-foreground hover:text-foreground p-1"
							>
								<X size={18} />
							</button>
						</div>
						<div className="p-3 max-h-[75vh] overflow-y-auto flex items-center justify-center bg-black/40">
							<Image
								src={selectedReceipt}
								alt="Receipt preview"
								width={800}
								height={600}
								className="max-h-[70vh] w-auto object-contain rounded-lg"
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
