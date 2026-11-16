"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Student, Payment, ClassSchedule } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import PhotoPanel from "@/components/ui/photo-panel";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  Field,
  PageBody,
  PageContainer,
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/ui/page";
import {
  Loader2,
  LogOut,
  Edit3,
  Upload,
  X,
  ExternalLink,
  Lock,
  CheckCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { updatePendingPayment } from "@/lib/actions/payment";
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  day: string;
  status: "Present" | "Absent" | "Late" | "Permission";
  academicYear: string;
}

type TabId = "attendance" | "payments" | "schedules" | "profile" | "password";

const tabs: { id: TabId; label: string; amharic: string; icon: React.ElementType }[] = [
  { id: "attendance", label: "Attendance", amharic: "የክትትል ሁኔታ", icon: UserCheck },
  { id: "payments", label: "Payments", amharic: "ወርሃዊ ክፍያ", icon: FileText },
  { id: "schedules", label: "Schedule", amharic: "የትምህርት ሰዓት", icon: CalendarDays },
  { id: "profile", label: "Profile", amharic: "የግል መረጃ", icon: Edit3 },
  { id: "password", label: "Security", amharic: "ይለፍ ቃል", icon: Lock },
];

const paymentTone = (status: string) =>
  status === "Approved" ? "success" : status === "Rejected" ? "danger" : "warning";

