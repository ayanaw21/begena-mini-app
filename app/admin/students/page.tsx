"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Student, Program, Section } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";

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
        s.phoneNumber.includes(searchQuery);

      const matchesProgram = filterProgram ? s.program === filterProgram : true;
      const matchesBatch = filterBatch ? s.batch === filterBatch : true;
      const matchesSection = filterSection ? s.section === filterSection : true;

      return matchesSearch && matchesProgram && matchesBatch && matchesSection;
    });
  }, [students, searchQuery, filterProgram, filterBatch, filterSection]);

  return (
    <div className="space-y-4">
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Student Management</h1>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, ID or phone..."
          className="p-2 rounded bg-gray-700 text-white flex-1 min-w-[200px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map((p) => (
            <option key={p._id || p.code} value={p.name}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {uniqueBatches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {uniqueSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      <ModalForm title="Add Student (In-Person Registration)" onSubmit={handleCreateStudent}>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Student ID (e.g., BG2026-0001, MS2026-0001)"
          value={formData.studentId || formData.begenaId}
          onChange={(e) =>
            setFormData({ ...formData, studentId: e.target.value, begenaId: e.target.value })
          }
        />
        <div>
          <label className="block text-xs text-amber-400 mb-1">Enrolled Program</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
          >
            {programs.map((p) => (
              <option key={p._id || p.code} value={p.name}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-amber-400 mb-1">Assigned Section</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          >
            <option value="">Choose Section</option>
            {sections.map((sec) => (
              <option key={sec._id} value={sec.section}>
                {sec.section} ({sec.program || "General"})
              </option>
            ))}
          </select>
        </div>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
        <div>
          <label className="block text-xs text-amber-400 mb-1">Academic Status</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.academicStatus || "Active"}
            onChange={(e) =>
              setFormData({ ...formData, academicStatus: e.target.value as "Active" | "Graduated" | "Suspended" | "Warning" })
            }
          >
            <option value="Active">Active</option>
            <option value="Warning">Warning</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>
      </ModalForm>

      <DataTable
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "studentIdDisplay", label: "Student ID" },
          { key: "program", label: "Program" },
          { key: "section", label: "Section" },
          { key: "phoneNumber", label: "Phone" },
          { key: "academicStatusDisplay", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredStudents.map((s) => ({
          ...s,
          studentIdDisplay: <span className="font-mono font-bold text-amber-400">{s.studentId || s.begenaId}</span>,
          academicStatusDisplay: (
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                s.academicStatus === "Active"
                  ? "bg-green-900/60 text-green-300 border border-green-700"
                  : s.academicStatus === "Warning"
                  ? "bg-amber-900/60 text-amber-300 border border-amber-700"
                  : s.academicStatus === "Suspended"
                  ? "bg-red-900/60 text-red-300 border border-red-700"
                  : "bg-blue-900/60 text-blue-300 border border-blue-700"
              }`}
            >
              {s.academicStatus || "Active"}
            </span>
          ),
          actions: (
            <div className="flex gap-2" key={s._id}>
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 font-semibold"
                onClick={() => {
                  setStudentToEdit(s);
                  setFormData({ ...s, studentId: s.studentId || s.begenaId });
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                type="button"
                className="text-red-500 hover:text-red-700 font-semibold"
                onClick={() => {
                  setStudentToDelete(s);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
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
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Full Name"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Student ID"
                value={data.studentId || data.begenaId}
                onChange={(e) => setData({ ...data, studentId: e.target.value, begenaId: e.target.value })}
              />
              <div>
                <label className="block text-xs text-amber-400 mb-1">Enrolled Program</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.program}
                  onChange={(e) => setData({ ...data, program: e.target.value })}
                >
                  {programs.map((p) => (
                    <option key={p._id || p.code} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Assigned Section</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.section}
                  onChange={(e) => setData({ ...data, section: e.target.value })}
                >
                  <option value="">Choose Section</option>
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec.section}>
                      {sec.section}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Phone Number"
                value={data.phoneNumber}
                onChange={(e) =>
                  setData({ ...data, phoneNumber: e.target.value })
                }
              />
              <div>
                <label className="block text-xs text-amber-400 mb-1">Academic Status</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.academicStatus || "Active"}
                  onChange={(e) =>
                    setData({ ...data, academicStatus: e.target.value as "Active" | "Graduated" | "Suspended" | "Warning" })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Warning">Warning</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete "${studentToDelete?.fullName}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
      />
    </div>
  );
}
