"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Section, Program, Admin } from "@/types";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [staffList, setStaffList] = useState<Admin[]>([]);

  const [formData, setFormData] = useState<Section>({
    section: "",
    program: "Begena",
    mainTeacherName: "",
    assistantTeacherName: "",
    capacity: 30,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      const res = await api.get("/sections");
      setSections(res.data.sections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sections");
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data.programs || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data.staff || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCreateSection = async () => {
    try {
      const payload = {
        ...formData,
        assignedTeacher: formData.mainTeacherName
          ? `${formData.mainTeacherName}${formData.assistantTeacherName ? ` & ${formData.assistantTeacherName}` : ""}`
          : "TBA",
      };

      await api.post("/sections", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSections();
      setFormData({
        section: "",
        program: "Begena",
        mainTeacherName: "",
        assistantTeacherName: "",
        capacity: 30,
      });
      toast.success("Section created successfully");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create section");
    }
  };

  const handleUpdateSection = async () => {
    if (!sectionToEdit?._id) return;

    try {
      const payload = {
        ...formData,
        assignedTeacher: formData.mainTeacherName
          ? `${formData.mainTeacherName}${formData.assistantTeacherName ? ` & ${formData.assistantTeacherName}` : ""}`
          : "TBA",
      };

      await api.put(`/sections/${sectionToEdit._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchSections();
      setEditModalOpen(false);
      setSectionToEdit(null);
      toast.success("Section updated successfully");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update section");
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete?._id) return;
    try {
      await api.delete(`/sections/${sectionToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Section deleted successfully");
      fetchSections();
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete section");
    }
  };

  useEffect(() => {
    fetchSections();
    fetchPrograms();
    fetchStaff();
  }, [fetchSections, fetchPrograms, fetchStaff]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch = s.section
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesProgram = filterProgram ? s.program === filterProgram : true;

      return matchesSearch && matchesProgram;
    });
  }, [sections, searchQuery, filterProgram]);

  return (
    <div className="space-y-6">
      <Figure
        src={siteImages.scheduleBanner}
        alt="Sections"
        ratio="ultrawide"
        className="min-h-[140px] sm:min-h-[180px]"
        priority
        scrim
      >
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          አስተዳዳሪ ፖርታል · Admin Portal
        </p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl text-foreground">
          ምድቦች እና መምህራን (Sections & Teachers)
        </h1>
      </Figure>

      <PageHeader
        title="Sections & Teachers"
        description="Class sections and the teachers assigned to each one."
        action={
          <ModalForm
            title="Create New Section"
            triggerText="Add Section"
            onSubmit={handleCreateSection}
          >
            <Field label="Program" htmlFor="sectionProgram" required>
              <CustomSelect
                id="sectionProgram"
                value={formData.program}
                onChange={(val) =>
                  setFormData({ ...formData, program: val })
                }
                options={programs.map((prog) => ({
                  value: prog.name,
                  label: `${prog.name} (${prog.code})`,
                }))}
              />
            </Field>

            <Field label="Section Name" htmlFor="sectionName" required>
              <input
                id="sectionName"
                placeholder="Basic A, Advanced B"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
              />
            </Field>

            <Field label="Main Teacher (ዋና መምህር)" htmlFor="sectionMainTeacher">
              <CustomSelect
                id="sectionMainTeacher"
                value={formData.mainTeacherName || ""}
                onChange={(val) =>
                  setFormData({ ...formData, mainTeacherName: val })
                }
                placeholder="Select main teacher"
                options={[
                  { value: "", label: "Select main teacher" },
                  ...staffList.map((staff) => ({
                    value: staff.fullName,
                    label: `${staff.fullName} (${staff.role})`,
                  })),
                ]}
              />
            </Field>

            <Field
              label="Assistant Teacher (ረዳት መምህር)"
              htmlFor="sectionAssistantTeacher"
              hint="Optional."
            >
              <CustomSelect
                id="sectionAssistantTeacher"
                value={formData.assistantTeacherName || ""}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    assistantTeacherName: val,
                  })
                }
                placeholder="Select assistant teacher"
                options={[
                  { value: "", label: "Select assistant teacher" },
                  ...staffList.map((staff) => ({
                    value: staff.fullName,
                    label: `${staff.fullName} (${staff.role})`,
                  })),
                ]}
              />
            </Field>
          </ModalForm>
        }
      />

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by section name"
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
            ...programs.map((prog) => ({
              value: prog.name,
              label: prog.name,
            })),
          ]}
        />
      </div>

      <DataCards
        emptyTitle="No sections found"
        emptyDescription="Create a section, or clear the filters above."
        items={filteredSections.map((s) => ({
          id: s._id ?? s.section,
          title: s.section,
          badge: <Badge tone="primary">{s.program || "Begena"}</Badge>,
          fields: [
            {
              label: "Main teacher",
              value: s.mainTeacherName || s.assignedTeacher || "TBA",
              wide: true,
            },
            {
              label: "Assistant teacher",
              value: s.assistantTeacherName || "—",
              wide: true,
            },
          ],
          actions: (
            <RowActions
              onEdit={() => {
                setSectionToEdit(s);
                setFormData({
                  section: s.section,
                  program: s.program || "Begena",
                  mainTeacherName: s.mainTeacherName || s.assignedTeacher || "",
                  assistantTeacherName: s.assistantTeacherName || "",
                  capacity: s.capacity || 30,
                });
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setSectionToDelete(s);
                setDeleteModalOpen(true);
              }}
            />
          ),
        }))}
      />

      {sectionToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={sectionToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateSection}
          renderFields={(
            data: Section,
            setData: React.Dispatch<React.SetStateAction<Section>>
          ) => (
            <>
              <Field label="Program" htmlFor="editSectionProgram">
                <CustomSelect
                  id="editSectionProgram"
                  value={data.program || "Begena"}
                  onChange={(val) => setData({ ...data, program: val })}
                  options={programs.map((prog) => ({
                    value: prog.name,
                    label: prog.name,
                  }))}
                />
              </Field>

              <Field label="Section Name" htmlFor="editSectionName">
                <input
                  id="editSectionName"
                  value={data.section}
                  onChange={(e) => setData({ ...data, section: e.target.value })}
                />
              </Field>

              <Field label="Main Teacher" htmlFor="editSectionMainTeacher">
                <CustomSelect
                  id="editSectionMainTeacher"
                  value={data.mainTeacherName || ""}
                  onChange={(val) =>
                    setData({ ...data, mainTeacherName: val })
                  }
                  placeholder="Select main teacher"
                  options={[
                    { value: "", label: "Select main teacher" },
                    ...staffList.map((staff) => ({
                      value: staff.fullName,
                      label: staff.fullName,
                    })),
                  ]}
                />
              </Field>

              <Field
                label="Assistant Teacher"
                htmlFor="editSectionAssistantTeacher"
              >
                <CustomSelect
                  id="editSectionAssistantTeacher"
                  value={data.assistantTeacherName || ""}
                  onChange={(val) =>
                    setData({ ...data, assistantTeacherName: val })
                  }
                  placeholder="Select assistant teacher"
                  options={[
                    { value: "", label: "Select assistant teacher" },
                    ...staffList.map((staff) => ({
                      value: staff.fullName,
                      label: staff.fullName,
                    })),
                  ]}
                />
              </Field>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Section"
        message={`Are you sure you want to delete "${sectionToDelete?.section}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
