"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader, PanelHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import PhotoPanel from "@/components/ui/photo-panel";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  Search,
  ImageIcon,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Payment, Student, Program, Section } from "@/types";

const statusTone = (status?: string) =>
  status === "Approved"
    ? "success"
    : status === "Rejected"
      ? "danger"
      : "warning";

interface StudentWithStatus extends Student {
  monthStatus: "Paid" | "Pending" | "Rejected" | "Unpaid";
  paymentRecord?: Payment;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<"roster" | "matrix">("roster");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("October");
  const [filterStatus, setFilterStatus] = useState("Unpaid");
  const [filterSection, setFilterSection] = useState("");
  const [filterProgram, setFilterProgram] = useState("");

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  // Receipt inspection modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Bank Account Settings state
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "Commercial Bank of Ethiopia (CBE)",
    accountName: "Ayanaw Mengesha and/or Motuma Kidanu",
    accountNumber: "1000720480337",
    instructions: "ወርሃዊ የተማሪ ክፍያ ወደ የሚከተለው የባንክ አካውንት ያስተላልፉ።",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const ethiopianMonths = useMemo(
    () => [
      { value: "October", label: "ጥቅምት (October)" },
      { value: "November", label: "ሕዳር (November)" },
      { value: "December", label: "ታሕሳስ (December)" },
      { value: "January", label: "ጥር (January)" },
      { value: "February", label: "የካቲት (February)" },
      { value: "March", label: "መጋቢት (March)" },
      { value: "April", label: "ሚያዚያ (April)" },
      { value: "May", label: "ግንቦት (May)" },
    ],
    []
  );

  const fetchMetadata = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [payRes, studRes, progRes, secRes, settingsRes] = await Promise.all([
        api.get("/payments", { headers }).catch(() => ({ data: { payments: [] } })),
        api.get("/students", { headers }).catch(() => ({ data: { students: [] } })),
        api.get("/programs").catch(() => ({ data: { programs: [] } })),
        api.get("/sections").catch(() => ({ data: { sections: [] } })),
        api.get("/payments/settings").catch(() => ({ data: { settings: null } })),
      ]);

