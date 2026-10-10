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
    begenaId: "",
    program: "በገና (Begena)",
    batch: "Batch 1",
    section: "",
    department: "General",
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
        ...formData,
        begenaId: formData.studentId || formData.begenaId,
      };
      await api.post("/students", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStudents();
      setFormData({
        fullName: "",
        studentId: "",
        begenaId: "",
        program: programs.length > 0 ? programs[0].name : "በገና (Begena)",
        batch: "Batch 1",
        section: "",
        department: "General",
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
          studentId: formData.studentId || formData.begenaId,
          begenaId: formData.studentId || formData.begenaId,
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
        begenaId: "",
        program: "በገና (Begena)",
        batch: "Batch 1",
        section: "",
        department: "General",
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
      const idStr = s.studentId || s.begenaId || "";
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title="Students"
        description={`${filteredStudents.length} of ${students.length} students shown.`}
        action={
          <ModalForm
            title="Add Student"
            triggerText="Add Student"
            onSubmit={handleCreateStudent}
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

            <Field
              label="Student ID"
              htmlFor="studentIdInput"
              hint="Use the program code prefix, e.g. BG2026-0001."
              required
            >
              <input
                id="studentIdInput"
                className="font-mono"
                placeholder="BG2026-0001"
                value={formData.studentId || formData.begenaId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                    begenaId: e.target.value,
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Enrolled Program" htmlFor="studentProgram">
                <CustomSelect
                  id="studentProgram"
                  value={formData.program}
                  onChange={(val) => setFormData({ ...formData, program: val })}
                  options={programs.map((p) => ({
                    value: p.name,
                    label: `${p.name} (${p.code})`,
                  }))}
                />
              </Field>

              <Field label="Assigned Section" htmlFor="studentSection">
                <CustomSelect
                  id="studentSection"
                  value={formData.section}
                  onChange={(val) => setFormData({ ...formData, section: val })}
                  placeholder="Choose section"
                  options={[
                    { value: "", label: "Choose section" },
                    ...sections.map((sec) => ({
                      value: sec.section,
                      label: `${sec.section} (${sec.program || "General"})`,
                    })),
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" htmlFor="studentPhone">
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
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "studentIdDisplay", label: "Student ID" },
          { key: "program", label: "Program" },
          { key: "section", label: "Section" },
          { key: "phoneNumber", label: "Phone" },
          { key: "academicStatusDisplay", label: "Status" },
          { key: "actions", label: "" },
        ]}
        data={filteredStudents.map((s) => ({
          ...s,
          studentIdDisplay: (
            <span className="text-primary font-mono text-xs">
              {s.studentId || s.begenaId}
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
                setFormData({ ...s, studentId: s.studentId || s.begenaId });
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
              <Field label="Full Name" htmlFor="editStudentName">
                <input
                  id="editStudentName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>

              <Field label="Student ID" htmlFor="editStudentId">
                <input
                  id="editStudentId"
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
                <Field label="Enrolled Program" htmlFor="editStudentProgram">
                  <CustomSelect
                    id="editStudentProgram"
                    value={data.program}
                    onChange={(val) => setData({ ...data, program: val })}
                    options={programs.map((p) => ({
                      value: p.name,
                      label: `${p.name} (${p.code})`,
                    }))}
                  />
                </Field>

                <Field label="Assigned Section" htmlFor="editStudentSection">
                  <CustomSelect
                    id="editStudentSection"
                    value={data.section}
                    onChange={(val) => setData({ ...data, section: val })}
                    placeholder="Choose section"
                    options={[
                      { value: "", label: "Choose section" },
                      ...sections.map((sec) => ({
                        value: sec.section,
                        label: sec.section,
                      })),
                    ]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone Number" htmlFor="editStudentPhone">
                  <input
                    id="editStudentPhone"
                    inputMode="tel"
                    value={data.phoneNumber}
                    onChange={(e) =>
                      setData({ ...data, phoneNumber: e.target.value })
                    }
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
              </div>
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
