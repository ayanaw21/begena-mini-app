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
import {
  Field,
  PageBody,
  PageContainer,
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/ui/page";
import { Loader2, LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  day: string;
  status: "Present" | "Absent" | "Late" | "Permission";
  academicYear: string;
}

type TabId = "payments" | "schedules" | "attendance" | "password";

const tabs: { id: TabId; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "schedules", label: "Schedule" },
  { id: "attendance", label: "Attendance" },
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

  const totalPresent = attendance.filter((a) => a.status === "Present" || a.status === "Late").length;
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
                      return (
                        <li
                          key={p._id}
                          className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{p.month}</p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Section {p.section} · Batch {p.batch} · submitted{" "}
                              {new Date(p.createdAt || "").toLocaleDateString()}
                            </p>
                          </div>
                          <Badge tone={paymentTone(status)}>{status}</Badge>
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
            <Panel>
              <PanelHeader
                title="Attendance log"
                action={
                  <div className="text-right">
                    <p className="text-primary text-lg leading-none font-bold">
                      {attendanceRate}%
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {totalPresent} / {attendance.length}
                    </p>
                  </div>
                }
              />
              {attendance.length === 0 ? (
                <EmptyState
                  title="No sessions recorded"
                  description="Attendance will appear here once classes are logged."
                />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs tracking-wider uppercase">
                      <th className="px-5 py-2 text-left font-medium">Date</th>
                      <th className="px-5 py-2 text-left font-medium">Day</th>
                      <th className="px-5 py-2 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attendance.map((a) => (
                      <tr key={a._id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-2.5 font-medium">
                          {new Date(a.date).toLocaleDateString()}
                        </td>
                        <td className="text-muted-foreground px-5 py-2.5">
                          {a.day}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <Badge tone={attendanceTone(a.status)}>{a.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

      <Footer />
    </div>
  );
}