      setPayments(payRes.data.payments || []);
      setStudents(studRes.data.students || []);
      setPrograms(progRes.data.programs || []);
      setSections(secRes.data.sections || []);
      if (settingsRes.data?.settings) {
        setBankForm({
          bankName: settingsRes.data.settings.bankName || "",
          accountName: settingsRes.data.settings.accountName || "",
          accountNumber: settingsRes.data.settings.accountNumber || "",
          instructions: settingsRes.data.settings.instructions || "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("የክፍያ መረጃዎችን ማምጣት አልተቻለም");
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Unique sections for dropdown
  const uniqueSections = useMemo(() => {
    const fromSecList = sections.map((s) => s.section).filter(Boolean);
    const fromStuds = students.map((s) => s.section).filter(Boolean);
    return Array.from(new Set([...fromSecList, ...fromStuds])).sort();
  }, [sections, students]);

  // Compute payment status for each student in the selected month
  const studentRoster = useMemo<StudentWithStatus[]>(() => {
    return students.map((st) => {
      const sId = (st.studentId || st.begenaId || "").trim().toLowerCase();
      const sProgId = (st.programId || "").trim().toLowerCase();
      const sName = (st.fullName || "").trim().toLowerCase();

      const matching = payments.filter((p) => {
        const pMonth = (p.month || "").trim().toLowerCase();
        if (pMonth !== selectedMonth.toLowerCase()) return false;

        const pId = (p.studentId || p.begenaId || "").trim().toLowerCase();
        const pName = (p.fullName || "").trim().toLowerCase();

        if (sId && pId && sId === pId) return true;
        if (sProgId && pId && sProgId === pId) return true;
        if (st._id && p.studentId && st._id === p.studentId) return true;
        if (sName && pName && sName === pName) return true;
        return false;
      });

      let paymentRecord: Payment | undefined;
      let monthStatus: "Paid" | "Pending" | "Rejected" | "Unpaid" = "Unpaid";

      if (matching.length > 0) {
        const approved = matching.find((p) => p.status === "Approved");
        const pending = matching.find((p) => !p.status || p.status === "Pending");
        const rejected = matching.find((p) => p.status === "Rejected");

        paymentRecord = approved || pending || rejected || matching[0];
        if (approved) monthStatus = "Paid";
        else if (pending) monthStatus = "Pending";
        else if (rejected) monthStatus = "Rejected";
      }

      return {
        ...st,
        monthStatus,
        paymentRecord,
      };
    });
  }, [students, payments, selectedMonth]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return studentRoster.filter((st) => {
      const sId = st.studentId || st.begenaId || "";
      const matchesSearch =
        (st.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        sId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.christianName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSection = filterSection ? st.section === filterSection : true;
      const matchesProgram = filterProgram ? st.program === filterProgram : true;

      const matchesStatus =
        !filterStatus
          ? true
          : filterStatus === "Unpaid"
            ? st.monthStatus === "Unpaid" || st.monthStatus === "Rejected"
            : filterStatus === "Paid"
              ? st.monthStatus === "Paid"
              : filterStatus === "Pending"
                ? st.monthStatus === "Pending"
                : true;

      return matchesSearch && matchesSection && matchesProgram && matchesStatus;
    });
  }, [studentRoster, searchQuery, filterSection, filterProgram, filterStatus]);

  // Statistics for selected month
  const stats = useMemo(() => {
    const base = studentRoster.filter((st) => {
      const matchesSection = filterSection ? st.section === filterSection : true;
      const matchesProgram = filterProgram ? st.program === filterProgram : true;
      return matchesSection && matchesProgram;
    });

    const total = base.length;
    const paid = base.filter((s) => s.monthStatus === "Paid").length;
    const pending = base.filter((s) => s.monthStatus === "Pending").length;
    const unpaid = base.filter(
      (s) => s.monthStatus === "Unpaid" || s.monthStatus === "Rejected"
    ).length;

    return { total, paid, pending, unpaid };
  }, [studentRoster, filterSection, filterProgram]);

  // Copy filtered student list to clipboard
  const handleCopyList = async () => {
    if (filteredStudents.length === 0) {
      toast.error("ኮፒ የሚደረግ ተማሪ አልተገኘም");
      return;
    }

    const monthObj = ethiopianMonths.find(
      (m) => m.value.toLowerCase() === selectedMonth.toLowerCase()
    );
    const monthLabel = monthObj ? monthObj.label : selectedMonth;

    let header = `የ${monthLabel} ወር የተማሪዎች ዝርዝር፦\n`;
    if (filterStatus === "Unpaid") {
      header = `የ${monthLabel} ወር ክፍያ ያልፈጸሙ ተማሪዎች (Unpaid List)፦\n`;
    } else if (filterStatus === "Paid") {
      header = `የ${monthLabel} ወር የከፈሉ ተማሪዎች (Paid List)፦\n`;
    } else if (filterStatus === "Pending") {
      header = `የ${monthLabel} ወር ክፍያቸው በመጠባበቅ ላይ ያሉ (Pending List)፦\n`;
    }

    if (filterSection) {
      header += `ክፍል (Section)፦ ${filterSection}\n`;
    }
    header += `------------------------------------\n`;

    const lines = filteredStudents.map((st, idx) => {
      const id = st.studentId || st.begenaId || "N/A";
      const sec = st.section ? ` (${st.section})` : "";
      const statusNote =
        !filterStatus
          ? st.monthStatus === "Paid"
            ? " - የከፈለ"
            : st.monthStatus === "Pending"
              ? " - በመጠባበቅ ላይ"
              : " - ያልከፈለ"
          : "";
      return `${idx + 1}. ${id} - ${st.fullName}${sec}${statusNote}`;
    });

    const footer = `\n------------------------------------\nጠቅላላ፦ ${filteredStudents.length} ተማሪዎች`;
    const fullText = `${header}${lines.join("\n")}${footer}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("የተማሪዎች ዝርዝር ተቀድቷል! ቴሌግራም ላይ መለጠፍ ትችላላችሁ");
    } catch {
      toast.error("ኮፒ ማድረግ አልተቻለም");
    }
  };

  // Quick copy a single student row
  const handleCopySingle = async (st: StudentWithStatus) => {
    const id = st.studentId || st.begenaId || "N/A";
    const text = `${id} - ${st.fullName}${st.section ? ` (${st.section})` : ""}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      toast.success(`${st.fullName} ተቀድቷል`);
    } catch {
      toast.error("ኮፒ ማድረግ አልተቻለም");
    }
  };

  // Update payment status (Approve / Reject)
  const handleUpdateStatus = async (
    paymentId: string,
    status: "Approved" | "Rejected"
  ) => {
    setIsUpdatingStatus(paymentId);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/payments/${paymentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayments((prev) =>
        prev.map((p) => (p._id === paymentId ? { ...p, status } : p))
      );

      toast.success(`ክፍያው ${status === "Approved" ? "ጸድቋል" : "ውድቅ ተደርጓል"}`);
      if (selectedPayment?._id === paymentId) {
        setSelectedPayment((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("ሁኔታውን መቀየር አልተቻለም");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountNumber || !bankForm.accountName) {
      toast.error("እባክዎ የአካውንት ስም እና ቁጥር ያስገቡ");
      return;
    }
    setIsSavingBank(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.put("/payments/settings", bankForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || "የባንክ አካውንት መረጃ በተሳካ ሁኔታ ተስተካክሏል");
      setBankModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "የባንክ አካውንት ማስተካከል አልተቻለም");
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monthly student tuition payments and verification roster."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBankModalOpen(true)}
              className="border-white/10 hover:border-primary/40 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Building2 size={14} className="text-primary" />
              <span>Bank Account</span>
            </Button>
            <div className="bg-surface inline-flex rounded-lg border border-white/10 p-1">
            {[
              {
                id: "roster" as const,
                label: `Student Roster (${filteredStudents.length})`,
              },
              { id: "matrix" as const, label: "Monthly Matrix" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
            </div>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: `Total Students (${selectedMonth})`,
            value: stats.total,
            className: "text-foreground",
          },
          {
            label: "Unpaid",
            value: stats.unpaid,
            className: "text-red-400",
          },
          {
            label: "Paid",
            value: stats.paid,
            className: "text-emerald-400",
          },
          {
            label: "Pending Approval",
            value: stats.pending,
            className: "text-amber-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-surface p-4 shadow-sm"
          >
            <p className="text-muted-foreground text-xs font-medium">
              {stat.label}
            </p>
            <p className={cn("mt-1.5 text-2xl font-bold", stat.className)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Clean Filters Bar */}
      <div className="relative z-20 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="search"
            placeholder="Search by name or student ID..."
            className="w-full pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>

        {/* Month Dropdown */}
        <div className="w-auto min-w-[170px]">
          <CustomSelect
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val)}
            options={ethiopianMonths}
          />
        </div>

        {/* Status Dropdown */}
        {activeTab === "roster" && (
          <div className="w-auto min-w-[160px]">
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: "", label: "ሁሉም ተማሪዎች" },
                { value: "Unpaid", label: "ያልከፈሉ ብቻ" },
                { value: "Paid", label: "የከፈሉ ብቻ" },
                { value: "Pending", label: "በመጠባበቅ ላይ" },
              ]}
            />
          </div>
        )}

        {/* Section Dropdown */}
        <div className="w-auto min-w-[140px]">
          <CustomSelect
            value={filterSection}
            onChange={(val) => setFilterSection(val)}
            options={[
              { value: "", label: "ሁሉም ክፍሎች" },
              ...uniqueSections.map((sec) => ({
                value: sec,
                label: sec,
              })),
            ]}
          />
        </div>

        {/* Program Dropdown */}
        <div className="w-auto min-w-[140px]">
          <CustomSelect
            value={filterProgram}
            onChange={(val) => setFilterProgram(val)}
            options={[
              { value: "", label: "ሁሉም ፕሮግራሞች" },
              ...programs.map((p) => ({
                value: p.name,
                label: p.name,
              })),
            ]}
          />
        </div>

        {/* Simple Copy Button */}
        {activeTab === "roster" && (
          <Button
            onClick={handleCopyList}
            className="flex items-center gap-1.5 whitespace-nowrap ml-auto"
            title="የተማሪዎችን ዝርዝር ኮፒ ያድርጉ"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>
              {copied ? "ተቀድቷል!" : `ዝርዝሩን ኮፒ አድርግ (${filteredStudents.length})`}
            </span>
          </Button>
        )}
      </div>

      {/* TAB 1: Student Roster */}
      {activeTab === "roster" && (
        <div className="bg-surface overflow-hidden rounded-xl border border-white/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-white/10 bg-white/[0.02] text-xs font-semibold tracking-wider uppercase">
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3 font-medium">መለያ (ID)</th>
                  <th className="px-4 py-3 font-medium">ሙሉ ስም</th>
                  <th className="px-4 py-3 font-medium">ክፍል</th>
                  <th className="px-4 py-3 font-medium">ስልክ</th>
                  <th className="px-4 py-3 font-medium text-center">
                    የ{selectedMonth} ሁኔታ
                  </th>
                  <th className="px-4 py-3 text-right">ተግባር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-muted-foreground py-10 text-center text-sm"
                    >
                      የተገኘ ተማሪ የለም (No students match this filter).
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    const idVal = st.studentId || st.begenaId || "N/A";
                    const pay = st.paymentRecord;

                    return (
                      <tr
                        key={st._id || idVal}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="text-primary px-4 py-3 font-mono text-xs font-semibold">
                          {idVal}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div>{st.fullName}</div>
                          {st.christianName && (
                            <div className="text-xs text-muted-foreground">
                              {st.christianName}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded bg-white/5 px-2 py-0.5 text-xs font-medium">
                            {st.section || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {st.phoneNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {st.monthStatus === "Paid" ? (
                            <Badge
                              tone="success"
                              className="gap-1 inline-flex items-center"
                            >
                              <CheckCircle2 size={12} />
                              <span>Paid</span>
                            </Badge>
                          ) : st.monthStatus === "Pending" ? (
                            <Badge
                              tone="warning"
                              className="gap-1 inline-flex items-center"
                            >
                              <Clock size={12} />
                              <span>Pending</span>
                            </Badge>
                          ) : st.monthStatus === "Rejected" ? (
                            <Badge
                              tone="danger"
                              className="gap-1 inline-flex items-center"
                            >
                              <XCircle size={12} />
                              <span>Rejected</span>
                            </Badge>
                          ) : (
                            <Badge
                              tone="danger"
                              className="gap-1 inline-flex items-center text-red-400 border-red-500/20 bg-red-500/10"
                            >
                              <span>🔴 Unpaid</span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {pay?.screenshot && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPayment(pay);
                                  setImageModalOpen(true);
                                }}
                                title="ደረሰኝ እይ (View Receipt)"
                                className="p-1.5 rounded text-sky-400 hover:bg-sky-500/10 transition-colors"
                              >
                                <ImageIcon size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopySingle(st)}
                              title="የተማሪውን ስም እና ID ኮፒ አድርግ"
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                            >
                              <Copy size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Monthly Matrix */}
      {activeTab === "matrix" && (
        <PhotoPanel src={siteImages.adminAncient} contentClassName="p-0">
          <PanelHeader
            title="Monthly payment matrix"
            className="flex-col sm:flex-row sm:items-center gap-3"
            action={
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {[
                  { label: "Paid", color: "bg-emerald-500" },
                  { label: "Pending", color: "bg-amber-500" },
                  { label: "Rejected", color: "bg-red-500" },
                  { label: "Unpaid", color: "bg-white/20" },
                ].map((legend) => (
                  <span key={legend.label} className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2 rounded-full", legend.color)}
                      aria-hidden
                    />
                    {legend.label}
                  </span>
                ))}
              </div>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
                  <th className="px-4 py-2.5 font-medium">Student ID</th>
                  <th className="px-4 py-2.5 font-medium">Full Name</th>
                  {ethiopianMonths.map((m) => (
                    <th
                      key={m.value}
                      className="px-3 py-2.5 text-center font-medium"
                    >
                      {m.label.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {studentRoster.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + ethiopianMonths.length}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      No students match the selected filters.
                    </td>
                  </tr>
                ) : (
                  studentRoster
                    .filter((st) => {
                      const sId = st.studentId || st.begenaId || "";
                      const matchesSearch =
                        (st.fullName || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        sId.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesSection = filterSection
                        ? st.section === filterSection
                        : true;
                      const matchesProgram = filterProgram
                        ? st.program === filterProgram
                        : true;
                      return matchesSearch && matchesSection && matchesProgram;
                    })
                    .map((student) => {
                      const sId = student.studentId || student.begenaId;
                      const studentPayments = payments.filter((p) => {
                        const pId = p.studentId || p.begenaId;
                        return (
                          (pId && pId === sId) ||
                          p.studentId === student._id ||
                          p.fullName?.toLowerCase() ===
                            student.fullName?.toLowerCase()
                        );
                      });

                      return (
                        <tr
                          key={student._id || sId}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="text-primary px-4 py-3 font-mono text-xs">
                            {sId}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {student.fullName}
                          </td>

                          {ethiopianMonths.map((m) => {
                            const pay = studentPayments.find(
                              (p) =>
                                p.month?.toLowerCase() === m.value.toLowerCase()
                            );
                            const st = pay ? pay.status || "Pending" : "Unpaid";

                            return (
                              <td
                                key={m.value}
                                className="px-3 py-3 text-center"
                              >
                                {st === "Unpaid" ? (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                ) : (
                                  <Badge tone={statusTone(st)}>
                                    {st === "Approved" ? "Paid" : st}
                                  </Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </PhotoPanel>
      )}

      {/* Receipt inspection modal */}
      <Modal
        isOpen={imageModalOpen && !!selectedPayment}
        onClose={() => setImageModalOpen(false)}
        title="Payment proof verification"
        description={
          selectedPayment
            ? `${selectedPayment.fullName} (${
                selectedPayment.studentId || selectedPayment.begenaId
              })`
            : undefined
        }
        className="max-w-2xl"
        footer={
          selectedPayment ? (
            <>
              <Button
                variant="outline"
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() =>
                  handleUpdateStatus(selectedPayment._id!, "Rejected")
                }
              >
                Reject (ውድቅ አድርግ)
              </Button>
              <Button
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() =>
                  handleUpdateStatus(selectedPayment._id!, "Approved")
                }
              >
                Approve (አጽድቅ)
              </Button>
            </>
          ) : null
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-background flex max-h-80 justify-center overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPayment.screenshot}
                alt="Receipt"
                className="max-h-80 w-full object-contain"
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "Student name", value: selectedPayment.fullName },
                {
                  label: "Student ID",
                  value:
                    selectedPayment.studentId || selectedPayment.begenaId,
                  mono: true,
                },
                {
                  label: "Program & section",
                  value: `${selectedPayment.program} — ${selectedPayment.section}`,
                },
                {
                  label: "Month & batch",
                  value: `${selectedPayment.month} (${selectedPayment.batch})`,
                },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-muted-foreground text-xs">
                    {item.label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 truncate text-sm font-medium",
                      item.mono && "text-primary font-mono"
                    )}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>

      {/* Dynamic Bank Account Settings Modal */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="Tuition Bank Account Settings"
        className="max-w-lg"
      >
        <form onSubmit={handleSaveBankSettings} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Official bank account details displayed to students when submitting monthly tuition payment receipts.
          </p>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              required
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              placeholder="e.g. Commercial Bank of Ethiopia (CBE)"
              className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Account Holder Name *
            </label>
            <input
              type="text"
              required
              value={bankForm.accountName}
              onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
              placeholder="e.g. Ayanaw Mengesha and/or Motuma Kidanu"
              className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Account Number *
            </label>
            <input
              type="text"
              required
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              placeholder="e.g. 1000720480337"
              className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={bankForm.instructions}
              onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
              placeholder="Transfer monthly student tuition to the following bank account."
              className="w-full p-2.5 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBankModalOpen(false)}
              disabled={isSavingBank}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingBank}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isSavingBank ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