const attendanceTone = (status: AttendanceRecord["status"]) =>
  status === "Present"
    ? "success"
    : status === "Late"
      ? "warning"
      : status === "Permission"
        ? "info"
        : "danger";

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("attendance");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const router = useRouter();

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editMonth, setEditMonth] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Student Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    christianName: "",
    phoneNumber: "",
    gender: "",
    department: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Check URL query param for default tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as TabId;
      if (tabParam && ["attendance", "payments", "schedules", "profile", "password"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

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

  const submittedMonths = new Set(
    payments
      .filter((p) => p.status === "Pending" || p.status === "Approved")
      .map((p) => p.month)
  );

  const openEditModal = (p: Payment) => {
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

  const handleUpdatePayment = async (e: React.FormEvent) => {
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
      const sId = student?.studentId || student?.programId || student?.begenaId;
      if (sId) formData.set("studentId", sId);
      if (editFile) {
        formData.set("screenshot", editFile);
      }

      const res = await updatePendingPayment(editingPayment._id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("የክፍያ ደረሰኝ በተሳካ ሁኔታ ተስተካክሏል!");
        closeEditModal();
        fetchPortalData();
      }
    } catch (err) {
      console.error(err);
      toast.error("ማስተካከል አልተቻለም");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPortalData = useCallback(async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      toast.error("እባክዎ መጀመሪያ ይግቡ (Please log in)");
      router.push("/student/login");
      return;
    }

    try {
      const res = await api.get("/auth/student/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStudent(res.data.student);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));
        setPayments(res.data.payments || []);
        setSchedules(res.data.schedules || []);
        setAttendance(res.data.attendance || []);
      }
    } catch (err: unknown) {
      console.error("Portal Fetch Error:", err);
      const apiErr = err as { response?: { status?: number; data?: { message?: string } } };
      const status = apiErr?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("studentToken");
        router.push("/student/login");
      } else {
        toast.error(apiErr?.response?.data?.message || "ዳታ ማምጣት አልተቻለም");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  useEffect(() => {
    if (student) {
      setProfileForm({
        fullName: student.fullName || "",
        christianName: student.christianName || "",
        phoneNumber: student.phoneNumber || "",
        gender: student.gender || "",
        department: student.department || "",
      });
    }
  }, [student]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error("ሙሉ ስም ማስገባት ግዴታ ነው");
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await api.put("/auth/student/profile", profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("የግል መረጃዎ በተሳካ ሁኔታ ተሻሽሏል!");
        setStudent(res.data.student);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));
      }
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "መረጃ ማስተካከል አልተቻለም");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    router.push("/student/login");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error("የይለፍ ቃል ቢያንስ 4 ፊደላት/ቁጥሮች መሆን አለበት");
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem("studentToken");
      await api.put(
        "/auth/student/password",
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error("የይለፍ ቃል መቀየር አልተቻለም");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const filteredPayments = payments.filter(
    (p) => (p as unknown as { year?: string }).year === selectedYear || selectedYear === "All"
  );

  const totalPresent = attendance.filter(
    (a) => a.status === "Present" || a.status === "Late" || a.status === "Permission"
  ).length;
  const totalPermission = attendance.filter((a) => a.status === "Permission").length;
  const totalAbsent = attendance.filter((a) => a.status === "Absent").length;
  const attendanceRate = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 100;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 size={24} className="text-primary animate-spin" />
          <p className="text-sm">የተማሪ ፖርታል በመጫን ላይ...</p>
        </div>
      </div>
    );
  }

  const profileFacts = [
    { label: "የተማሪ መለያ (ID)", value: student?.studentId || student?.programId || student?.begenaId, mono: true },
    { label: "ፕሮግራም (Program)", value: student?.program || "Begena" },
    { label: "ምድብ (Section)", value: student?.section || "—" },
    { label: "ስልክ (Phone)", value: student?.phoneNumber || "—" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <PageBody className="py-4 sm:py-8">
        <PageContainer className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          {/* Student Profile Card: Compact, high-impact on mobile */}
          <PhotoPanel
            src={siteImages.studentProfile}
            priority
            className="rounded-2xl border-primary/20 shadow-sm"
            contentClassName="p-4 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-lg sm:text-2xl font-black text-foreground">
                  {student?.fullName}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge tone="primary" className="text-[11px] sm:text-xs">
                    {student?.program || "Begena"}
                  </Badge>
                  <Badge tone="success" className="text-[11px] sm:text-xs">
                    {student?.academicStatus || "Active"}
                  </Badge>
                  {/* Quick Clickable Attendance Pill that jumps to Attendance Tab */}
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border",
                      attendanceRate >= 85
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                        : attendanceRate >= 70
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                          : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
                    )}
                  >
                    <span>📋 ክትትል: {attendanceRate}%</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground">
                <LogOut size={13} className="mr-1" /> Logout
              </Button>
            </div>

            <dl className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-white/5 pt-3 text-xs">
              {profileFacts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="text-muted-foreground text-[10px] sm:text-xs">{fact.label}</dt>
                  <dd className={`mt-0.5 truncate text-xs sm:text-sm font-semibold ${fact.mono ? "text-primary font-mono" : ""}`}>
                    {fact.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </PhotoPanel>

          {/* Mobile-First Tab Switcher: Horizontal touch pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "bg-surface/80 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon size={14} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                  <span>{tab.amharic}</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">({tab.label})</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ATTENDANCE (Mobile First) */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              {/* Visual Health & Rate Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-foreground">
                        የክትትል ማጠቃለያ (Attendance Summary)
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        {student?.program} · Section {student?.section || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-black text-primary leading-none">
                      {attendanceRate}%
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground mt-0.5 block">
                      {attendanceRate >= 85
                        ? "ጥሩ ሁኔታ (Excellent)"
                        : attendanceRate >= 70
                          ? "መካከለኛ ሁኔታ (Fair)"
                          : "ማስጠንቀቂያ (At Risk)"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>ክፍለ-ጊዜዎች የተገኙበት ምጣኔ</span>
                    <span className="font-semibold text-foreground">{totalPresent} ከ {attendance.length} ክፍለ-ጊዜ</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        attendanceRate >= 85
                          ? "bg-emerald-500"
                          : attendanceRate >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                      )}
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                </div>

                {/* 4 Clean Metric Cards: 2-column on phones, 4-column on desktop */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={13} />
                      <span>የተገኙበት (Present)</span>
                    </div>
                    <p className="mt-1 text-lg sm:text-2xl font-black text-foreground">
                      {totalPresent - totalPermission}
                    </p>
                    <span className="text-[10px] text-muted-foreground">ክፍለ-ጊዜዎች</span>
                  </div>

                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400">
                      <FileText size={13} />
                      <span>በፈቃድ (Permission)</span>
                    </div>
                    <p className="mt-1 text-lg sm:text-2xl font-black text-foreground">
                      {totalPermission}
                    </p>
                    <span className="text-[10px] text-muted-foreground">ፈቃድ የተሰጠበት</span>
                  </div>

                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-red-400">
                      <AlertCircle size={13} />
                      <span>ቀሪ (Absences)</span>
                    </div>
                    <p className="mt-1 text-lg sm:text-2xl font-black text-foreground">
                      {totalAbsent}
                    </p>
                    <span className="text-[10px] text-muted-foreground">ያልተገኙበት ቀናት</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                      <Calendar size={13} />
                      <span>ጠቅላላ (Total)</span>
                    </div>
                    <p className="mt-1 text-lg sm:text-2xl font-black text-foreground">
                      {attendance.length}
                    </p>
                    <span className="text-[10px] text-muted-foreground">የተመዘገቡ ቀናት</span>
                  </div>
                </div>
              </div>

              {/* Sessions Timeline Cards */}
              <Panel className="rounded-2xl overflow-hidden border border-white/10">
                <PanelHeader
                  title="የክፍለ-ጊዜዎች ዝርዝር (Recorded Sessions)"
                  description="በመምህራን የተመዘገቡ የክፍለ-ጊዜ መገኘት ሁኔታዎች"
                />
                {attendance.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-2">
                    <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-xl">
                      📅
                    </div>
                    <p className="text-sm font-bold text-foreground">እስካሁን የተመዘገበ የክትትል መረጃ የለም</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      የክፍል አሰልጣኞችዎ የሳምንቱን የትምህርት ክፍለ-ጊዜ ክትትል ባስገቡ ቁጥር እዚህ ጋር በዝርዝር ይቀርብልዎታል።
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {[...attendance]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => {
                        const dateObj = new Date(record.date);
                        const formattedDate = dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        const isPresent = record.status === "Present";
                        const isPerm = record.status === "Permission";
                        const isLate = record.status === "Late";

                        return (
                          <div
                            key={record._id}
                            className="flex items-center justify-between p-3.5 sm:px-5 gap-3 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div
                                className={cn(
                                  "flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border text-sm",
                                  isPresent
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                    : isPerm
                                      ? "bg-sky-500/10 border-sky-500/25 text-sky-400"
                                      : isLate
                                        ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                                        : "bg-red-500/10 border-red-500/25 text-red-400"
                                )}
                              >
                                {isPresent ? "✓" : isPerm ? "📄" : isLate ? "⏱️" : "✕"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                  {formattedDate}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {record.day || dateObj.toLocaleDateString("en-US", { weekday: "long" })}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <Badge tone={attendanceTone(record.status)} className="font-bold text-[10px] sm:text-xs">
                                {record.status === "Present"
                                  ? "✓ ተገኝቷል"
                                  : record.status === "Permission"
                                    ? "📄 በፈቃድ"
                                    : record.status === "Late"
                                      ? "⏱️ ዘግይቷል"
                                      : "✕ አልተገኘም"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    ዓመት
                  </span>
                  <div className="w-28 sm:w-32">
                    <CustomSelect
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={[
                        { value: "2026", label: "2026" },
                        { value: "2025", label: "2025" },
                        { value: "All", label: "ሁሉንም" },
                      ]}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push("/payment")} className="h-9 font-semibold text-xs gap-1.5 shadow-sm">
                  <PlusCircle size={14} /> ደረሰኝ አስገባ
                </Button>
              </div>

              {filteredPayments.length === 0 ? (
                <PhotoPanel src={siteImages.orthodoxChurch} className="rounded-2xl">
                  <EmptyState
                    title="ምንም የተመዘገበ ክፍያ የለም"
                    description={`ለ ${selectedYear} እስካሁን የተላከ የክፍያ ማረጋገጫ የለም።`}
                    action={
                      <Button size="sm" onClick={() => router.push("/payment")}>
                        አሁን ክፍያ አስገባ
                      </Button>
                    }
                  />
                </PhotoPanel>
              ) : (
                <PhotoPanel src={siteImages.orthodoxChurch} contentClassName="p-0" className="rounded-2xl overflow-hidden border border-white/10">
                  <PanelHeader
                    title="የክፍያ ታሪክ (Payment History)"
                    description={`የተመዘገቡ የደረሰኝ ማረጋገጫዎች (${selectedYear})`}
                  />
                  <ul className="divide-y divide-white/5">
                    {filteredPayments.map((p) => {
                      const status = (p as unknown as { status?: string }).status || "Pending";
                      const isPending = status === "Pending";
                      return (
                        <li
                          key={p._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-foreground text-xs sm:text-sm">{p.month} {p.year || "2026"}</p>
                              <Badge tone={paymentTone(status)} className="text-[10px] sm:text-xs">
                                {status === "Approved" ? "✓ ጸድቋል" : status === "Rejected" ? "✕ ውድቅ ተደርጓል" : "⏳ በመጠባበቅ ላይ"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-[11px] truncate">
                              Section {p.section} · የተላከው {new Date(p.createdAt || "").toLocaleDateString()}
                            </p>
                            {p.adminNotes && (
                              <p className="text-[11px] text-amber-300/90 mt-0.5 italic">
                                ማስታወሻ: {p.adminNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isPending && (
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
                        </li>
                      );
                    })}
                  </ul>
                </PhotoPanel>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULES */}
          {activeTab === "schedules" && (
            <Panel className="rounded-2xl border border-white/10 overflow-hidden">
              <PanelHeader
                title="የትምህርት ሰዓት (Timetable)"
                description={`ምድብ ${student?.section ?? "—"}`}
              />
              {schedules.length === 0 ? (
                <EmptyState
                  title="የታተመ የትምህርት ሰዓት የለም"
                  description={`ለዚህ ምድብ (${student?.section}) የትምህርት ሰዓት እስካሁን አልተለጠፈም።`}
                />
              ) : (
                <div className="divide-y divide-white/5">
                  {schedules.map((s) => (
                    <div key={s._id} className="p-4 sm:px-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-foreground text-sm">Section {s.section}</span>
                        <Badge tone="primary">{s.type?.toUpperCase() || "REGULAR"}</Badge>
                      </div>

                      {s.sessions && s.sessions.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {s.sessions.map((sess, idx) => (
                            <div
                              key={idx}
                              className="bg-surface-raised flex items-center justify-between gap-3 rounded-xl p-3 border border-white/5"
                            >
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-foreground">{sess.day}</p>
                                <p className="text-muted-foreground text-[11px] font-mono">
                                  {sess.startTime} – {sess.endTime}
                                </p>
                              </div>
                              <Badge className="text-[10px]">{sess.room || "Main Room"}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          {s.date} · {s.time}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === "profile" && (
            <Panel className="rounded-2xl border border-white/10 overflow-hidden">
              <PanelHeader
                title="የግል መረጃ ማስተካከያ (Profile)"
                description="ስም፣ ስልክ ቁጥር እና ሌሎች መረጃዎችን ያስተካክሉ።"
              />
              <PanelBody className="p-4 sm:p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="ሙሉ ስም (Full Name) *" htmlFor="fullName">
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-sm"
                      />
                    </Field>

                    <Field label="የክርስትና ስም (Christian Name)" htmlFor="christianName">
                      <input
                        id="christianName"
                        type="text"
                        placeholder="ምሳሌ፡ ገብረ ማርያም"
                        value={profileForm.christianName}
                        onChange={(e) => setProfileForm({ ...profileForm, christianName: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-sm"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="ስልክ ቁጥር (Phone Number) *" htmlFor="phoneNumber">
                      <input
                        id="phoneNumber"
                        type="tel"
                        required
                        placeholder="09..."
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-sm"
                      />
                    </Field>

                    <Field label="ጾታ (Gender)" htmlFor="gender">
                      <select
                        id="gender"
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-foreground text-sm"
                      >
                        <option value="">ይምረጡ (Select)</option>
                        <option value="F">ሴት (Female)</option>
                        <option value="M">ወንድ (Male)</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="ዲፓርትመንት (Department)" htmlFor="department">
                    <input
                      id="department"
                      type="text"
                      placeholder="ምሳሌ፡ ECE, SW, Mech, Civ"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-sm"
                    />
                  </Field>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button type="submit" disabled={savingProfile} className="h-11 font-bold">
                      {savingProfile ? "በማስቀመጥ ላይ..." : "መረጃዬን መዝግብ (Save Changes)"}
                    </Button>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle size={13} className="text-emerald-400" /> የተቀየረው መረጃ በዳታቤዝ ውስጥ ይቀመጣል
                    </span>
                  </div>
                </form>
              </PanelBody>
            </Panel>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === "password" && (
            <Panel className="max-w-md rounded-2xl border border-white/10 overflow-hidden">
              <PanelHeader
                title="የይለፍ ቃል መቀየሪያ (Security)"
                description="የፖርታል መግቢያ ይለፍ ቃልዎን እዚህ ያዘምኑ።"
              />
              <PanelBody className="p-4 sm:p-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                  }}
                >
                  <Field label="አዲስ የይለፍ ቃል *" htmlFor="newPassword" hint="ቢያንስ 4 ፊደላት ወይም ቁጥሮች">
                    <input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="አዲስ የይለፍ ቃል ያስገቡ"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/15 text-sm"
                    />
                  </Field>
                  <Button type="submit" disabled={updatingPassword} className="w-full h-11 font-bold">
                    {updatingPassword ? "በመቀየር ላይ..." : "የይለፍ ቃል ቀይር (Update Password)"}
                  </Button>
                </form>
              </PanelBody>
            </Panel>
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
              <button onClick={closeEditModal} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">የሚከፍሉበት ወር *</label>
                <CustomSelect
                  value={editMonth}
                  onChange={setEditMonth}
                  options={months.map((m) => {
                    const isTaken = submittedMonths.has(m.value) && m.value !== editingPayment.month;
                    return {
                      value: m.value,
                      label: isTaken ? `${m.label} — (ቀድሞ ተከፍሏል)` : m.label,
                      disabled: isTaken,
                    };
                  })}
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">አዲስ ደረሰኝ (አማራጭ)</label>
                {editPreviewUrl ? (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={editPreviewUrl}
                      alt="Receipt preview"
                      className="max-h-48 w-full object-contain bg-black/40"
                    />
                    <label
                      htmlFor="dashboard-edit-screenshot"
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={12} /> ፎቶ ቀይር
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="dashboard-edit-screenshot"
                    className="bg-black/30 hover:bg-black/40 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Upload size={18} className="text-primary" />
                    <span className="text-xs text-muted-foreground">አዲስ ደረሰኝ ይምረጡ (PNG, JPG)</span>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="dashboard-edit-screenshot"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditFile(file);
                      setEditPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  disabled={isUpdating}
                  className="hidden"
                />
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
              <button onClick={() => setSelectedReceipt(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 max-h-[75vh] overflow-y-auto flex items-center justify-center bg-black/40">
              <img
                src={selectedReceipt}
                alt="Receipt preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
