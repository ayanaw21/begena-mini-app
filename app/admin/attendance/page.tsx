"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Section, Student, Program, AttendanceSummaryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, PageHeader, Panel } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import PhotoPanel from "@/components/ui/photo-panel";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import toast from "react-hot-toast";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Permission";

interface StudentRecordState {
  studentDbId: string;
  studentId: string;
  fullName: string;
  status: AttendanceStatus;
}

const attendanceOptions: {
  value: AttendanceStatus;
  label: string;
  icon: string;
  activeClass: string;
}[] = [
  {
    value: "Present",
    label: "Present",
    icon: "✅",
    activeClass: "border-emerald-500/50 bg-emerald-500/20",
  },
  {
    value: "Late",
    label: "Late",
    icon: "⏱️",
    activeClass: "border-amber-500/50 bg-amber-500/20",
  },
  {
    value: "Permission",
    label: "Permission",
    icon: "📄",
    activeClass: "border-sky-500/50 bg-sky-500/20",
  },
  {
    value: "Absent",
    label: "Absent",
    icon: "❌",
    activeClass: "border-red-500/50 bg-red-500/20",
  },
];

const statusActions = [
  { value: "Active", label: "Activate", title: "Set as active" },
  { value: "Warning", label: "Warn", title: "Issue a warning for absences" },
  { value: "Suspended", label: "Suspend", title: "Suspend student" },
] as const;

const statusTone = (status?: string) =>
  status === "Warning"
    ? "warning"
    : status === "Suspended"
      ? "danger"
      : status === "Graduated"
        ? "info"
        : "success";

const rateColor = (rate: number) =>
  rate >= 85
    ? { bar: "bg-emerald-500", text: "text-emerald-400" }
    : rate >= 70
      ? { bar: "bg-amber-500", text: "text-amber-400" }
      : { bar: "bg-red-500", text: "text-red-400" };

