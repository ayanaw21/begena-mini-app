"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import Figure from "@/components/ui/figure";
import { PageBody, PageContainer, PageHeader, Panel } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteImages } from "@/lib/images";
import {
  getValidToken,
  getUserName,
  getUserRole,
  removeToken,
} from "@/lib/auth";
import api from "@/lib/api";
import { Section, Student } from "@/types";
import {
  Users,
  Calendar,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Layers,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface AttendanceRecord {
  studentId: string;
  status: "Present" | "Absent" | "Permission";
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Teacher specific state
  const [assignedSections, setAssignedSections] = useState<Section[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"sections" | "students" | "attendance" | "schedule">("sections");

  // Attendance state
  const [selectedSectionForAttendance, setSelectedSectionForAttendance] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "Present" | "Absent" | "Permission">>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      toast.error("Please sign in to access the instructor portal");
      router.replace("/admin/login");
      return;
    }
    const name = getUserName() || "Instructor";
    const role = getUserRole() || "teacher";
    setUserName(name);
    setUserRole(role);
  }, [router]);

  // Fetch teacher data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const name = getUserName() || "";

      // Fetch profile & assigned sections from /auth/me, fallback to /sections
      const [meRes, secRes, studRes, schedRes] = await Promise.all([
        api.get("/auth/me").catch(() => null),
        api.get("/sections").catch(() => null),
        api.get("/students").catch(() => null),
        api.get("/class-schedules").catch(() => null),
      ]);

      const fetchedSections: Section[] = secRes?.data?.sections || [];
      setAllSections(fetchedSections);

      // Find sections where this instructor is assigned
      let mySections: Section[] = meRes?.data?.assignedSections || [];
      if (mySections.length === 0 && name) {
        mySections = fetchedSections.filter((sec) => {
          const mainNames = sec.mainTeacherNames || (sec.mainTeacherName ? sec.mainTeacherName.split(",") : []);
          const asstNames = sec.assistantTeacherNames || (sec.assistantTeacherName ? sec.assistantTeacherName.split(",") : []);
          const assigned = sec.assignedTeacher || "";
          
          const inMain = mainNames.some((m) => m.trim().toLowerCase().includes(name.toLowerCase()));
          const inAsst = asstNames.some((a) => a.trim().toLowerCase().includes(name.toLowerCase()));
          const inAssigned = assigned.toLowerCase().includes(name.toLowerCase());
          return inMain || inAsst || inAssigned;
        });
      }

      setAssignedSections(mySections);
      if (mySections.length > 0 && !selectedSectionForAttendance) {
        setSelectedSectionForAttendance(mySections[0].section);
      }

      // Students
      const fetchedStudents: Student[] = studRes?.data?.students || [];
      setStudents(fetchedStudents);

      // Schedules
      setSchedules(schedRes?.data?.schedules || []);
    } catch (err) {
      console.error("Failed to load instructor dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSectionForAttendance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter students belonging to this teacher's assigned section(s)
  const myStudents = useMemo(() => {
    if (assignedSections.length === 0) return [];
    const sectionNames = assignedSections.map((s) => s.section);
    return students.filter((st) =>
      sectionNames.some(
        (secName) =>
          st.section === secName ||
          st.section?.includes(secName) ||
          secName.includes(st.section)
      )
    );
  }, [students, assignedSections]);

  // Students for the selected attendance section
  const sectionStudentsForAttendance = useMemo(() => {
    if (!selectedSectionForAttendance) return [];
    return students.filter(
      (st) =>
        st.section === selectedSectionForAttendance ||
        st.section?.includes(selectedSectionForAttendance)
    );
  }, [students, selectedSectionForAttendance]);

  // Handle setting individual student attendance
  const setStudentStatus = (studentId: string, status: "Present" | "Absent" | "Permission") => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Submit attendance
  const handleSaveAttendance = async () => {
    if (!selectedSectionForAttendance) {
      toast.error("Please select a section");
      return;
    }
    if (sectionStudentsForAttendance.length === 0) {
      toast.error("No students in this section to mark attendance for");
      return;
    }

    try {
      setSavingAttendance(true);
      const records = sectionStudentsForAttendance.map((st) => ({
        studentId: st._id || st.studentId,
        status: attendanceRecords[st._id || st.studentId] || "Present",
      }));

      await api.post("/attendance", {
        section: selectedSectionForAttendance,
        date: attendanceDate,
        records,
      });

      toast.success("የተማሪዎች ክትትል (Attendance) በተሳካ ሁኔታ ተመዝግቧል!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#101e36]">
      <Navbar />

      <PageBody>
        <PageContainer className="space-y-6">
          {/* Hero Banner */}
          <Figure
            src={siteImages.adminTeacher}
            alt="የመምህራን ፖርታል"
            ratio="ultrawide"
            priority
            scrim
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                  የበገና ንዑስ ክፍል · መምህራን ፖርታል
                </p>
                <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl text-white">
                  እንኳን ደህና መጡ፣ {userName}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                  የሚያስተምሯቸው ክፍሎች እና የተማሪዎች ክትትል ማስተባበሪያ
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                <span>ይውጡ (Logout)</span>
              </Button>
            </div>
          </Figure>

          {/* Quick Profile Summary Bar */}
          <div className="bg-[#172b4c] rounded-2xl border border-[#234578] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xl">
                {userName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-white text-base sm:text-lg">{userName}</h2>
                  <Badge tone="info">መምህር (Instructor)</Badge>
                  <Badge tone="success">Active</Badge>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  ፕሮግራም: <span className="text-amber-300 font-medium">Basic በገና</span> · የበገና ንዑስ ክፍል
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {userRole === "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="text-xs border-amber-400/40 text-amber-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  ወደ ዋናው አድሚን
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="sm:hidden text-xs text-rose-300"
              >
                <LogOut className="h-4 w-4 mr-1" /> ይውጡ
              </Button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#172b4c] border border-[#234578] rounded-2xl p-4 flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">የተመደቡባቸው ክፍሎች</p>
                <p className="text-xl font-bold text-white">
                  {assignedSections.length > 0
                    ? assignedSections.map((s) => s.section).join(", ")
                    : "Sec-E"}
                </p>
              </div>
            </div>

            <div className="bg-[#172b4c] border border-[#234578] rounded-2xl p-4 flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">የክፍልዎ ተማሪዎች</p>
                <p className="text-xl font-bold text-white">
                  {myStudents.length} ተማሪዎች
                </p>
              </div>
            </div>

            <div className="bg-[#172b4c] border border-[#234578] rounded-2xl p-4 flex items-center gap-3.5 col-span-2 sm:col-span-1">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">የትምህርት ደረጃ</p>
                <p className="text-base font-bold text-white">መሰረታዊ በገና (Basic)</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-[#234578] gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("sections")}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === "sections"
                  ? "bg-[#172b4c] text-amber-300 border-t-2 border-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>የተመደቡባቸው ክፍሎች ({assignedSections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === "students"
                  ? "bg-[#172b4c] text-amber-300 border-t-2 border-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>የክፍሌ ተማሪዎች ({myStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === "attendance"
                  ? "bg-[#172b4c] text-amber-300 border-t-2 border-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>የተማሪዎች ክትትል (Attendance)</span>
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === "schedule"
                  ? "bg-[#172b4c] text-amber-300 border-t-2 border-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>የትምህርት ሰዓት (Schedule)</span>
            </button>
          </div>

          {/* TAB 1: Assigned Sections View */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <PageHeader
                title="የሚያስተምሯቸው ክፍሎች"
                description="በእርስዎ ሃላፊነት የተመደቡ የቤዚክ በገና ክፍሎች እና አብረዎት የሚያስተምሩ መምህራን።"
              />

              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-7 w-7 text-amber-400 animate-spin mx-auto" />
                  <p className="mt-2 text-xs text-slate-400">ክፍሎችን በመጫን ላይ...</p>
                </div>
              ) : (assignedSections.length > 0 ? assignedSections : allSections.slice(0, 1)).map((sec) => (
                <div
                  key={sec._id || sec.section}
                  className="bg-[#172b4c] border border-[#234578] rounded-2xl p-5 space-y-4 hover:border-amber-400/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">ምድብ: {sec.section}</h3>
                        <Badge tone="primary">{sec.program || "Basic በገና"}</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {sec.batch || "Batch 1"} · የመቀበል አቅም: {sec.capacity || 30} ተማሪዎች
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSectionForAttendance(sec.section);
                        setActiveTab("attendance");
                      }}
                      className="bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-semibold"
                    >
                      አቴንዳንስ ይውሰዱ
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 border-t border-[#234578] pt-4 text-xs">
                    <div className="bg-[#101e36] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-slate-400 block font-medium">ዋና መምህራን (Main Teachers):</span>
                      <p className="text-white font-semibold text-sm">
                        {sec.mainTeacherNames?.join(", ") || sec.mainTeacherName || "Dagmawit Yoseph, Solomon Mehabaw"}
                      </p>
                    </div>

                    <div className="bg-[#101e36] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-slate-400 block font-medium">ረዳት መምህራን (Assistant Teachers):</span>
                      <p className="text-white font-semibold text-sm">
                        {sec.assistantTeacherNames?.join(", ") || sec.assistantTeacherName || "Selam, Soliyana Shewalante"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Section Students View */}
          {activeTab === "students" && (
            <div className="space-y-4">
              <PageHeader
                title="የክፍልዎ ተማሪዎች ዝርዝር"
                description="በእርስዎ ክፍል ስር የተመዘገቡ ተማሪዎች ሙሉ መረጃ።"
              />

              {myStudents.length === 0 ? (
                <Panel className="p-8 text-center text-slate-300">
                  <p className="text-sm font-semibold">ለዚህ ክፍል እስካሁን የተመዘገበ ተማሪ የለም።</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ተማሪዎች ሲመዘገቡ በዚህ ገጽ ላይ በቀጥታ ይታያሉ።
                  </p>
                </Panel>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#234578]">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-200">
                    <thead className="bg-[#12223d] text-slate-400 uppercase text-[11px] font-semibold border-b border-[#234578]">
                      <tr>
                        <th className="px-4 py-3">የተማሪው ስም</th>
                        <th className="px-4 py-3">Student ID</th>
                        <th className="px-4 py-3">የበገና ቁጥር</th>
                        <th className="px-4 py-3">ክፍል (Section)</th>
                        <th className="px-4 py-3">ስልክ ቁጥር</th>
                        <th className="px-4 py-3">ሁኔታ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#234578] bg-[#172b4c]">
                      {myStudents.map((st) => (
                        <tr key={st._id || st.studentId} className="hover:bg-[#1d3868]/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{st.fullName}</td>
                          <td className="px-4 py-3 font-mono text-amber-300">{st.studentId}</td>
                          <td className="px-4 py-3 font-mono">{st.begenaId || "—"}</td>
                          <td className="px-4 py-3 font-medium">{st.section}</td>
                          <td className="px-4 py-3">{st.phoneNumber || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge tone={st.academicStatus === "Active" ? "success" : "neutral"}>
                              {st.academicStatus || "Active"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Attendance Taking View */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <PageHeader
                title="የተማሪዎች ክትትል መመዝገቢያ"
                description="ክፍሉን እና ቀኑን በመምረጥ የተማሪዎችን አቴንዳንስ ያስተካክሉ።"
              />

              <div className="bg-[#172b4c] border border-[#234578] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      ክፍል ይምረጡ (Section)
                    </label>
                    <select
                      value={selectedSectionForAttendance}
                      onChange={(e) => setSelectedSectionForAttendance(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#101e36] border border-[#234578] text-white text-sm focus:outline-none focus:border-amber-400"
                    >
                      {(assignedSections.length > 0 ? assignedSections : allSections).map((s) => (
                        <option key={s.section} value={s.section}>
                          {s.section} ({s.program || "Basic በገና"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      የትምህርት ቀን (Date)
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#101e36] border border-[#234578] text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {sectionStudentsForAttendance.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    ለዚህ ክፍል የተመዘገበ ተማሪ እስካሁን የለም።
                  </div>
                ) : (
                  <div className="space-y-2 border-t border-[#234578] pt-4">
                    <p className="text-xs font-medium text-slate-300 mb-2">
                      የተማሪዎች ስም ዝርዝር ({sectionStudentsForAttendance.length} ተማሪዎች)
                    </p>

                    <div className="divide-y divide-[#234578]/60">
                      {sectionStudentsForAttendance.map((st) => {
                        const sId = st._id || st.studentId;
                        const currentStatus = attendanceRecords[sId] || "Present";

                        return (
                          <div
                            key={sId}
                            className="py-2.5 flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">{st.fullName}</p>
                              <p className="text-xs text-slate-400 font-mono">{st.studentId}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setStudentStatus(sId, "Present")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                  currentStatus === "Present"
                                    ? "bg-emerald-500 text-white font-bold"
                                    : "bg-[#101e36] text-slate-400 hover:text-white"
                                }`}
                              >
                                ✓ ተገኝቷል
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentStatus(sId, "Permission")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                  currentStatus === "Permission"
                                    ? "bg-amber-500 text-slate-950 font-bold"
                                    : "bg-[#101e36] text-slate-400 hover:text-white"
                                }`}
                              >
                                ፈቃድ
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentStatus(sId, "Absent")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                  currentStatus === "Absent"
                                    ? "bg-rose-500 text-white font-bold"
                                    : "bg-[#101e36] text-slate-400 hover:text-white"
                                }`}
                              >
                                ✕ ቀሪ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-[#234578]">
                      <Button
                        onClick={handleSaveAttendance}
                        disabled={savingAttendance}
                        className="w-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold"
                      >
                        {savingAttendance ? "በመመዝገብ ላይ..." : "አቴንዳንስ መዝግብ (Save Attendance)"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Schedule View */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <PageHeader
                title="የትምህርት ክፍለ-ጊዜ መርሐግብር"
                description="የሳምንቱ የክፍለ-ጊዜ ሰዓታት እና የክፍል አጠቃቀም።"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {(assignedSections.length > 0 ? assignedSections : allSections.slice(0, 2)).map((sec) => (
                  <div
                    key={sec.section}
                    className="bg-[#172b4c] border border-[#234578] rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{sec.section}</h4>
                      <Badge tone="primary">{sec.program || "Basic በገና"}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <p>
                        <span className="text-slate-400">ዋና መምህር:</span>{" "}
                        {sec.mainTeacherNames?.join(", ") || sec.mainTeacherName || "ተመድቧል"}
                      </p>
                      <p>
                        <span className="text-slate-400">ረዳት መምህር:</span>{" "}
                        {sec.assistantTeacherNames?.join(", ") || sec.assistantTeacherName || "ተመድቧል"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Footer />
    </div>
  );
}
