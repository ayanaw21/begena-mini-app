"use client";
import { useEffect, useState, useCallback } from "react";
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
import { Loader2, LogOut, Edit3, Upload, X, ExternalLink, Lock, CheckCircle, Calendar, CalendarDays, CheckCircle2, AlertCircle, FileText, UserCheck, Clock } from "lucide-react";
import { updatePendingPayment } from "@/lib/actions/payment";
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  day: string;
  status: "Present" | "Absent" | "Late" | "Permission";
  academicYear: string;
}

type TabId = "payments" | "schedules" | "attendance" | "profile" | "password";

const tabs: { id: TabId; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "schedules", label: "Schedule" },
  { id: "attendance", label: "Attendance" },
  { id: "profile", label: "Profile (መረጃ ማስተካከያ)" },
  { id: "password", label: "Security" },
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
  const [activeTab, setActiveTab] = useState<TabId>("payments");
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
      toast.error("Please select a month");
      return;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.set("month", editMonth);
      if (student?.studentId) formData.set("studentId", student.studentId);
      if (editFile) {
        formData.set("screenshot", editFile);
      }
      const res = await updatePendingPayment(editingPayment._id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Payment updated successfully!");
        closeEditModal();
        fetchPortalData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPortalData = useCallback(async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      toast.error("Please login to access your portal");
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
        toast.error(apiErr?.response?.data?.message || "Failed to load portal data. Retrying...");
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
      toast.error("እባክዎ ሙሉ ስምዎን ያስገቡ (Full name is required)");
      return;
    }
    if (!profileForm.phoneNumber.trim()) {
      toast.error("እባክዎ ስልክ ቁጥርዎን ያስገቡ (Phone number is required)");
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await api.put("/auth/student/profile", profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(res.data.message || "መረጃዎ በተሳካ ሁኔታ ተስተካክሏል!");
        setStudent(res.data.student);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));
      }
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    toast.success("Logged out successfully");
    router.push("/student/login");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long");
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
      toast.success("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password");
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 size={22} className="text-primary animate-spin" />
          <p className="text-sm">Loading student portal...</p>
        </div>
      </div>
    );
  }

  const profileFacts = [
    { label: "Student ID", value: student?.studentId || student?.begenaId, mono: true },
    { label: "Batch", value: student?.batch },
    { label: "Section", value: student?.section },
    { label: "Department", value: student?.department },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <PageBody>
        <PageContainer className="space-y-6">
          {/* Profile */}
          <PhotoPanel
            src={siteImages.studentProfile}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            contentClassName="p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">
                  {student?.fullName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="primary">
                    {student?.program || "Begena"} Program
                  </Badge>
                  <Badge tone="success">
                    {student?.academicStatus || "Active"}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </Button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/5 pt-4 sm:grid-cols-4">
              {profileFacts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="text-muted-foreground text-xs">{fact.label}</dt>
                  <dd
                    className={`mt-0.5 truncate text-sm font-medium ${
                      fact.mono ? "text-primary font-mono" : ""
                    }`}
                  >
                    {fact.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </PhotoPanel>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Portal sections"
            className="flex gap-1 overflow-x-auto border-b border-white/5"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    Year
                  </span>
                  <div className="w-32">
                    <CustomSelect
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={[
                        { value: "2026", label: "2026" },
                        { value: "2025", label: "2025" },
                        { value: "2024", label: "2024" },
                        { value: "All", label: "All Years" },
                      ]}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push("/payment")}>
                  Submit receipt
                </Button>
              </div>

              {filteredPayments.length === 0 ? (
                <PhotoPanel src={siteImages.orthodoxChurch}>
                  <EmptyState
                    title="No payment records"
                    description={`Nothing has been submitted for ${selectedYear} yet.`}
                    action={
                      <Button size="sm" onClick={() => router.push("/payment")}>
                        Submit payment now
                      </Button>
                    }
                  />
                </PhotoPanel>
              ) : (
                <PhotoPanel src={siteImages.orthodoxChurch} contentClassName="p-0">
                  <PanelHeader
                    title="Payment History"
                    description={`Submitted payment proof records for ${selectedYear}`}
                  />
                  <ul className="divide-y divide-white/5">
                    {filteredPayments.map((p) => {
                      const status =
                        (p as unknown as { status?: string }).status || "Pending";
                      const isPending = status === "Pending";
                      return (
                        <li
                          key={p._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{p.month} {p.year || "2026"}</p>
                              <Badge tone={paymentTone(status)}>{status}</Badge>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Section {p.section} · Batch {p.batch} · submitted{" "}
                              {new Date(p.createdAt || "").toLocaleDateString()}
                            </p>
                            {p.adminNotes && (
                              <p className="text-xs text-amber-300/90 mt-1 italic">
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
                                className="text-xs gap-1 border-white/10 hover:border-primary/40"
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

          {/* Schedules */}
          {activeTab === "schedules" && (
            <Panel>
              <PanelHeader
                title="Timetable"
                description={`Section ${student?.section ?? "—"}`}
              />
              {schedules.length === 0 ? (
                <EmptyState
                  title="No schedule published"
                  description={`Nothing has been published for section ${student?.section} yet.`}
                />
              ) : (
                <div className="divide-y divide-white/5">
                  {schedules.map((s) => (
                    <div key={s._id} className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Section {s.section}</span>
                        <Badge tone="primary">
                          {s.type?.toUpperCase() || "REGULAR"}
                        </Badge>
                      </div>

                      {s.sessions && s.sessions.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {s.sessions.map((sess, idx) => (
                            <li
                              key={idx}
                              className="bg-surface-raised flex items-center justify-between gap-3 rounded-md px-3 py-2.5"
                            >
                              <div>
                                <p className="text-sm font-medium">{sess.day}</p>
                                <p className="text-muted-foreground text-xs">
                                  {sess.startTime} – {sess.endTime}
                                </p>
                              </div>
                              <Badge>{sess.room || "Main Room"}</Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {s.date} · {s.time}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* Attendance */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              {/* Visual Health & Rate Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground">
                        የክትትል ማጠቃለያ (Attendance Summary)
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Section {student?.section || "—"} · Batch {student?.batch || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-background/50 px-4 py-2.5 rounded-xl border border-white/5 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-black text-primary leading-none">
                        {attendanceRate}%
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {attendanceRate >= 85
                          ? "ጥሩ ሁኔታ (Excellent)"
                          : attendanceRate >= 70
                            ? "መካከለኛ ሁኔታ (Fair)"
                            : "ማስጠንቀቂያ (At Risk)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Attendance Rate</span>
                    <span className="font-semibold text-foreground">{totalPresent} of {attendance.length} sessions attended</span>
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

                {/* 4 Clean Metric Cards */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span>የተገኙበት (Present)</span>
                    </div>
                    <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
                      {totalPresent - totalPermission}
                    </p>
                    <span className="text-[11px] text-muted-foreground">ክፍለ-ጊዜዎች</span>
                  </div>

                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                      <FileText size={14} />
                      <span>በፈቃድ (Permission)</span>
                    </div>
                    <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
                      {totalPermission}
                    </p>
                    <span className="text-[11px] text-muted-foreground">ፈቃድ የተሰጠበት</span>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                      <AlertCircle size={14} />
                      <span>ቀሪ (Absences)</span>
                    </div>
                    <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
                      {totalAbsent}
                    </p>
                    <span className="text-[11px] text-muted-foreground">ያልተገኙበት ቀናት</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Calendar size={14} />
                      <span>ጠቅላላ (Total Sessions)</span>
                    </div>
                    <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
                      {attendance.length}
                    </p>
                    <span className="text-[11px] text-muted-foreground">የተመዘገቡ ቀናት</span>
                  </div>
                </div>
              </div>

              {/* Sessions Timeline Cards */}
              <Panel>
                <PanelHeader
                  title="Recorded Sessions (የክፍለ-ጊዜዎች ዝርዝር)"
                  description="A chronological record of every class session marked for your section."
                />
                {attendance.length === 0 ? (
                  <EmptyState
                    title="No sessions recorded yet"
                    description="Your attendance records will appear here as soon as your instructor marks them."
                  />
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
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex size-9 shrink-0 items-center justify-center rounded-lg border text-base",
                                  isPresent
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : isPerm
                                      ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                                      : isLate
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                )}
                              >
                                {isPresent ? "✅" : isPerm ? "📄" : isLate ? "⏱️" : "❌"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {formattedDate}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {record.day || dateObj.toLocaleDateString("en-US", { weekday: "long" })} · Class Session
                                </p>
                              </div>
                            </div>

                            <div className="self-end sm:self-auto">
                              <Badge tone={attendanceTone(record.status)} className="font-semibold text-xs">
                                {record.status === "Present"
                                  ? "ተገኝቷል (Present)"
                                  : record.status === "Permission"
                                    ? "በፈቃድ (Permission)"
                                    : record.status === "Late"
                                      ? "አርፍዷል (Late)"
                                      : "አልተገኘም (Absent)"}
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

          {/* Profile Editing */}
          {activeTab === "profile" && (
            <Panel className="max-w-2xl">
              <PanelHeader
                title="የግል መረጃ ማስተካከያ (Edit Profile)"
                description="የእርስዎን የግል መረጃ እዚህ ማስተካከል ይችላሉ። የተማሪ መለያ ቁጥር (Student ID) እና ፕሮግራም (Program) በአድሚን ብቻ የሚወሰኑ በመሆናቸው ሊቀየሩ አይችሉም።"
              />
              <PanelBody>
                {/* Locked System Fields Notice */}
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Lock size={14} />
                    <span>የተቆለፉ መለያዎች (Locked Identifiers)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    <div className="bg-background/80 p-2.5 rounded-lg border border-white/5">
                      <span className="block text-[10px] text-muted-foreground uppercase font-sans">Student ID</span>
                      <span className="text-primary font-bold text-sm">{student?.studentId || student?.begenaId}</span>
                    </div>
                    <div className="bg-background/80 p-2.5 rounded-lg border border-white/5">
                      <span className="block text-[10px] text-muted-foreground uppercase font-sans">Program</span>
                      <span className="text-foreground text-sm">{student?.program || "Basic በገና"}</span>
                    </div>
                    <div className="bg-background/80 p-2.5 rounded-lg border border-white/5">
                      <span className="block text-[10px] text-muted-foreground uppercase font-sans">Batch</span>
                      <span className="text-foreground text-sm">{student?.batch || "Batch 8"}</span>
                    </div>
                    <div className="bg-background/80 p-2.5 rounded-lg border border-white/5">
                      <span className="block text-[10px] text-muted-foreground uppercase font-sans">Section</span>
                      <span className="text-foreground text-sm">{student?.section || "Sec-A"}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="ሙሉ ስም (Full Name) *" htmlFor="fullName">
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="የተማሪው ሙሉ ስም"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="የክርስትና ስም (Christian Name)" htmlFor="christianName" hint="አማራጭ (Optional)">
                      <input
                        id="christianName"
                        type="text"
                        placeholder="ምሳሌ፡ ገብረ ማርያም"
                        value={profileForm.christianName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, christianName: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="ስልክ ቁጥር (Phone Number) *" htmlFor="phoneNumber">
                      <input
                        id="phoneNumber"
                        type="tel"
                        required
                        placeholder="09..."
                        value={profileForm.phoneNumber}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="ጾታ (Gender)" htmlFor="gender">
                      <select
                        id="gender"
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, gender: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">ይምረጡ (Select)</option>
                        <option value="F">ሴት (Female)</option>
                        <option value="M">ወንድ (Male)</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="ዲፓርትመንት (Department)" htmlFor="department" hint="ምሳሌ፡ EM, ECE, SW, Mech, Food, Civ">
                    <input
                      id="department"
                      type="text"
                      placeholder="የዩኒቨርሲቲ ዲፓርትመንት"
                      value={profileForm.department}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, department: e.target.value })
                      }
                    />
                  </Field>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Button type="submit" disabled={savingProfile} className="bg-primary text-primary-foreground font-semibold">
                      {savingProfile ? "በማስቀመጥ ላይ..." : "መረጃዬን መዝግብ (Save Changes)"}
                    </Button>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-400" /> የተቀየረው መረጃ በዳታቤዝ ውስጥ ይቀመጣል
                    </span>
                  </div>
                </form>
              </PanelBody>
            </Panel>
          )}

          {/* Security */}
          {activeTab === "password" && (
            <Panel className="max-w-md">
              <PanelHeader
                title="Set private password"
                description="Update your login password to secure your portal account."
              />
              <PanelBody>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                  }}
                >
                  <Field
                    label="New password"
                    htmlFor="newPassword"
                    hint="At least 4 characters."
                  >
                    <input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Field>
                  <Button type="submit" disabled={updatingPassword}>
                    {updatingPassword ? "Saving..." : "Update password"}
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

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  የሚከፍሉበት ወር (Month)
                </label>
                <CustomSelect
                  value={editMonth}
                  onChange={setEditMonth}
                  options={months.map((m) => {
                    const isTaken =
                      submittedMonths.has(m.value) && m.value !== editingPayment.month;
                    return {
                      value: m.value,
                      label: isTaken ? `${m.label} — (ቀድሞ ተከፍሏል)` : m.label,
                      disabled: isTaken,
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
                      alt="Receipt preview"
                      className="max-h-48 w-full rounded-xl border border-white/15 object-contain bg-black/40"
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
}
