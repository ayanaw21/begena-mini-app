"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, PageHeader, PanelHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import PhotoPanel from "@/components/ui/photo-panel";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Copy,
  Check,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
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
  const [activeTab, setActiveTab] = useState<"list" | "roster" | "matrix">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Roster Tab State
  const [selectedRosterMonth, setSelectedRosterMonth] = useState<string>("October");
  const [rosterStatusFilter, setRosterStatusFilter] = useState<
    "all" | "unpaid" | "paid" | "pending"
  >("all");

  // Telegram Export Modal State
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [telegramType, setTelegramType] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [telegramGroupSection, setTelegramGroupSection] = useState(true);
  const [telegramIncludePhone, setTelegramIncludePhone] = useState(false);
  const [telegramCustomNote, setTelegramCustomNote] = useState("");
  const [copied, setCopied] = useState(false);

  // Modals & Action States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false);

  const ethiopianMonths = useMemo(
    () => [
      { key: "October", label: "ጥቅምት" },
      { key: "November", label: "ሕዳር" },
      { key: "December", label: "ታሕሳስ" },
      { key: "January", label: "ጥር" },
      { key: "February", label: "የካቲት" },
      { key: "March", label: "መጋቢት" },
      { key: "April", label: "ሚያዚያ" },
      { key: "May", label: "ግንቦት" },
    ],
    []
  );

  const fetchMetadata = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [payRes, studRes, progRes, secRes] = await Promise.all([
        api.get("/payments", { headers }).catch(() => ({ data: { payments: [] } })),
        api.get("/students", { headers }).catch(() => ({ data: { students: [] } })),
        api.get("/programs").catch(() => ({ data: { programs: [] } })),
        api.get("/sections").catch(() => ({ data: { sections: [] } })),
      ]);

      setPayments(payRes.data.payments || []);
      setStudents(studRes.data.students || []);
      setPrograms(progRes.data.programs || []);
      setSections(secRes.data.sections || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payment management data");
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Status statistics for Receipts
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => !p.status || p.status === "Pending").length;
    const approved = payments.filter((p) => p.status === "Approved").length;
    const rejected = payments.filter((p) => p.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [payments]);

  // Unique options for dropdowns
  const uniqueSections = useMemo(() => {
    const fromPayments = payments.map((p) => p.section).filter(Boolean);
    const fromSecList = sections.map((s) => s.section).filter(Boolean);
    const fromStuds = students.map((s) => s.section).filter(Boolean);
    return Array.from(new Set([...fromPayments, ...fromSecList, ...fromStuds])).sort();
  }, [payments, sections, students]);

  const uniqueBatches = useMemo(() => {
    const fromPayments = payments.map((p) => p.batch).filter(Boolean);
    const fromStuds = students.map((s) => s.batch).filter(Boolean);
    return Array.from(new Set([...fromPayments, ...fromStuds])).sort();
  }, [payments, students]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const idStr = p.studentId || p.begenaId || "";
      const matchesSearch =
        (p.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProgram = filterProgram ? p.program === filterProgram : true;
      const matchesSection = filterSection ? p.section === filterSection : true;
      const matchesBatch = filterBatch ? p.batch === filterBatch : true;
      const matchesMonth = filterMonth ? p.month === filterMonth : true;
      const matchesStatus = filterStatus
        ? filterStatus === "Pending"
          ? !p.status || p.status === "Pending"
          : p.status === filterStatus
        : true;

      return (
        matchesSearch &&
        matchesProgram &&
        matchesSection &&
        matchesBatch &&
        matchesMonth &&
        matchesStatus
      );
    });
  }, [
    payments,
    searchQuery,
    filterProgram,
    filterSection,
    filterBatch,
    filterMonth,
    filterStatus,
  ]);

  // Filtered students base list (before status filter)
  const filteredBaseStudents = useMemo(() => {
    return students.filter((s) => {
      const idStr = s.studentId || s.begenaId || "";
      const matchesSearch =
        (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.christianName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = filterProgram ? s.program === filterProgram : true;
      const matchesSection = filterSection ? s.section === filterSection : true;
      const matchesBatch = filterBatch ? s.batch === filterBatch : true;
      return matchesSearch && matchesProgram && matchesSection && matchesBatch;
    });
  }, [students, searchQuery, filterProgram, filterSection, filterBatch]);

  // Compute student payment status for the selected roster month
  const rosterStudents = useMemo<StudentWithStatus[]>(() => {
    return filteredBaseStudents.map((st) => {
      const sId = (st.studentId || st.begenaId || "").trim().toLowerCase();
      const sProgId = (st.programId || "").trim().toLowerCase();
      const sName = (st.fullName || "").trim().toLowerCase();

      const matching = payments.filter((p) => {
        const pMonth = (p.month || "").trim().toLowerCase();
        if (pMonth !== selectedRosterMonth.toLowerCase()) return false;

        const pId = (p.studentId || p.begenaId || "").trim().toLowerCase();
        const pName = (p.fullName || "").trim().toLowerCase();

        if (sId && pId && sId === pId) return true;
        if (sProgId && pId && sProgId === pId) return true;
        if (st._id && p.studentId && st._id === p.studentId) return true;
        if (sName && pName && sName === pName) return true;

        return false;
      });

      let chosenPay: Payment | undefined;
      let monthStatus: "Paid" | "Pending" | "Rejected" | "Unpaid" = "Unpaid";

      if (matching.length > 0) {
        const approved = matching.find((p) => p.status === "Approved");
        const pending = matching.find((p) => !p.status || p.status === "Pending");
        const rejected = matching.find((p) => p.status === "Rejected");

        chosenPay = approved || pending || rejected || matching[0];
        if (approved) {
          monthStatus = "Paid";
        } else if (pending) {
          monthStatus = "Pending";
        } else if (rejected) {
          monthStatus = "Rejected";
        }
      }

      return {
        ...st,
        monthStatus,
        paymentRecord: chosenPay,
      };
    });
  }, [filteredBaseStudents, payments, selectedRosterMonth]);

  // Filtered Roster by selected status pill
  const filteredRosterStudents = useMemo(() => {
    if (rosterStatusFilter === "all") return rosterStudents;
    if (rosterStatusFilter === "unpaid") {
      return rosterStudents.filter(
        (s) => s.monthStatus === "Unpaid" || s.monthStatus === "Rejected"
      );
    }
    if (rosterStatusFilter === "paid") {
      return rosterStudents.filter((s) => s.monthStatus === "Paid");
    }
    if (rosterStatusFilter === "pending") {
      return rosterStudents.filter((s) => s.monthStatus === "Pending");
    }
    return rosterStudents;
  }, [rosterStudents, rosterStatusFilter]);

  // Roster Statistics for the selected month
  const rosterStats = useMemo(() => {
    const total = rosterStudents.length;
    const paid = rosterStudents.filter((s) => s.monthStatus === "Paid").length;
    const pending = rosterStudents.filter((s) => s.monthStatus === "Pending").length;
    const unpaid = rosterStudents.filter(
      (s) => s.monthStatus === "Unpaid" || s.monthStatus === "Rejected"
    ).length;
    return { total, paid, pending, unpaid };
  }, [rosterStudents]);

  // Clipboard copy function
  const copyTextToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success(`${label} ተቀድቷል! ቴሌግራም ላይ መለጠፍ ትችላላችሁ (Copied to clipboard)`);
    } catch (err) {
      console.error("Clipboard copy error:", err);
      toast.error("ኮፒ ማድረግ አልተቻለም፤ እባክዎ እንደገና ይሞክሩ");
    }
  };

  // Generate Telegram text
  const generateTelegramText = useCallback(
    (
      type: "unpaid" | "paid" | "all",
      grouped: boolean,
      includePhone: boolean,
      customNote?: string
    ) => {
      const currentMonthObj =
        ethiopianMonths.find(
          (m) => m.key.toLowerCase() === selectedRosterMonth.toLowerCase()
        ) || { key: selectedRosterMonth, label: selectedRosterMonth };

      let targetStudents = rosterStudents;
      if (type === "unpaid") {
        targetStudents = rosterStudents.filter(
          (s) => s.monthStatus === "Unpaid" || s.monthStatus === "Rejected"
        );
      } else if (type === "paid") {
        targetStudents = rosterStudents.filter((s) => s.monthStatus === "Paid");
      }

      const titleEmoji = type === "unpaid" ? "⚠️" : type === "paid" ? "✅" : "📋";
      const titleText =
        type === "unpaid"
          ? "ክፍያ ያልፈጸሙ ተማሪዎች ዝርዝር (Unpaid Students)"
          : type === "paid"
            ? "ክፍያቸው የተረጋገጠ ተማሪዎች ዝርዝር (Paid Students)"
            : "አጠቃላይ የተማሪዎች የክፍያ ሁኔታ (All Students)";

      let output = "";
      output += `❖━━━━━━━━━━━━━━━━━━━━❖\n`;
      output += `${titleEmoji} የበገና ንዑስ ክፍል ተማሪዎች የክፍያ መረጃ\n`;
      output += `📅 ወር፦ ${currentMonthObj.label} (${currentMonthObj.key})\n`;
      if (filterSection) {
        output += `📍 ክፍል (Section)፦ ${filterSection}\n`;
      }
      if (filterProgram) {
        output += `🎓 ፕሮግራም፦ ${filterProgram}\n`;
      }
      output += `❖━━━━━━━━━━━━━━━━━━━━❖\n\n`;
      output += `📌 ${titleText}፦\n\n`;

      if (targetStudents.length === 0) {
        output += `(ምንም ተማሪ አልተገኘም / No students found)\n\n`;
      } else if (grouped) {
        const bySection: { [sec: string]: StudentWithStatus[] } = {};
        targetStudents.forEach((st) => {
          const secKey = st.section || "Unassigned";
          if (!bySection[secKey]) bySection[secKey] = [];
          bySection[secKey].push(st);
        });

        const sortedSecKeys = Object.keys(bySection).sort();
        sortedSecKeys.forEach((secKey) => {
          output += `📍 ክፍል ${secKey} (${bySection[secKey].length} ተማሪዎች)፦\n`;
          bySection[secKey].forEach((st, idx) => {
            const idStr = st.studentId || st.begenaId || "N/A";
            const phoneStr =
              includePhone && st.phoneNumber ? ` | 📱 ${st.phoneNumber}` : "";
            const statusBadge =
              type === "all"
                ? st.monthStatus === "Paid"
                  ? " — ✅ የከፈለ"
                  : st.monthStatus === "Pending"
                    ? " — 🟡 በመጠባበቅ ላይ"
                    : " — 🔴 ያልከፈለ"
                : "";
            output += `${idx + 1}. ${idStr} - ${st.fullName}${statusBadge}${phoneStr}\n`;
          });
          output += `\n`;
        });
      } else {
        targetStudents.forEach((st, idx) => {
          const idStr = st.studentId || st.begenaId || "N/A";
          const secStr = st.section ? ` (${st.section})` : "";
          const phoneStr =
            includePhone && st.phoneNumber ? ` | 📱 ${st.phoneNumber}` : "";
          const statusBadge =
            type === "all"
              ? st.monthStatus === "Paid"
                ? " — ✅ የከፈለ"
                : st.monthStatus === "Pending"
                  ? " — 🟡 በመጠባበቅ ላይ"
                  : " — 🔴 ያልከፈለ"
              : "";
          output += `${idx + 1}. ${idStr} - ${st.fullName}${secStr}${statusBadge}${phoneStr}\n`;
        });
        output += `\n`;
      }

      // Summary counts
      output += `❖━━━━━━━━━━━━━━━━━━━━❖\n`;
      if (type === "unpaid") {
        output += `📊 ጠቅላላ ያልከፈሉ ተማሪዎች፦ ${targetStudents.length}\n`;
        output += `❖━━━━━━━━━━━━━━━━━━━━❖\n\n`;
        output += customNote
          ? `${customNote}\n`
          : `💡 ማሳሰቢያ፦ እባካችሁ ክፍያችሁን በወቅቱ እንድትፈጽሙና ደረሰኛችሁን በድረ-ገጹ በኩል እንድታስገቡ በትህትና እናሳስባለን።\n`;
      } else if (type === "paid") {
        output += `📊 ጠቅላላ የከፈሉ ተማሪዎች፦ ${targetStudents.length}\n`;
        output += `❖━━━━━━━━━━━━━━━━━━━━❖\n\n`;
        output += customNote
          ? `${customNote}\n`
          : `🙏 እናመሰግናለን፤ እግዚአብሔር ይስጥልን!\n`;
      } else {
        const paidC = targetStudents.filter((s) => s.monthStatus === "Paid").length;
        const pendC = targetStudents.filter((s) => s.monthStatus === "Pending").length;
        const unpC = targetStudents.filter(
          (s) => s.monthStatus === "Unpaid" || s.monthStatus === "Rejected"
        ).length;
        output += `📊 ማጠቃለያ፦\n`;
        output += `• ✅ የከፈሉ፦ ${paidC}\n`;
        output += `• 🟡 በመጠባበቅ ላይ፦ ${pendC}\n`;
        output += `• 🔴 ያልከፈሉ፦ ${unpC}\n`;
        output += `• 👥 ጠቅላላ ተማሪዎች፦ ${targetStudents.length}\n`;
        output += `❖━━━━━━━━━━━━━━━━━━━━❖\n\n`;
        if (customNote) {
          output += `${customNote}\n`;
        }
      }

      return output;
    },
    [ethiopianMonths, filterProgram, filterSection, rosterStudents, selectedRosterMonth]
  );

  // Action: Update status (Approve / Reject)
  const handleUpdateStatus = async (paymentId: string, status: "Approved" | "Rejected") => {
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

      toast.success(`Payment marked as ${status}`);
      if (selectedPayment?._id === paymentId) {
        setSelectedPayment((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Action: Delete Payment
  const handleDelete = async () => {
    if (!paymentToDelete?._id) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/payments/${paymentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
      toast.success("Payment deleted successfully");
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  // Action: Edit Payment
  const handleEdit = async (updatedPayment: Payment) => {
    if (!paymentToEdit?._id) return;
    setIsEditing(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(`/payments/${paymentToEdit._id}`, updatedPayment, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPayments((prev) =>
        prev.map((p) => (p._id === paymentToEdit._id ? updatedPayment : p))
      );
      toast.success("Payment updated successfully");
      setEditModalOpen(false);
      setPaymentToEdit(null);
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="የክፍያ ማረጋገጫና የተማሪዎች ዝርዝር (Payments & Student Roster)"
        description="Review submitted receipts, verify bank transfer proofs, monitor unpaid/paid students, and generate Telegram reminders."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTelegramModalOpen(true)}
              className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/50 flex items-center gap-1.5"
            >
              <Send size={14} className="text-sky-400" />
              <span>ለቴሌግራም አዘጋጅ (Telegram Export)</span>
            </Button>

            <div className="bg-surface inline-flex rounded-lg border border-white/5 p-1">
              {[
                {
                  id: "list" as const,
                  label: `📋 ደረሰኞች (${filteredPayments.length})`,
                },
                {
                  id: "roster" as const,
                  label: `👥 የተማሪዎች ክፍያ ዝርዝር (${filteredRosterStudents.length})`,
                },
                { id: "matrix" as const, label: "📊 ወርሃዊ ማትሪክስ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "cursor-pointer rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
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

      {/* Top Stats */}
      {activeTab === "roster" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: `ጠቅላላ ተማሪዎች (${selectedRosterMonth})`,
              value: rosterStats.total,
              className: "text-foreground",
            },
            {
              label: "🔴 ክፍያ ያልፈጸሙ (Unpaid)",
              value: rosterStats.unpaid,
              className: "text-red-400",
            },
            {
              label: "✅ የተረጋገጡ (Paid)",
              value: rosterStats.paid,
              className: "text-emerald-400",
            },
            {
              label: "🟡 በመጠባበቅ ላይ (Pending)",
              value: rosterStats.pending,
              className: "text-amber-400",
            },
          ].map((stat, idx) => (
            <PhotoPanel
              key={stat.label}
              src={adminCardBackgrounds[idx % adminCardBackgrounds.length]}
              className="border-white/10"
              contentClassName="p-4"
            >
              <p className="text-muted-foreground text-xs font-medium tracking-wider">
                {stat.label}
              </p>
              <p className={cn("mt-1.5 text-2xl font-bold", stat.className)}>
                {stat.value}
              </p>
            </PhotoPanel>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total receipts",
              value: stats.total,
              className: "",
            },
            {
              label: "Pending approval",
              value: stats.pending,
              className: "text-amber-400",
            },
            {
              label: "Approved",
              value: stats.approved,
              className: "text-emerald-400",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              className: "text-red-400",
            },
          ].map((stat, idx) => (
            <PhotoPanel
              key={stat.label}
              src={adminCardBackgrounds[idx % adminCardBackgrounds.length]}
              className="border-white/10"
              contentClassName="p-4"
            >
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {stat.label}
              </p>
              <p className={cn("mt-1.5 text-2xl font-bold", stat.className)}>
                {stat.value}
              </p>
            </PhotoPanel>
          ))}
        </div>
      )}

      {/* Shared Filters */}
      <div className="relative z-20 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <input
            type="search"
            placeholder="Search by student name or ID..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>

        <CustomSelect
          className="w-auto min-w-[150px]"
          value={filterProgram}
          onChange={(val) => setFilterProgram(val)}
          options={[
            { value: "", label: "All programs" },
            ...programs.map((p) => ({
              value: p.name,
              label: p.name,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[140px]"
          value={filterSection}
          onChange={(val) => setFilterSection(val)}
          options={[
            { value: "", label: "All sections" },
            ...uniqueSections.map((sec) => ({
              value: sec,
              label: sec,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[130px]"
          value={filterBatch}
          onChange={(val) => setFilterBatch(val)}
          options={[
            { value: "", label: "All batches" },
            ...uniqueBatches.map((b) => ({
              value: b,
              label: b,
            })),
          ]}
        />

        {activeTab === "list" && (
          <>
            <CustomSelect
              className="w-auto min-w-[150px]"
              value={filterMonth}
              onChange={(val) => setFilterMonth(val)}
              options={[
                { value: "", label: "All months" },
                ...ethiopianMonths.map((m) => ({
                  value: m.key,
                  label: `${m.label} (${m.key})`,
                })),
              ]}
            />

            <CustomSelect
              className="w-auto min-w-[160px]"
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: "", label: "All statuses" },
                { value: "Pending", label: "Pending verification" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
          </>
        )}
      </div>

      {/* TAB 1: Receipts List */}
      {activeTab === "list" && (
        <DataTable
          image={siteImages.adminCard5}
          columns={[
            {
              key: "studentIdDisplay",
              label: "Student ID",
              className: "w-36",
            },
            {
              key: "fullName",
              label: "Student Name",
              className: "min-w-[160px] font-medium",
            },
            {
              key: "screenshot",
              label: "Receipt",
              className: "w-28 text-center",
              headerClassName: "w-28 text-center",
            },
            {
              key: "statusDisplay",
              label: "Status",
              className: "w-32",
            },
            {
              key: "actions",
              label: "",
              className: "w-52 text-right",
            },
          ]}
          data={filteredPayments.map((p) => {
            const idVal = p.studentId || p.begenaId || "N/A";
            const currentStatus = p.status || "Pending";

            return {
              ...p,
              studentIdDisplay: (
                <span className="text-primary font-mono text-xs">{idVal}</span>
              ),
              screenshot: (
                <button
                  type="button"
                  key={`${p._id}-img`}
                  title="Click to inspect receipt"
                  className="bg-surface-raised hover:border-primary/40 relative size-12 cursor-pointer overflow-hidden rounded-md border border-white/10 transition-colors"
                  onClick={() => {
                    setSelectedPayment(p);
                    setImageModalOpen(true);
                  }}
                >
                  {p.screenshot ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.screenshot}
                      alt=""
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground flex size-full items-center justify-center">
                      <ImageIcon size={14} />
                    </span>
                  )}
                </button>
              ),
              statusDisplay: (
                <Badge key={`${p._id}-st`} tone={statusTone(currentStatus)}>
                  {currentStatus}
                </Badge>
              ),
              actions: (
                <RowActions
                  key={`${p._id}-act`}
                  onEdit={() => {
                    setPaymentToEdit(p);
                    setEditModalOpen(true);
                  }}
                  onDelete={() => {
                    setPaymentToDelete(p);
                    setDeleteModalOpen(true);
                  }}
                >
                  {currentStatus !== "Approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Approved")}
                    >
                      Approve
                    </Button>
                  )}
                  {currentStatus !== "Rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Rejected")}
                    >
                      Reject
                    </Button>
                  )}
                </RowActions>
              ),
            };
          })}
        />
      )}

      {/* TAB 2: Student Payment Status & Telegram Roster */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          {/* Month Tabs & Quick Copy Actions */}
          <div className="bg-surface rounded-xl border border-white/10 p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Month Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs text-muted-foreground font-medium mr-1.5 whitespace-nowrap">
                  ወር ምረጥ፦
                </span>
                {ethiopianMonths.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedRosterMonth(m.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                      selectedRosterMonth.toLowerCase() === m.key.toLowerCase()
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-surface-raised border-white/5 text-muted-foreground hover:text-foreground hover:border-white/20"
                    )}
                  >
                    {m.label} ({m.key})
                  </button>
                ))}
              </div>

              {/* Quick One-Click Copy Buttons for Telegram */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyTextToClipboard(
                      generateTelegramText("unpaid", true, false),
                      "ያልከፈሉ ተማሪዎች ዝርዝር"
                    )
                  }
                  className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                  title="Copy unpaid students list formatted for Telegram"
                >
                  <Copy size={13} />
                  <span>ያልከፈሉትን ኮፒ ({rosterStats.unpaid})</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyTextToClipboard(
                      generateTelegramText("paid", true, false),
                      "የከፈሉ ተማሪዎች ዝርዝር"
                    )
                  }
                  className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5"
                  title="Copy paid students list formatted for Telegram"
                >
                  <Copy size={13} />
                  <span>የከፈሉትን ኮፒ ({rosterStats.paid})</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyTextToClipboard(
                      generateTelegramText("all", true, false),
                      "የሁሉም ተማሪዎች የክፍያ ዝርዝር"
                    )
                  }
                  className="text-xs border-white/10 hover:border-white/30 flex items-center gap-1.5"
                  title="Copy all students status formatted for Telegram"
                >
                  <Copy size={13} />
                  <span>ሁሉንም ኮፒ ({rosterStats.total})</span>
                </Button>
              </div>
            </div>

            {/* Filter Pills: All, Unpaid, Paid, Pending */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: `ሁሉም (${rosterStats.total})`, color: "" },
                  {
                    id: "unpaid",
                    label: `🔴 ያልከፈሉ (${rosterStats.unpaid})`,
                    color: "text-red-400",
                  },
                  {
                    id: "paid",
                    label: `✅ የከፈሉ (${rosterStats.paid})`,
                    color: "text-emerald-400",
                  },
                  {
                    id: "pending",
                    label: `🟡 በመጠባበቅ ላይ (${rosterStats.pending})`,
                    color: "text-amber-400",
                  },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() =>
                      setRosterStatusFilter(
                        pill.id as "all" | "unpaid" | "paid" | "pending"
                      )
                    }
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                      rosterStatusFilter === pill.id
                        ? "bg-white/10 text-foreground border-white/20"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={pill.color}>{pill.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                የሚታዩ፦ <span className="text-foreground font-medium">{filteredRosterStudents.length}</span> ተማሪዎች
              </div>
            </div>
          </div>

          {/* Student Status Roster Table */}
          <div className="bg-surface overflow-hidden rounded-xl border border-white/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/10 bg-white/[0.02] text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3 font-medium">Student ID</th>
                    <th className="px-4 py-3 font-medium">Full Name</th>
                    <th className="px-4 py-3 font-medium">Section</th>
                    <th className="px-4 py-3 font-medium">Program & Batch</th>
                    <th className="px-4 py-3 font-medium">Phone Number</th>
                    <th className="px-4 py-3 font-medium text-center">
                      ክፍያ ሁኔታ ({selectedRosterMonth})
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRosterStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-muted-foreground py-10 text-center text-sm">
                        በተመረጠው መስፈርት የተገኘ ተማሪ የለም (No students match this filter).
                      </td>
                    </tr>
                  ) : (
                    filteredRosterStudents.map((st, idx) => {
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
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {st.program || "Basic በገና"}
                            {st.batch ? ` · ${st.batch}` : ""}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                            {st.phoneNumber || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {st.monthStatus === "Paid" ? (
                              <Badge tone="success" className="gap-1 inline-flex items-center">
                                <CheckCircle2 size={12} />
                                <span>Paid (የከፈለ)</span>
                              </Badge>
                            ) : st.monthStatus === "Pending" ? (
                              <Badge tone="warning" className="gap-1 inline-flex items-center">
                                <Clock size={12} />
                                <span>Pending (በመጠባበቅ ላይ)</span>
                              </Badge>
                            ) : st.monthStatus === "Rejected" ? (
                              <Badge tone="danger" className="gap-1 inline-flex items-center">
                                <XCircle size={12} />
                                <span>Rejected (ውድቅ የተደረገ)</span>
                              </Badge>
                            ) : (
                              <Badge tone="danger" className="gap-1 inline-flex items-center text-red-400 border-red-500/20 bg-red-500/10">
                                <span>🔴 Unpaid (ያልከፈለ)</span>
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
                                onClick={() => {
                                  const singleLine = `${idVal} - ${st.fullName} (${st.section || "N/A"})`;
                                  copyTextToClipboard(singleLine, st.fullName);
                                }}
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
        </div>
      )}

      {/* TAB 3: Monthly Matrix */}
      {activeTab === "matrix" && (
        <PhotoPanel src={siteImages.adminAncient} contentClassName="p-0">
          <PanelHeader
            title="Monthly payment matrix"
            className="flex-col sm:flex-row sm:items-center gap-3"
            action={
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTelegramModalOpen(true)}
                  className="text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>ለቴሌግራም ኤክስፖርት</span>
                </Button>

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
                    <th key={m.key} className="px-3 py-2.5 text-center font-medium">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBaseStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + ethiopianMonths.length}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      No students match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBaseStudents.map((student) => {
                    const sId = student.studentId || student.begenaId;
                    const studentPayments = payments.filter((p) => {
                      const pId = p.studentId || p.begenaId;
                      return (
                        (pId && pId === sId) ||
                        p.studentId === student._id ||
                        p.fullName?.toLowerCase() === student.fullName?.toLowerCase()
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
                            (p) => p.month?.toLowerCase() === m.key.toLowerCase()
                          );
                          const st = pay ? pay.status || "Pending" : "Unpaid";

                          return (
                            <td key={m.key} className="px-3 py-3 text-center">
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

      {/* TELEGRAM EXPORT & PREVIEW MODAL */}
      <Modal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
        title="ለቴሌግራም ማጋሪያ (Telegram List Generator)"
        description="Select the target list, format by section, customize announcements, and copy straight to Telegram."
        className="max-w-3xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setTelegramModalOpen(false)}>
              ዝጋ (Close)
            </Button>
            <Button
              onClick={() =>
                copyTextToClipboard(
                  generateTelegramText(
                    telegramType,
                    telegramGroupSection,
                    telegramIncludePhone,
                    telegramCustomNote
                  ),
                  "የቴሌግራም መልዕክት"
                )
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>
                {copied
                  ? "ተቀድቷል! (Copied!)"
                  : "ጽሑፉን ለቴሌግራም ኮፒ አድርግ (Copy Text)"}
              </span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* List Type Segmented Selection */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "unpaid" as const,
                label: "⚠️ ያልከፈሉ ብቻ (Unpaid)",
                sub: `${rosterStats.unpaid} ተማሪዎች`,
              },
              {
                id: "paid" as const,
                label: "✅ የከፈሉ ብቻ (Paid)",
                sub: `${rosterStats.paid} ተማሪዎች`,
              },
              {
                id: "all" as const,
                label: "📋 ሁሉም ተማሪዎች (All)",
                sub: `${rosterStats.total} ተማሪዎች`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTelegramType(tab.id)}
                className={cn(
                  "p-2.5 rounded-lg border text-left transition-all",
                  telegramType === tab.id
                    ? "bg-primary/10 border-primary text-foreground shadow-sm"
                    : "bg-surface-raised border-white/5 text-muted-foreground hover:border-white/20"
                )}
              >
                <div className="font-semibold text-xs sm:text-sm">{tab.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{tab.sub}</div>
              </button>
            ))}
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-raised/40 p-3 rounded-lg border border-white/5">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                የወር ምርጫ (Selected Month)፦
              </label>
              <CustomSelect
                value={selectedRosterMonth}
                onChange={(val) => setSelectedRosterMonth(val)}
                options={ethiopianMonths.map((m) => ({
                  value: m.key,
                  label: `${m.label} (${m.key})`,
                }))}
              />
            </div>

            <div className="flex flex-col justify-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={telegramGroupSection}
                  onChange={(e) => setTelegramGroupSection(e.target.checked)}
                  className="rounded border-white/20 bg-background"
                />
                <span>በየክፍሉ መድብ (Group by Section)</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={telegramIncludePhone}
                  onChange={(e) => setTelegramIncludePhone(e.target.checked)}
                  className="rounded border-white/20 bg-background"
                />
                <span>ስልክ ቁጥር አካትት (Include Phone Numbers)</span>
              </label>
            </div>
          </div>

          {/* Custom Note / Message Area */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              ተጨማሪ ማስታወሻ / መልዕክት (Optional announcement note):
            </label>
            <input
              type="text"
              placeholder="ለምሳሌ፦ እባካችሁ እስከ አርብ ድረስ ክፍያችሁን እንድታጠናቅቁ..."
              value={telegramCustomNote}
              onChange={(e) => setTelegramCustomNote(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          {/* Live Telegram Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Send size={13} className="text-sky-400" />
                የቴሌግራም መልዕክት ቅድመ-ዕይታ (Live Preview)፦
              </span>
              <button
                type="button"
                onClick={() =>
                  copyTextToClipboard(
                    generateTelegramText(
                      telegramType,
                      telegramGroupSection,
                      telegramIncludePhone,
                      telegramCustomNote
                    ),
                    "የቴሌግራም መልዕክት"
                  )
                }
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Copy size={12} />
                ኮፒ አድርግ
              </button>
            </div>

            <div className="bg-background max-h-64 overflow-y-auto rounded-lg border border-white/10 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-primary selection:text-white">
              {generateTelegramText(
                telegramType,
                telegramGroupSection,
                telegramIncludePhone,
                telegramCustomNote
              )}
            </div>
          </div>
        </div>
      </Modal>

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

      {/* Edit payment modal */}
      {paymentToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={paymentToEdit}
          formData={paymentToEdit}
          setFormData={(update: React.SetStateAction<Payment>) =>
            setPaymentToEdit((prev) =>
              typeof update === "function" ? update(prev as Payment) : update
            )
          }
          onClose={() => setEditModalOpen(false)}
          onSubmit={() => handleEdit(paymentToEdit)}
          renderFields={(data: Payment, setData: (p: Payment) => void) => (
            <>
              <Field label="Full Name" htmlFor="editPaymentName">
                <input
                  id="editPaymentName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>

              <Field label="Student ID" htmlFor="editPaymentStudentId">
                <input
                  id="editPaymentStudentId"
                  className="font-mono"
                  value={data.studentId || data.begenaId}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studentId: e.target.value,
                      begenaId: e.target.value,
                    })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program" htmlFor="editPaymentProgram">
                  <input
                    id="editPaymentProgram"
                    value={data.program || ""}
                    onChange={(e) =>
                      setData({ ...data, program: e.target.value })
                    }
                  />
                </Field>

                <Field label="Section" htmlFor="editPaymentSection">
                  <input
                    id="editPaymentSection"
                    value={data.section}
                    onChange={(e) =>
                      setData({ ...data, section: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Month" htmlFor="editPaymentMonth">
                  <input
                    id="editPaymentMonth"
                    value={data.month}
                    onChange={(e) => setData({ ...data, month: e.target.value })}
                  />
                </Field>

                <Field label="Verification Status" htmlFor="editPaymentStatus">
                  <CustomSelect
                    id="editPaymentStatus"
                    value={data.status || "Pending"}
                    onChange={(val) =>
                      setData({
                        ...data,
                        status: val as
                          | "Pending"
                          | "Approved"
                          | "Rejected",
                      })
                    }
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Approved", label: "Approved" },
                      { value: "Rejected", label: "Rejected" },
                    ]}
                  />
                </Field>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Payment Record"
        message={`Are you sure you want to delete the payment proof for "${paymentToDelete?.fullName}" (${paymentToDelete?.month})? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