export default function AttendancePage() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"daily" | "summary">("daily");

  // Daily marking state
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedDailyProgram, setSelectedDailyProgram] = useState("");
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

  const availableDailySections = selectedDailyProgram
    ? sections.filter((s) => s.program === selectedDailyProgram)
    : sections;

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
        (s) =>
          s.section === selectedSection &&
          (!selectedDailyProgram || s.program === selectedDailyProgram)
      );

      // Sort students naturally by student ID (e.g. 001/08, 002/08, 010/08)
      sectionStudents.sort((a, b) => {
        const idA = (a.studentId || a.begenaId || "").trim();
        const idB = (b.studentId || b.begenaId || "").trim();
        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
      });

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
          studentDbId: s._id || "",
          studentId: s.studentId || s.begenaId || "—",
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
  }, [selectedSection, selectedDate, selectedDailyProgram]);

  const fetchAttendanceSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/attendance/summary?program=${selectedProgFilter}&section=${selectedSecFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rawSummary: AttendanceSummaryItem[] = res.data.summary || [];
      rawSummary.sort((a, b) => {
        const idA = (a.studentId || "").trim();
        const idB = (b.studentId || "").trim();
        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
      });
      setSummaryList(rawSummary);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance summary analytics");
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedProgFilter, selectedSecFilter]);

  useEffect(() => {
    setIsAdminUser(isAdmin());
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

  const handleStatusChange = (studentDbId: string, status: AttendanceStatus) => {
    setStudentRecords((prev) =>
      prev.map((r) => (r.studentDbId === studentDbId ? { ...r, status } : r))
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
          program: selectedDailyProgram || undefined,
          section: selectedSection,
          date: selectedDate,
          day: dayName,
          academicYear: "2026",
          records: studentRecords.map((r) => ({
            studentId: r.studentDbId,
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

  const totalPermissions = summaryList.reduce(
    (acc, curr) => acc + (curr.permissionCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Tracking"
        description="Daily attendance records, permissions, and status overviews."
        action={
          <div className="bg-surface inline-flex rounded-lg border border-white/10 p-1">
            {[
              { id: "daily" as const, label: "Daily Sheet" },
              { id: "summary" as const, label: "Summary Overview" },
            ].map((tab) => (
              <button
                key={tab.id}
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
        }
      />

      {activeTab === "daily" ? (
        <div className="space-y-4">
          <div className="relative z-20 rounded-xl border border-white/10 bg-surface p-4 flex flex-wrap items-end gap-4 shadow-sm">
            <Field
              label="Program"
              htmlFor="attendanceDailyProgram"
              className="relative z-30 min-w-44 flex-1"
            >
              <CustomSelect
                id="attendanceDailyProgram"
                value={selectedDailyProgram}
                onChange={(val) => {
                  setSelectedDailyProgram(val);
                  if (val) {
                    const match = sections.find(
                      (s) => s.section === selectedSection && s.program === val
                    );
                    if (!match) setSelectedSection("");
                  }
                }}
                placeholder="All programs"
                options={[
                  { value: "", label: "All programs" },
                  ...programs.map((prog) => ({
                    value: prog.name,
                    label: `${prog.name} (${prog.code})`,
                  })),
                ]}
              />
            </Field>

            <Field
              label="Section"
              htmlFor="attendanceSection"
              className="relative z-30 min-w-52 flex-1"
            >
              <CustomSelect
                id="attendanceSection"
                value={selectedSection}
                onChange={(val) => setSelectedSection(val)}
                placeholder="Choose section"
                options={[
                  { value: "", label: "Choose section" },
                  ...availableDailySections.map((sec) => ({
                    value: sec.section,
                    label: selectedDailyProgram
                      ? `${sec.section} (${sec.mainTeacherName || sec.assignedTeacher || "TBA"})`
                      : `${sec.section}${sec.program ? ` · ${sec.program}` : ""} (${sec.mainTeacherName || sec.assignedTeacher || "TBA"})`,
                  })),
                ]}
              />
            </Field>

            <Field label="Class Date" htmlFor="attendanceDate" className="w-44">
              <input
                id="attendanceDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Field>

            {selectedSection && (
              <Button
                onClick={handleSaveAttendance}
                disabled={savingDaily || studentRecords.length === 0}
                className="ml-auto"
              >
                {savingDaily ? "Saving..." : "Save Attendance"}
              </Button>
            )}
          </div>

          {!selectedSection ? (
            <Panel>
              <EmptyState
                title="No Section Selected"
                description="Please select a class section above to view and take daily attendance."
              />
            </Panel>
          ) : loadingDaily ? (
            <div className="text-muted-foreground flex items-center justify-center gap-3 py-12 text-sm">
              <Loader2 size={18} className="text-primary animate-spin" />
              Loading student roster...
            </div>
          ) : studentRecords.length === 0 ? (
            <Panel>
              <EmptyState
                title="No Students in this Section"
                description={`No students were found in section "${selectedSection}"${selectedDailyProgram ? ` for ${selectedDailyProgram}` : ""}.`}
              />
            </Panel>
          ) : (
            <div className="bg-surface overflow-hidden rounded-xl border border-white/10 shadow-sm overflow-x-auto">
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-b border-white/5 px-4 py-2.5 text-xs">
                {attendanceOptions.map((option) => (
                  <span key={option.value} className="flex items-center gap-1.5">
                    <span aria-hidden>{option.icon}</span>
                    {option.label}
                  </span>
                ))}
              </div>
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
                    <th className="w-10 px-3 py-2.5 font-medium">#</th>
                    <th className="px-3 py-2.5 font-medium">Student ID</th>
                    <th className="px-3 py-2.5 font-medium">Student Name</th>
                    <th className="px-3 py-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {studentRecords.map((r, idx) => (
                    <tr key={r.studentDbId} className="hover:bg-white/[0.03]">
                      <td className="text-muted-foreground px-3 py-2">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                        {r.studentId || "—"}
                      </td>
                      <td className="px-3 py-2 font-medium">{r.fullName}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          {attendanceOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              title={option.label}
                              aria-label={option.label}
                              aria-pressed={r.status === option.value}
                              onClick={() =>
                                handleStatusChange(r.studentDbId, option.value)
                              }
                              className={cn(
                                "flex size-9 cursor-pointer items-center justify-center rounded-md border text-base transition-all",
                                r.status === option.value
                                  ? option.activeClass
                                  : "border-white/10 opacity-40 hover:opacity-100"
                              )}
                            >
                              {option.icon}
                            </button>
                          ))}
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
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Tracked students",
                value: summaryList.length,
                className: "",
              },
              {
                label: "Permission days",
                value: totalPermissions,
                className: "text-sky-400",
              },
              {
                label: "At risk (3+ absences)",
                value: highRiskCount,
                className: "text-primary",
              },
              {
                label: "Avg attendance rate",
                value: `${
                  summaryList.length > 0
                    ? Math.round(
                        summaryList.reduce(
                          (acc, curr) => acc + curr.attendanceRate,
                          0
                        ) / summaryList.length
                      )
                    : 100
                }%`,
                className: "text-emerald-400",
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

          {/* Filters */}
          <div className="relative z-20 flex flex-wrap gap-3">
            <CustomSelect
              className="w-auto min-w-[170px]"
              value={selectedProgFilter}
              onChange={(val) => setSelectedProgFilter(val)}
              options={[
                { value: "All", label: "All programs" },
                ...programs.map((p) => ({
                  value: p.name,
                  label: `${p.name} (${p.code})`,
                })),
              ]}
            />
            <CustomSelect
              className="w-auto min-w-[160px]"
              value={selectedSecFilter}
              onChange={(val) => setSelectedSecFilter(val)}
              options={[
                { value: "All", label: "All sections" },
                ...sections.map((sec) => ({
                  value: sec.section,
                  label: sec.section,
                })),
              ]}
            />
          </div>

          {loadingSummary ? (
            <div className="text-muted-foreground flex items-center justify-center gap-3 py-12 text-sm">
              <Loader2 size={18} className="text-primary animate-spin" />
              Calculating attendance analytics...
            </div>
          ) : summaryList.length === 0 ? (
            <Panel>
              <EmptyState
                title="No Attendance Data"
                description="No attendance records match the selected filters."
              />
            </Panel>
          ) : (
            <div className="bg-surface overflow-hidden rounded-xl border border-white/10 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
                    <th className="px-4 py-2.5 font-medium">Student ID</th>
                    <th className="px-4 py-2.5 font-medium">Full Name</th>
                    <th className="px-4 py-2.5 text-center font-medium">
                      Attended
                    </th>
                    <th className="px-4 py-2.5 text-center font-medium">
                      Permission
                    </th>
                    <th className="px-4 py-2.5 text-center font-medium">
                      Absences
                    </th>
                    <th className="px-4 py-2.5 font-medium">Rate</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summaryList.map((st) => (
                    <tr key={st.studentIdObj} className="hover:bg-white/[0.03]">
                      <td className="text-primary px-4 py-3 font-mono text-xs">
                        {st.studentId}
                      </td>
                      <td className="px-4 py-3 font-medium">{st.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-emerald-400">
                          {st.presentCount}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {st.totalSessions}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {st.permissionCount > 0 ? (
                          <Badge tone="info" className="font-mono">
                            {st.permissionCount} {st.permissionCount === 1 ? "day" : "days"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {st.absentCount >= 3 ? (
                          <Badge tone="danger">{st.absentCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {st.absentCount}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                rateColor(st.attendanceRate).bar
                              )}
                              style={{ width: `${st.attendanceRate}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              rateColor(st.attendanceRate).text
                            )}
                          >
                            {st.attendanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(st.academicStatus)}>
                          {st.academicStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {isAdminUser ? (
                            statusActions
                              .filter(
                                (action) => action.value !== st.academicStatus
                              )
                              .map((action) => (
                                <Button
                                  key={action.value}
                                  size="sm"
                                  variant="outline"
                                  disabled={updatingStatusId === st.studentIdObj}
                                  title={action.title}
                                  onClick={() =>
                                    handleUpdateStudentAcademicStatus(
                                      st.studentIdObj,
                                      action.value
                                    )
                                  }
                                >
                                  {action.label}
                                </Button>
                              ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
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
