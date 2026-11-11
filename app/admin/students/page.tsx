"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Student, Program, Section } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages } from "@/lib/images";
import { isAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Upload, Download, FileSpreadsheet, Archive, UserCheck, Users } from "lucide-react";

type AcademicStatus = "Active" | "Graduated" | "Suspended" | "Warning";

const academicStatuses: AcademicStatus[] = [
  "Active",
  "Warning",
  "Suspended",
  "Graduated",
];

const statusTone = (status?: string) =>
  status === "Warning"
    ? "warning"
    : status === "Suspended"
      ? "danger"
      : status === "Graduated"
        ? "info"
        : "success";

interface ParsedStudentRow {
  studentId: string;
  fullName: string;
  gender?: string;
  department?: string;
  batch?: string;
  phoneNumber?: string;
  section?: string;
  program?: string;
  error?: string;
}

function parseStudentCSV(
  text: string,
  defaultProgram: string,
  defaultBatch: string,
  defaultSection: string
): ParsedStudentRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Determine delimiter: tab, semicolon, or comma
  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes("\t")) delimiter = "\t";
  else if (firstLine.includes(";") && !firstLine.includes(",")) delimiter = ";";

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/['"]/g, "").trim()
  );

  const findIndex = (aliases: string[]) =>
    headers.findIndex((h) => aliases.some((a) => h === a || h.includes(a)));

  const idIdx = findIndex(["studentid", "student_id", "idno", "id no", "id", "መለያ", "no"]);
  const nameIdx = findIndex(["fullname", "full name", "name", "ስም"]);
  const genderIdx = findIndex(["gender", "sex", "ፆታ"]);
  const deptIdx = findIndex(["department", "dept", "ክፍል"]);
  const batchIdx = findIndex(["batch", "year", "ዓመት"]);
  const phoneIdx = findIndex(["phonenumber", "phone number", "phone", "phoneno", "phone no", "ስልክ", "ቴሌፎን"]);
  const sectionIdx = findIndex(["section", "ሴክሽን"]);

  const rows: ParsedStudentRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    const studentId = idIdx >= 0 && cols[idIdx] ? cols[idIdx].replace(/['"]/g, "").trim() : "";
    const fullName = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx].replace(/['"]/g, "").trim() : "";
    const gender = genderIdx >= 0 && cols[genderIdx] ? cols[genderIdx].replace(/['"]/g, "").trim().toUpperCase() : "";
    const department = deptIdx >= 0 && cols[deptIdx] ? cols[deptIdx].replace(/['"]/g, "").trim() : "";
    const batch = batchIdx >= 0 && cols[batchIdx] ? cols[batchIdx].replace(/['"]/g, "").trim() : defaultBatch;
    const phoneNumber = phoneIdx >= 0 && cols[phoneIdx] ? cols[phoneIdx].replace(/['"]/g, "").trim() : "";
    const rowSection = sectionIdx >= 0 && cols[sectionIdx] ? cols[sectionIdx].replace(/['"]/g, "").trim() : "";

    const assignedSection = defaultSection || rowSection || "Unassigned";

    if (!studentId && !fullName) {
      continue;
    }

    let error: string | undefined;
    if (!studentId) {
      error = "Missing Student ID";
    } else if (!fullName) {
      error = "Missing Full Name";
    }

    rows.push({
      studentId,
      fullName,
      gender,
      department: department || "General",
      batch: batch || defaultBatch,
      phoneNumber: phoneNumber || "0900000000",
      section: assignedSection,
      program: defaultProgram,
      error,
    });
  }

  return rows;
}

export default function StudentsPage() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [formData, setFormData] = useState<Student>({
    fullName: "",
    studentId: "",
    programId: "",
    begenaId: "",
    program: "በገና (Begena)",
    batch: "Batch 8",
    section: "",
    department: "",
    phoneNumber: "",
    academicStatus: "Active",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [studentViewMode, setStudentViewMode] = useState<"active" | "archived" | "all">("active");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [gradModalOpen, setGradModalOpen] = useState(false);
  const [gradProgram, setGradProgram] = useState("በገና (Begena)");
  const [gradBatch, setGradBatch] = useState("Batch 8");
  const [gradSelectedIds, setGradSelectedIds] = useState<string[]>([]);
  const [gradNonGradStatus, setGradNonGradStatus] = useState<"Suspended" | "Warning">("Suspended");
  const [gradSubmitting, setGradSubmitting] = useState(false);

  // CSV Bulk Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importProgram, setImportProgram] = useState("Advance በገና");
  const [importSection, setImportSection] = useState("");
  const [importBatch, setImportBatch] = useState("Batch 3");
  const [importFileText, setImportFileText] = useState("");
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const fetchMetadata = useCallback(async () => {
    try {
      const [progRes, secRes] = await Promise.all([
        api.get("/programs"),
        api.get("/sections"),
      ]);
      setPrograms(progRes.data.programs || []);
      setSections(secRes.data.sections || []);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  }, []);

  const getSectionsForProgram = useCallback(
    (selectedProgName?: string) => {
      if (!selectedProgName) return sections;
      const p = programs.find(
        (pr) => pr.name.toLowerCase() === selectedProgName.toLowerCase()
      );
      const progCode = p?.code?.toLowerCase() || "";
      const progName = selectedProgName.toLowerCase();
      const matched = sections.filter((sec) => {
        if (!sec.program) return true;
        const sp = sec.program.toLowerCase();
        return (
          sp === progName ||
          sp.includes(progName) ||
          progName.includes(sp) ||
          (progCode && (sp === progCode || sp.includes(progCode)))
        );
      });
      return matched.length > 0 ? matched : sections;
    },
    [sections, programs]
  );

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  }, []);

  const handleCreateStudent = async () => {
    try {
      const payload = {
        fullName: formData.fullName,
        studentId: formData.studentId,
        programId: formData.programId || formData.begenaId,
        begenaId: formData.programId || formData.begenaId,
        program: formData.program,
        batch: formData.batch || "Batch 8",
        section: formData.section || "Unassigned",
        department: formData.department,
        phoneNumber: formData.phoneNumber,
        academicStatus: "Active",
      };
      await api.post("/students", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStudents();
      setFormData({
        fullName: "",
        studentId: "",
        programId: "",
        begenaId: "",
        program: programs.length > 0 ? programs[0].name : "በገና (Begena)",
        batch: "Batch 8",
        section: "",
        department: "",
        phoneNumber: "",
        academicStatus: "Active",
      });
      toast.success("Student registered successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          apiErr.response?.data?.message || "Failed to create student"
        );
      } else {
        toast.error("Failed to create student");
      }
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentToEdit?._id) return;

    try {
      await api.put(
        `/students/${studentToEdit._id}`,
        {
          fullName: formData.fullName,
          studentId: formData.studentId,
          programId: formData.programId || formData.begenaId,
          begenaId: formData.programId || formData.begenaId,
          program: formData.program,
          batch: formData.batch,
          section: formData.section,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
          academicStatus: formData.academicStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchStudents();
      setEditModalOpen(false);
      setStudentToEdit(null);
      setFormData({
        fullName: "",
        studentId: "",
        programId: "",
        begenaId: "",
        program: programs.length > 0 ? programs[0].name : "በገና (Begena)",
        batch: "Batch 8",
        section: "",
        department: "",
        phoneNumber: "",
        academicStatus: "Active",
      });
      toast.success("Student updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          apiErr.response?.data?.message || "Failed to update student"
        );
      } else {
        toast.error("Failed to update student");
      }
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete?._id) return;
    try {
      await api.delete(`/students/${studentToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Student deleted successfully");
      fetchStudents();
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  useEffect(() => {
    setIsAdminUser(isAdmin());
    fetchMetadata();
    fetchStudents();
  }, [fetchMetadata, fetchStudents]);

  const uniqueBatches = Array.from(
    new Set(["Batch 8", ...students.map((s) => s.batch || "Batch 8")])
  );
  const uniqueSections = useMemo(() => {
    const fromSecs = (
      filterProgram
        ? sections.filter(
            (s) => s.program?.toLowerCase() === filterProgram.toLowerCase()
          )
        : sections
    )
      .map((s) => s.section)
      .filter(Boolean);

    const targetStudents = filterProgram
      ? students.filter(
          (s) => s.program?.toLowerCase() === filterProgram.toLowerCase()
        )
      : students;
    const fromStuds = targetStudents.map((s) => s.section).filter(Boolean);

    return Array.from(new Set([...fromSecs, ...fromStuds])).sort();
  }, [filterProgram, sections, students]);

  const batchCandidates = useMemo(() => {
    return students.filter(
      (s) =>
        s.program === gradProgram &&
        (s.batch || "Batch 8") === gradBatch &&
        (s.academicStatus === "Active" || !s.academicStatus)
    );
  }, [students, gradProgram, gradBatch]);

  useEffect(() => {
    if (gradModalOpen) {
      setGradSelectedIds(batchCandidates.map((s) => s._id || "").filter(Boolean));
    }
  }, [gradModalOpen, batchCandidates]);

  const handleProcessGraduation = async () => {
    if (batchCandidates.length === 0) {
      toast.error("No active students found in this batch to graduate");
      return;
    }
    setGradSubmitting(true);
    try {
      const res = await api.post(
        "/students/batch-graduation",
        {
          program: gradProgram,
          batch: gradBatch,
          graduatedStudentIds: gradSelectedIds,
          nonGraduatedStatus: gradNonGradStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(res.data.message || "Batch graduation processed successfully");
      fetchStudents();
      setGradModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to process graduation");
      } else {
        toast.error("Failed to process graduation");
      }
    } finally {
      setGradSubmitting(false);
    }
  };

  const importAvailableSections = useMemo(() => {
    return getSectionsForProgram(importProgram);
  }, [getSectionsForProgram, importProgram]);

  useEffect(() => {
    if (importProgram && programs.length > 0) {
      const match = programs.find((pr) => pr.name === importProgram);
      if (match?.currentBatch) {
        setImportBatch(match.currentBatch);
      }
    }
  }, [importProgram, programs]);

  useEffect(() => {
    if (importFileText) {
      const parsed = parseStudentCSV(
        importFileText,
        importProgram,
        importBatch,
        importSection
      );
      setParsedStudents(parsed);
    } else {
      setParsedStudents([]);
    }
  }, [importFileText, importProgram, importBatch, importSection]);

  const handleDownloadTemplate = () => {
    const csvContent =
      "Id No,Name,Gender,Department,Batch,Phone No\n" +
      "01/03,Abinguss Solomon,M,ARCH,4,0904159910\n" +
      "02/03,Addisalem Mengestu,F,SWE,4,0967395496\n" +
      "03/03,Bezawit Sisay,F,BIO,3,0941118018\n";

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkImport = async () => {
    if (parsedStudents.length === 0) {
      toast.error("ፋይል አልተመረጠም ወይም ተማሪ አልተገኘም (No students to import)");
      return;
    }
    const hasFatal = parsedStudents.some((s) => s.error);
    if (hasFatal) {
      toast.error(
        "እባክዎ በስህተት የታዩትን ተማሪዎች መረጃ ያስተካክሉ (Please fix rows with errors)"
      );
      return;
    }

    setIsImporting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/students/bulk",
        {
          students: parsedStudents,
          program: importProgram,
          batch: importBatch,
          section: importSection,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "ተማሪዎች በተሳካ ሁኔታ ተመዝግበዋል!");
      setImportModalOpen(false);
      setImportFileText("");
      setParsedStudents([]);
      fetchStudents();
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          apiErr.response?.data?.message || "ተማሪዎችን ማስገባት አልተቻለም"
        );
      } else {
        toast.error("ተማሪዎችን ማስገባት አልተቻለም");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const activeCount = useMemo(
    () => students.filter((s) => s.academicStatus === "Active" || !s.academicStatus).length,
    [students]
  );

  const archivedCount = useMemo(
    () => students.filter((s) => s.academicStatus === "Graduated").length,
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const uIdStr = s.studentId || "";
      const pIdStr = s.programId || s.begenaId || "";
      const deptStr = s.department || "";
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.fullName.toLowerCase().includes(q) ||
        uIdStr.toLowerCase().includes(q) ||
        pIdStr.toLowerCase().includes(q) ||
        deptStr.toLowerCase().includes(q) ||
        (s.phoneNumber || "").includes(searchQuery);

      const matchesProgram = filterProgram ? s.program === filterProgram : true;
      const matchesBatch = filterBatch ? s.batch === filterBatch : true;
      const matchesSection = filterSection ? s.section === filterSection : true;

      const matchesViewMode =
        studentViewMode === "active"
          ? s.academicStatus === "Active" || !s.academicStatus
          : studentViewMode === "archived"
          ? s.academicStatus === "Graduated"
          : true;

      const matchesStatus = filterStatus ? s.academicStatus === filterStatus : true;

      return (
        matchesSearch &&
        matchesProgram &&
        matchesBatch &&
        matchesSection &&
        matchesViewMode &&
        matchesStatus
      );
    });
  }, [
    students,
    searchQuery,
    filterProgram,
    filterBatch,
    filterSection,
    studentViewMode,
    filterStatus,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${filteredStudents.length} students listed ${
          studentViewMode === "archived"
            ? "· Archived Records"
            : studentViewMode === "active"
            ? "· Active Season"
            : "· All Students"
        }`}
        action={
          !isAdminUser ? (
            <Badge tone="info">View Only</Badge>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (programs.length > 0 && !programs.some((p) => p.name === gradProgram)) {
                    setGradProgram(programs[0].name);
                  }
                  setGradModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs sm:text-sm font-medium transition cursor-pointer shadow-sm"
              >
                <span>Graduation</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (programs.length > 0 && !programs.some((p) => p.name === importProgram)) {
                    setImportProgram(programs[0].name);
                  }
                  setImportModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs sm:text-sm font-medium transition cursor-pointer shadow-sm"
              >
                <Upload size={14} />
                <span>Import CSV</span>
              </button>

              <ModalForm
                title="Add New Student"
                triggerText="Add Student"
                onSubmit={handleCreateStudent}
                image={siteImages.adminPhoto1}
              >
                <Field label="Full Name" htmlFor="studentFullName" required>
                  <input
                    id="studentFullName"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="University Student ID"
                    htmlFor="studentUniversityId"
                    hint="e.g. 001/08"
                    required
                  >
                    <input
                      id="studentUniversityId"
                      placeholder="e.g. 001/08"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentId: e.target.value,
                          programId: formData.programId || e.target.value,
                          begenaId: formData.begenaId || e.target.value,
                        })
                      }
                    />
                  </Field>

                  <Field
                    label="Program Registration ID"
                    htmlFor="studentProgramId"
                    hint="e.g. BG-001/08 (Synced)"
                  >
                    <input
                      id="studentProgramId"
                      placeholder="Registration code"
                      value={formData.programId || formData.begenaId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          programId: e.target.value,
                          begenaId: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Program" htmlFor="studentProgram" required>
                    <CustomSelect
                      id="studentProgram"
                      value={formData.program}
                      onChange={(val) => {
                        const matching = getSectionsForProgram(val);
                        setFormData({
                          ...formData,
                          program: val,
                          section: matching.length > 0 ? matching[0].section : "",
                        });
                      }}
                      options={programs.map((prog) => ({
                        value: prog.name,
                        label: `${prog.name} (${prog.code})`,
                      }))}
                    />
                  </Field>

                  <Field label="Batch" htmlFor="studentBatch" hint="e.g. Batch 8" required>
                    <input
                      id="studentBatch"
                      placeholder="Batch"
                      value={formData.batch}
                      onChange={(e) =>
                        setFormData({ ...formData, batch: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Section" htmlFor="studentSection" required>
                    <CustomSelect
                      id="studentSection"
                      value={formData.section}
                      onChange={(val) =>
                        setFormData({ ...formData, section: val })
                      }
                      options={getSectionsForProgram(formData.program).map((sec) => ({
                        value: sec.section,
                        label: sec.section,
                      }))}
                    />
                  </Field>

                  <Field label="Department" htmlFor="studentDepartment" required>
                    <input
                      id="studentDepartment"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone Number" htmlFor="studentPhone" required>
                    <input
                      id="studentPhone"
                      placeholder="Phone number"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Academic Status" htmlFor="studentStatus">
                    <CustomSelect
                      id="studentStatus"
                      value={formData.academicStatus || "Active"}
                      onChange={(val) =>
                        setFormData({
                          ...formData,
                          academicStatus: val as AcademicStatus,
                        })
                      }
                      options={academicStatuses.map((status) => ({
                        value: status,
                        label: status,
                      }))}
                    />
                  </Field>
                </div>
              </ModalForm>
            </div>
          )
        }
      />

      {/* View Mode Toggle: Active Students vs Archive / Graduated vs All */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-surface inline-flex rounded-lg border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setStudentViewMode("active")}
            className={cn(
              "cursor-pointer rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5",
              studentViewMode === "active"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck size={14} />
            <span>Active ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStudentViewMode("archived")}
            className={cn(
              "cursor-pointer rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5",
              studentViewMode === "archived"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Archive size={14} />
            <span>Archived ({archivedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStudentViewMode("all")}
            className={cn(
              "cursor-pointer rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5",
              studentViewMode === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users size={14} />
            <span>All ({students.length})</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, ID or phone..."
          className="min-w-60 flex-1 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <CustomSelect
          className="w-auto min-w-[170px]"
          value={filterProgram}
          onChange={(val) => {
            setFilterProgram(val);
            setFilterSection("");
          }}
          options={[
            { value: "", label: "All programs" },
            ...programs.map((p) => ({
              value: p.name,
              label: `${p.name} (${p.code})`,
            })),
          ]}
        />
        <CustomSelect
          className="w-auto min-w-[150px]"
          value={filterBatch}
          onChange={(val) => setFilterBatch(val)}
          options={[
            { value: "", label: "All batches" },
            ...uniqueBatches.map((batch) => ({
              value: batch,
              label: batch,
            })),
          ]}
        />
        <CustomSelect
          className="w-auto min-w-[150px]"
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
        {studentViewMode === "all" && (
          <CustomSelect
            className="w-auto min-w-[140px]"
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { value: "", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Graduated", label: "Graduated" },
              { value: "Suspended", label: "Suspended" },
              { value: "Warning", label: "Warning" },
            ]}
          />
        )}
      </div>

      <DataTable
        image={siteImages.adminCard3}
        columns={
          isAdminUser
            ? [
                { key: "fullName", label: "Full Name" },
                { key: "programIdDisplay", label: "Program ID" },
                { key: "studentIdDisplay", label: "University ID" },
                { key: "program", label: "Program" },
                { key: "batchDisplay", label: "Batch" },
                { key: "department", label: "Department" },
                { key: "section", label: "Section" },
                { key: "phoneNumber", label: "Phone" },
                { key: "academicStatusDisplay", label: "Status" },
                { key: "actions", label: "" },
              ]
            : [
                { key: "fullName", label: "Full Name" },
                { key: "programIdDisplay", label: "Program ID" },
                { key: "studentIdDisplay", label: "University ID" },
                { key: "program", label: "Program" },
                { key: "batchDisplay", label: "Batch" },
                { key: "department", label: "Department" },
                { key: "section", label: "Section" },
                { key: "phoneNumber", label: "Phone" },
                { key: "academicStatusDisplay", label: "Status" },
              ]
        }
        data={filteredStudents.map((s) => ({
          ...s,
          programIdDisplay: (
            <span className="text-primary font-mono text-xs font-semibold">
              {s.programId || s.begenaId || "—"}
            </span>
          ),
          studentIdDisplay: (
            <span className="text-muted-foreground font-mono text-xs">
              {s.studentId || "—"}
            </span>
          ),
          batchDisplay: (
            <span className="text-xs font-medium text-foreground">
              {s.batch || "Batch 8"}
            </span>
          ),
          academicStatusDisplay: (
            <Badge tone={statusTone(s.academicStatus)}>
              {s.academicStatus || "Active"}
            </Badge>
          ),
          actions: isAdminUser ? (
            <RowActions
              key={s._id}
              onEdit={() => {
                setStudentToEdit(s);
                setFormData({
                  ...s,
                  studentId: s.studentId || "",
                  programId: s.programId || s.begenaId || "",
                  begenaId: s.programId || s.begenaId || "",
                  department: s.department || "",
                });
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setStudentToDelete(s);
                setDeleteModalOpen(true);
              }}
            />
          ) : null,
        }))}
      />

      {studentToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={studentToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateStudent}
          renderFields={(
            data: Student,
            setData: React.Dispatch<React.SetStateAction<Student>>
          ) => (
            <>
              <Field label="Full Name" htmlFor="editStudentName" required>
                <input
                  id="editStudentName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="University Student ID"
                  htmlFor="editStudentUniversityId"
                  hint="Official university ID (e.g. ETS 0123/14)"
                  required
                >
                  <input
                    id="editStudentUniversityId"
                    value={data.studentId}
                    onChange={(e) =>
                      setData({
                        ...data,
                        studentId: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field
                  label="Program ID (Assigned)"
                  htmlFor="editStudentProgramId"
                  hint="Assigned training ID (e.g. BG2026-0001)"
                  required
                >
                  <input
                    id="editStudentProgramId"
                    className="font-mono"
                    value={data.programId || data.begenaId}
                    onChange={(e) =>
                      setData({
                        ...data,
                        programId: e.target.value,
                        begenaId: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Enrolled Program" htmlFor="editStudentProgram">
                  <CustomSelect
                    id="editStudentProgram"
                    value={data.program}
                    onChange={(val) =>
                      setData({ ...data, program: val, section: "" })
                    }
                    options={programs.map((p) => ({
                      value: p.name,
                      label: `${p.name} (${p.code})`,
                    }))}
                  />
                </Field>

                <Field label="Batch / ዙር" htmlFor="editStudentBatch" required>
                  <input
                    id="editStudentBatch"
                    value={data.batch || "Batch 8"}
                    onChange={(e) =>
                      setData({ ...data, batch: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="School Department"
                  htmlFor="editStudentDepartment"
                  required
                >
                  <input
                    id="editStudentDepartment"
                    value={data.department}
                    onChange={(e) =>
                      setData({ ...data, department: e.target.value })
                    }
                  />
                </Field>

                <Field label="Phone Number" htmlFor="editStudentPhone" required>
                  <input
                    id="editStudentPhone"
                    inputMode="tel"
                    value={data.phoneNumber}
                    onChange={(e) =>
                      setData({ ...data, phoneNumber: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="Assigned Section" htmlFor="editStudentSection">
                <CustomSelect
                  id="editStudentSection"
                  value={data.section}
                  onChange={(val) => setData({ ...data, section: val })}
                  placeholder="Choose section"
                  options={[
                    { value: "", label: "Choose section" },
                    ...getSectionsForProgram(data.program).map((sec) => ({
                      value: sec.section,
                      label: sec.section,
                    })),
                  ]}
                />
              </Field>

              <Field label="Academic Status" htmlFor="editStudentStatus">
                <CustomSelect
                  id="editStudentStatus"
                  value={data.academicStatus || "Active"}
                  onChange={(val) =>
                    setData({
                      ...data,
                      academicStatus: val as AcademicStatus,
                    })
                  }
                  options={academicStatuses.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                />
              </Field>
            </>
          )}
        />
      )}

      <Modal
        isOpen={gradModalOpen}
        onClose={() => setGradModalOpen(false)}
        title="Batch Graduation Management"
        description="Select graduated students and update remaining active records for this program & batch."
        className="max-w-2xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {gradSelectedIds.length} of {batchCandidates.length} graduating
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setGradModalOpen(false)}
                disabled={gradSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleProcessGraduation}
                disabled={gradSubmitting || batchCandidates.length === 0}
              >
                {gradSubmitting ? "Processing..." : `Graduate ${gradSelectedIds.length} Students`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Program" htmlFor="gradProgramSelect">
              <CustomSelect
                id="gradProgramSelect"
                value={gradProgram}
                onChange={(val) => setGradProgram(val)}
                options={programs.map((p) => ({
                  value: p.name,
                  label: `${p.name} (${p.code})`,
                }))}
              />
            </Field>

            <Field label="Batch" htmlFor="gradBatchSelect">
              <CustomSelect
                id="gradBatchSelect"
                value={gradBatch}
                onChange={(val) => setGradBatch(val)}
                options={uniqueBatches.map((b) => ({
                  value: b,
                  label: b,
                }))}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-y border-white/5 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setGradSelectedIds(
                    gradSelectedIds.length === batchCandidates.length
                      ? []
                      : batchCandidates.map((s) => s._id || "").filter(Boolean)
                  )
                }
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {gradSelectedIds.length === batchCandidates.length
                  ? "Deselect All"
                  : `Select All (${batchCandidates.length})`}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Non-graduated outcome:</span>
              <select
                className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-foreground"
                value={gradNonGradStatus}
                onChange={(e) =>
                  setGradNonGradStatus(e.target.value as "Suspended" | "Warning")
                }
              >
                <option value="Suspended">Suspended (Incomplete)</option>
                <option value="Warning">Warning</option>
              </select>
            </div>
          </div>

          {batchCandidates.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No active students found in {gradProgram} ({gradBatch}).
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {batchCandidates.map((s) => {
                const sId = s._id || "";
                const isSelected = gradSelectedIds.includes(sId);
                return (
                  <label
                    key={sId}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGradSelectedIds([...gradSelectedIds, sId]);
                          } else {
                            setGradSelectedIds(
                              gradSelectedIds.filter((id) => id !== sId)
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-white/20 text-primary focus:ring-primary"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {s.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {s.programId || s.begenaId} · {s.studentId} · {s.section || "No section"}
                        </div>
                      </div>
                    </div>

                    <Badge tone={isSelected ? "success" : "warning"}>
                      {isSelected ? "Will Graduate" : gradNonGradStatus}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onClose={() => {
          if (!isImporting) {
            setImportModalOpen(false);
            setImportFileText("");
            setParsedStudents([]);
          }
        }}
        title="Bulk Import Students from CSV"
        description="Select the program and section first, then upload your CSV/TXT file. Students will automatically receive these assignments."
        className="max-w-3xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {parsedStudents.length > 0 ? (
                <span className="text-emerald-400 font-medium">
                  {parsedStudents.length} students detected (Ready to import)
                </span>
              ) : (
                <span>Please select a file</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFileText("");
                  setParsedStudents([]);
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleBulkImport}
                disabled={
                  isImporting ||
                  parsedStudents.length === 0 ||
                  parsedStudents.some((s) => s.error)
                }
              >
                {isImporting
                  ? "Importing..."
                  : `Import (${parsedStudents.length} Students)`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          {/* Step 1: Pre-selection of Program, Section, and Batch */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider">
              1. Select Program & Section
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Program" htmlFor="importProgSelect" required>
                <CustomSelect
                  id="importProgSelect"
                  value={importProgram}
                  onChange={(val) => {
                    setImportProgram(val);
                    const matchingProg = programs.find((p) => p.name === val);
                    if (matchingProg?.currentBatch) {
                      setImportBatch(matchingProg.currentBatch);
                    }
                  }}
                  options={programs.map((p) => ({
                    value: p.name,
                    label: `${p.name} (${p.code})`,
                  }))}
                />
              </Field>

              <Field
                label="Section"
                htmlFor="importSecSelect"
                hint="Optional if specified in CSV"
              >
                <CustomSelect
                  id="importSecSelect"
                  value={importSection}
                  onChange={(val) => setImportSection(val)}
                  options={[
                    { value: "", label: "Detect from CSV" },
                    ...importAvailableSections.map((s) => ({
                      value: s.section,
                      label: s.section,
                    })),
                  ]}
                />
              </Field>

              <Field label="Batch" htmlFor="importBatchInput" required>
                <input
                  id="importBatchInput"
                  value={importBatch}
                  onChange={(e) => setImportBatch(e.target.value)}
                  placeholder="e.g. Batch 3"
                />
              </Field>
            </div>
          </div>

          {/* Step 2: File Upload Area */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                2. Upload File (CSV or TXT)
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-xs text-amber-300 hover:underline cursor-pointer"
              >
                <Download size={13} />
                <span>Download Sample Template</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-white/15 hover:border-primary/50 transition-colors rounded-xl p-5 text-center cursor-pointer bg-black/20">
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      setImportFileText(text || "");
                    };
                    reader.readAsText(file, "UTF-8");
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <FileSpreadsheet className="text-primary h-8 w-8" />
                <p className="text-sm font-medium text-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports standard CSV (.csv) or Tab-separated (.txt)
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Preview of Parsed Students */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                  Parsed Preview ({parsedStudents.length} Students):
                </span>
                <span className="text-muted-foreground">
                  Section: <strong className="text-primary">{importSection || "From CSV"}</strong> | Program: <strong className="text-primary">{importProgram}</strong>
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 sticky top-0 border-b border-white/10 text-muted-foreground">
                    <tr>
                      <th className="p-2 w-10 text-center">#</th>
                      <th className="p-2">Student ID</th>
                      <th className="p-2">Full Name</th>
                      <th className="p-2">Gender</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Batch</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedStudents.map((st, idx) => (
                      <tr
                        key={idx}
                        className={
                          st.error ? "bg-red-500/10" : "hover:bg-white/[0.02]"
                        }
                      >
                        <td className="p-2 text-center text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-mono font-medium text-primary">
                          {st.studentId || (
                            <span className="text-red-400">Missing</span>
                          )}
                        </td>
                        <td className="p-2 font-medium">
                          {st.fullName || (
                            <span className="text-red-400">Missing</span>
                          )}
                        </td>
                        <td className="p-2">{st.gender || "-"}</td>
                        <td className="p-2">{st.department}</td>
                        <td className="p-2">{st.batch}</td>
                        <td className="p-2 font-mono">{st.phoneNumber}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 font-medium">
                            {st.section}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete "${studentToDelete?.fullName}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
      />
    </div>
  );
}
