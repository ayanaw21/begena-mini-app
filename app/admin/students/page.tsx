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
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [formData, setFormData] = useState<Student>({
    fullName: "",
    studentId: "",
    programId: "",
    begenaId: "",
    program: "በገና (Begena)",
    batch: "Batch 1",
    section: "",
    department: "",
    phoneNumber: "",
    academicStatus: "Active",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

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
        batch: formData.batch || "Batch 1",
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
        batch: "Batch 1",
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
        batch: "Batch 1",
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
    fetchMetadata();
    fetchStudents();
  }, [fetchMetadata, fetchStudents]);

  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch || "Batch 1")));
  const uniqueSections = Array.from(new Set(students.map((s) => s.section)));

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

      return matchesSearch && matchesProgram && matchesBatch && matchesSection;
    });
  }, [students, searchQuery, filterProgram, filterBatch, filterSection]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="የተማሪዎች ዝርዝር (Students Registry)"
        description={`${filteredStudents.length} of ${students.length} students shown.`}
        action={
          <ModalForm
            title="Add Student"
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
                hint="University ID (e.g. ETS 0123/14)"
                required
              >
                <input
                  id="studentUniversityId"
                  placeholder="ETS 0123/14"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                    })
                  }
                />
              </Field>

              <Field
                label="Program ID (Assigned)"
                htmlFor="studentProgramId"
                hint="Assigned training ID (e.g. BG2026-0001)"
                required
              >
                <input
                  id="studentProgramId"
                  className="font-mono"
                  placeholder="BG2026-0001"
                  value={formData.programId || formData.begenaId}
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
              <Field
                label="School Department"
                htmlFor="studentDepartment"
                hint="e.g. Software Engineering, Architecture"
                required
              >
                <input
                  id="studentDepartment"
                  placeholder="e.g. Software Engineering"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </Field>

              <Field label="Enrolled Program" htmlFor="studentProgram">
                <CustomSelect
                  id="studentProgram"
                  value={formData.program}
                  onChange={(val) =>
                    setFormData({ ...formData, program: val, section: "" })
                  }
                  options={programs.map((p) => ({
                    value: p.name,
                    label: `${p.name} (${p.code})`,
                  }))}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assigned Section" htmlFor="studentSection">
                <CustomSelect
                  id="studentSection"
                  value={formData.section}
                  onChange={(val) => setFormData({ ...formData, section: val })}
                  placeholder="Choose section"
                  options={[
                    { value: "", label: "Choose section" },
                    ...getSectionsForProgram(formData.program).map((sec) => ({
                      value: sec.section,
                      label: sec.section,
                    })),
                  ]}
                />
              </Field>

              <Field label="Phone Number" htmlFor="studentPhone" required>
                <input
                  id="studentPhone"
                  inputMode="tel"
                  placeholder="0911223344"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </Field>
            </div>
          </ModalForm>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, ID or phone..."
          className="min-w-60 flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <CustomSelect
          className="w-auto min-w-[170px]"
          value={filterProgram}
          onChange={(val) => setFilterProgram(val)}
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
      </div>

      <DataTable
        image={siteImages.adminCard3}
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "programIdDisplay", label: "Program ID" },
          { key: "studentIdDisplay", label: "University ID" },
          { key: "program", label: "Program" },
          { key: "department", label: "Department" },
          { key: "section", label: "Section" },
          { key: "phoneNumber", label: "Phone" },
          { key: "academicStatusDisplay", label: "Status" },
          { key: "actions", label: "" },
        ]}
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
          academicStatusDisplay: (
            <Badge tone={statusTone(s.academicStatus)}>
              {s.academicStatus || "Active"}
            </Badge>
          ),
          actions: (
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
          ),
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
