"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Student, Payment, ClassSchedule } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  day: string;
  status: "Present" | "Absent" | "Late" | "Permission";
  academicYear: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "schedules" | "attendance" | "password">("payments");
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
      <div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 text-white flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400 mx-auto mb-3"></div>
          <p className="text-amber-400 text-sm font-semibold">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[750px] mx-auto min-h-screen bg-gray-900 text-white flex flex-col justify-between md:border md:border-gray-800">
      <div>
        <Navbar />

        {/* Profile Card Header (Mobile Optimized) */}
        <div className="mt-4 mx-3 sm:mx-4 bg-gray-800 border border-amber-950/80 p-4 sm:p-5 rounded-lg shadow-xl">
          <div className="flex justify-between items-start gap-2 border-b border-gray-700/80 pb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-amber-400">
                {student?.fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {student?.program || "Begena"} Program
                </span>
                <span className="bg-green-950 text-green-300 border border-green-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {student?.academicStatus || "Active"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              className="bg-red-600/80 hover:bg-red-700 text-white text-xs px-3 py-1.5 h-auto font-bold"
            >
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-300">
            <div>
              <span className="text-gray-400 block text-[11px]">Student ID:</span>
              <span className="font-mono text-amber-400 font-bold text-sm">{student?.studentId || student?.begenaId}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Batch:</span>
              <span className="font-semibold text-white">{student?.batch}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Section:</span>
              <span className="font-semibold text-white">{student?.section}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Department:</span>
              <span className="font-semibold text-white">{student?.department}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile Scrollable) */}
        <div className="flex gap-1 mx-3 sm:mx-4 mt-5 border-b border-gray-700 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-2 font-bold rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === "payments"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💳 Payments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schedules")}
            className={`px-3 py-2 font-bold rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === "schedules"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📅 Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendance")}
            className={`px-3 py-2 font-bold rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === "attendance"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`px-3 py-2 font-bold rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === "password"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔒 Security
          </button>
        </div>

        {/* TAB 1: PAYMENTS */}
        {activeTab === "payments" && (
          <div className="mx-3 sm:mx-4 mt-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-gray-800 text-amber-400 border border-gray-700 rounded px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="All">All</option>
                </select>
              </div>
              <Button
                onClick={() => router.push("/payment")}
                className="bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold text-xs px-3 py-1.5 h-auto"
              >
                + Submit Receipt Proof
              </Button>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400 border border-gray-700/80">
                <p className="text-xs sm:text-sm">No payment records found for year {selectedYear}.</p>
                <Button
                  onClick={() => router.push("/payment")}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-gray-950 text-xs font-bold px-4 py-2"
                >
                  Submit Payment Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((p) => {
                  const status = (p as unknown as { status?: string }).status || "Pending";
                  return (
                    <div
                      key={p._id}
                      className="bg-gray-800 border border-gray-700 p-3.5 rounded-lg flex justify-between items-center gap-3"
                    >
                      <div>
                        <span className="text-amber-400 font-bold text-base">{p.month}</span>
                        <div className="text-xs text-gray-300 mt-0.5">
                          Section: {p.section} | Batch: {p.batch}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Submitted: {new Date(p.createdAt || "").toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block whitespace-nowrap ${
                            status === "Approved"
                              ? "bg-green-950 text-green-300 border-green-700"
                              : status === "Rejected"
                              ? "bg-red-950 text-red-300 border-red-700"
                              : "bg-amber-950 text-amber-300 border-amber-700 animate-pulse"
                          }`}
                        >
                          {status === "Approved"
                            ? "Approved ✓"
                            : status === "Rejected"
                            ? "Rejected ✕"
                            : "Pending ⏳"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="mx-3 sm:mx-4 mt-4 space-y-4">
            <h2 className="text-base font-bold text-amber-400">
              Timetable for Section: <span className="text-white">{student?.section}</span>
            </h2>
            {schedules.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400 border border-gray-700/80 text-xs sm:text-sm">
                No class schedule published yet for section {student?.section}.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((s) => (
                  <div key={s._id} className="bg-gray-800 border border-amber-950/80 p-4 rounded-lg space-y-2">
                    <div className="text-amber-400 font-bold text-sm">
                      Section {s.section} ({s.type?.toUpperCase() || "REGULAR"})
                    </div>
                    {s.sessions && s.sessions.length > 0 ? (
                      <div className="space-y-2">
                        {s.sessions.map((sess, idx) => (
                          <div key={idx} className="bg-gray-700/60 p-2.5 rounded text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-white block text-sm">{sess.day}</span>
                              <span className="text-gray-300 mt-0.5 block">{sess.startTime} - {sess.endTime}</span>
                            </div>
                            <span className="text-[11px] bg-gray-900 border border-amber-900/60 px-2 py-1 rounded text-amber-300 font-semibold">
                              {sess.room || "Main Room"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-300">
                        Date: {s.date} | Time: {s.time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="mx-3 sm:mx-4 mt-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-base font-bold text-amber-400">Attendance Log</h2>
              <div className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded text-xs">
                Attendance Rate: <span className="text-green-400 font-bold text-sm">{attendanceRate}%</span> ({totalPresent} / {attendance.length})
              </div>
            </div>

            {attendance.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400 border border-gray-700/80 text-xs sm:text-sm">
                No attendance sessions recorded yet.
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700/80 overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-750 text-amber-400 border-b border-gray-700">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Day</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60">
                    {attendance.map((a) => (
                      <tr key={a._id} className="hover:bg-gray-700/40">
                        <td className="p-2.5 font-medium">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="p-2.5 text-gray-300">{a.day}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              a.status === "Present"
                                ? "bg-green-950 text-green-300 border border-green-800"
                                : a.status === "Late"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : a.status === "Permission"
                                ? "bg-blue-950 text-blue-300 border border-blue-800"
                                : "bg-red-950 text-red-300 border border-red-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CHANGE PASSWORD */}
        {activeTab === "password" && (
          <div className="mx-3 sm:mx-4 mt-4 bg-gray-800 border border-gray-700 p-5 rounded-lg space-y-3">
            <h2 className="text-base font-bold text-amber-400">Set Private Password</h2>
            <p className="text-xs text-gray-400">
              Update your student login password to secure your portal account.
            </p>
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={updatingPassword}
                className="w-full bg-amber-600 hover:bg-amber-700 text-gray-950 font-bold py-2.5 text-sm"
              >
                {updatingPassword ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
