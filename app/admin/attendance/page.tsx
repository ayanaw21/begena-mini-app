"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Section, Student, Program, AttendanceSummaryItem } from "@/types";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Permission";

interface StudentRecordState {
  studentId: string;
  fullName: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"daily" | "summary">("daily");

  // Daily marking state
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [studentRecords, setStudentRecords] = useState<StudentRecordState[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [savingDaily, setSavingDaily] = useState(false);

  // Summary Analytics state
  const [selectedProgFilter, setSelectedProgFilter] = useState("All");
  const [selectedSecFilter, setSelectedSecFilter] = useState("All");
  const [summaryList, setSummaryList] = useState<AttendanceSummaryItem[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const [secRes, progRes] = await Promise.all([
        api.get("/sections"),
        api.get("/programs"),
      ]);
      setSections(secRes.data.sections || []);
      setPrograms(progRes.data.programs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial metadata");
    }
  }, []);

  const fetchSectionStudentsAndAttendance = useCallback(async () => {
    if (!selectedSection) return;
    setLoadingDaily(true);

    try {
      const token = localStorage.getItem("token");
      const studentsRes = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allStudents: Student[] = studentsRes.data.students || [];
      const sectionStudents = allStudents.filter(
        (s) => s.section === selectedSection
      );

      const attRes = await api.get(
        `/attendance?section=${selectedSection}&date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const existingAtt = attRes.data.attendance || [];

      const initialRecords: StudentRecordState[] = sectionStudents.map((s) => {
        const found = existingAtt.find(
          (a: { student?: { _id?: string } | string }) =>
            (typeof a.student === "object" ? a.student?._id : a.student) === s._id
        );
        return {
          studentId: s._id || "",
          fullName: s.fullName,
          status: found ? found.status : "Present",
        };
      });

      setStudentRecords(initialRecords);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load section attendance");
    } finally {
      setLoadingDaily(false);
    }
  }, [selectedSection, selectedDate]);

  const fetchAttendanceSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/attendance/summary?program=${selectedProgFilter}&section=${selectedSecFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummaryList(res.data.summary || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance summary analytics");
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedProgFilter, selectedSecFilter]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedSection && activeTab === "daily") {
      fetchSectionStudentsAndAttendance();
    }
  }, [selectedSection, selectedDate, activeTab, fetchSectionStudentsAndAttendance]);

  useEffect(() => {
    if (activeTab === "summary") {
      fetchAttendanceSummary();
    }
  }, [activeTab, selectedProgFilter, selectedSecFilter, fetchAttendanceSummary]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }

    setSavingDaily(true);
    try {
      const token = localStorage.getItem("token");
      const dateObj = new Date(selectedDate);
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = days[dateObj.getDay()];

      await api.post(
        "/attendance",
        {
          section: selectedSection,
          date: selectedDate,
          day: dayName,
          academicYear: "2026",
          records: studentRecords.map((r) => ({
            studentId: r.studentId,
            status: r.status,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save attendance");
    } finally {
      setSavingDaily(false);
    }
  };

  const handleUpdateStudentAcademicStatus = async (
    studentIdObj: string,
    newStatus: "Active" | "Warning" | "Suspended" | "Graduated"
  ) => {
    setUpdatingStatusId(studentIdObj);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/students/${studentIdObj}/status`,
        { academicStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Academic status updated to ${newStatus}`);
      fetchAttendanceSummary();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student academic status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const highRiskCount = summaryList.filter(
    (s) => s.absentCount >= 3 || s.attendanceRate < 75
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-amber-400 text-2xl font-bold">Attendance & Decision Center</h1>
          <p className="text-gray-400 text-sm">
            Track daily class attendance and monitor student overall attendance risk for warnings/suspensions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "daily"
                ? "bg-amber-600 text-gray-900 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📋 Mark Daily Sheet
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "summary"
                ? "bg-amber-600 text-gray-900 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 Overall Status & Decisions
          </button>
        </div>
      </div>

      {activeTab === "daily" ? (
        <div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex gap-4 flex-wrap items-center mb-6">
            <div>
              <label className="block text-xs text-amber-400 mb-1">Select Section</label>
              <select
                className="p-2 rounded bg-gray-700 text-white min-w-[200px]"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Choose Section</option>
                {sections.map((sec) => (
                  <option key={sec._id} value={sec.section}>
                    {sec.section} ({sec.mainTeacherName || sec.assignedTeacher || "TBA"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-amber-400 mb-1">Class Date</label>
              <input
                type="date"
                className="p-2 rounded bg-gray-700 text-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {selectedSection && (
              <div className="self-end ml-auto">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={savingDaily || studentRecords.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-gray-900 font-bold px-6 py-2"
                >
                  {savingDaily ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            )}
          </div>

          {!selectedSection ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400 border border-gray-700">
              Please select a section above to load student attendance sheet.
            </div>
          ) : loadingDaily ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading student roster...</p>
            </div>
          ) : studentRecords.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400 border border-gray-700">
              No students enrolled in section &quot;{selectedSection}&quot; yet.
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-700 text-amber-400">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((r, idx) => (
                    <tr key={r.studentId} className="border-b border-gray-700/60 hover:bg-gray-700/40">
                      <td className="p-3 text-gray-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">{r.fullName}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "Present")}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              r.status === "Present"
                                ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Present ✅
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "Late")}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              r.status === "Late"
                                ? "bg-yellow-600 text-white shadow-lg ring-2 ring-yellow-400"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Late ⏱️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "Permission")}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              r.status === "Permission"
                                ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Permission 📄
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "Absent")}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              r.status === "Absent"
                                ? "bg-red-600 text-white shadow-lg ring-2 ring-red-400"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Absent ❌
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Overall Analytics & Decision Center Tab */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-xs font-semibold uppercase">Total Tracked Students</h3>
              <p className="text-3xl font-bold text-white mt-1">{summaryList.length}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-amber-950/60">
              <h3 className="text-amber-400 text-xs font-semibold uppercase">Students at Risk (3+ Absences)</h3>
              <p className="text-3xl font-bold text-amber-400 mt-1">{highRiskCount}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-xs font-semibold uppercase">Avg Platform Attendance Rate</h3>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {summaryList.length > 0
                  ? Math.round(
                      summaryList.reduce((acc, curr) => acc + curr.attendanceRate, 0) /
                        summaryList.length
                    )
                  : 100}
                %
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex gap-4 flex-wrap items-center">
            <div>
              <label className="block text-xs text-amber-400 mb-1">Filter by Program</label>
              <select
                className="p-2 rounded bg-gray-700 text-white min-w-[180px]"
                value={selectedProgFilter}
                onChange={(e) => setSelectedProgFilter(e.target.value)}
              >
                <option value="All">All Programs</option>
                {programs.map((p) => (
                  <option key={p._id || p.code} value={p.name}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-amber-400 mb-1">Filter by Section</label>
              <select
                className="p-2 rounded bg-gray-700 text-white min-w-[180px]"
                value={selectedSecFilter}
                onChange={(e) => setSelectedSecFilter(e.target.value)}
              >
                <option value="All">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec._id} value={sec.section}>
                    {sec.section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingSummary ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Calculating attendance statistics...</p>
            </div>
          ) : summaryList.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400 border border-gray-700">
              No attendance statistics found matching the filters.
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto shadow-lg">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-700 text-amber-400">
                  <tr>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Program / Section</th>
                    <th className="p-3 text-center">Sessions (Attended / Total)</th>
                    <th className="p-3 text-center">Absences</th>
                    <th className="p-3 text-center">Attendance %</th>
                    <th className="p-3 text-center">Academic Status</th>
                    <th className="p-3 text-center">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryList.map((st) => (
                    <tr
                      key={st.studentIdObj}
                      className="border-b border-gray-700/60 hover:bg-gray-700/40"
                    >
                      <td className="p-3 font-mono font-bold text-amber-400">{st.studentId}</td>
                      <td className="p-3 font-semibold text-white">{st.fullName}</td>
                      <td className="p-3 text-gray-300">
                        {st.program} <br />
                        <span className="text-xs text-gray-400">{st.section}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-white">
                        <span className="text-green-400">{st.presentCount}</span> / {st.totalSessions}
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span
                          className={
                            st.absentCount >= 3
                              ? "text-red-400 bg-red-950/60 px-2 py-1 rounded"
                              : "text-gray-300"
                          }
                        >
                          {st.absentCount}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`font-bold ${
                              st.attendanceRate >= 85
                                ? "text-green-400"
                                : st.attendanceRate >= 70
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {st.attendanceRate}%
                          </span>
                          <div className="w-16 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                st.attendanceRate >= 85
                                  ? "bg-green-500"
                                  : st.attendanceRate >= 70
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${st.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            st.academicStatus === "Active"
                              ? "bg-green-900/60 text-green-300 border border-green-700"
                              : st.academicStatus === "Warning"
                              ? "bg-amber-900/60 text-amber-300 border border-amber-700"
                              : st.academicStatus === "Suspended"
                              ? "bg-red-900/60 text-red-300 border border-red-700"
                              : "bg-blue-900/60 text-blue-300 border border-blue-700"
                          }`}
                        >
                          {st.academicStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-1">
                          {st.academicStatus !== "Active" && (
                            <button
                              disabled={updatingStatusId === st.studentIdObj}
                              onClick={() =>
                                handleUpdateStudentAcademicStatus(st.studentIdObj, "Active")
                              }
                              className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded"
                              title="Set Active"
                            >
                              Activate
                            </button>
                          )}
                          {st.academicStatus !== "Warning" && (
                            <button
                              disabled={updatingStatusId === st.studentIdObj}
                              onClick={() =>
                                handleUpdateStudentAcademicStatus(st.studentIdObj, "Warning")
                              }
                              className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded"
                              title="Issue Warning for Absences"
                            >
                              Warn ⚠️
                            </button>
                          )}
                          {st.academicStatus !== "Suspended" && (
                            <button
                              disabled={updatingStatusId === st.studentIdObj}
                              onClick={() =>
                                handleUpdateStudentAcademicStatus(st.studentIdObj, "Suspended")
                              }
                              className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded"
                              title="Suspend Student"
                            >
                              Suspend ⛔
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
