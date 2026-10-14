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
import CustomMultiSelect from "@/components/ui/custom-multi-select";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [staffList, setStaffList] = useState<Admin[]>([]);

  const [formData, setFormData] = useState<Section>({
    section: "",
    program: "Begena",
    batch: "Batch 8",
    mainTeacherName: "",
    mainTeacherNames: [],
    assistantTeacherName: "",
    assistantTeacherNames: [],
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

  const getMainTeachers = (s: Section): string[] => {
    if (s.mainTeacherNames && s.mainTeacherNames.length > 0) {
      return s.mainTeacherNames;
    }
    if (s.mainTeacherName) {
      return s.mainTeacherName
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (s.assignedTeacher && s.assignedTeacher !== "TBA") {
      const parts = s.assignedTeacher.split("&").map((t) => t.trim());
      return parts[0]
        ? parts[0]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    }
    return [];
  };

  const getAssistantTeachers = (s: Section): string[] => {
    if (s.assistantTeacherNames && s.assistantTeacherNames.length > 0) {
      return s.assistantTeacherNames;
    }
    if (s.assistantTeacherName) {
      return s.assistantTeacherName
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  };

  const handleCreateSection = async () => {
    try {
      const mainNames = formData.mainTeacherNames || [];
      const asstNames = formData.assistantTeacherNames || [];
      const mainJoined = mainNames.join(", ");
      const asstJoined = asstNames.join(", ");

      let assigned = "TBA";
      if (mainJoined && asstJoined) {
        assigned = `${mainJoined} & ${asstJoined}`;
      } else if (mainJoined) {
        assigned = mainJoined;
      } else if (asstJoined) {
        assigned = asstJoined;
      }

      const payload = {
        ...formData,
        batch: formData.batch || "Batch 8",
        mainTeacherNames: mainNames,
        mainTeacherName: mainJoined,
        assistantTeacherNames: asstNames,
        assistantTeacherName: asstJoined,
        assignedTeacher: assigned,
      };

      await api.post("/sections", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSections();
      setFormData({
        section: "",
        program: programs.length > 0 ? programs[0].name : "Begena",
        batch: "Batch 8",
        mainTeacherName: "",
        mainTeacherNames: [],
        assistantTeacherName: "",
        assistantTeacherNames: [],
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
      const mainNames = formData.mainTeacherNames || [];
      const asstNames = formData.assistantTeacherNames || [];
      const mainJoined = mainNames.join(", ");
      const asstJoined = asstNames.join(", ");

      let assigned = "TBA";
      if (mainJoined && asstJoined) {
        assigned = `${mainJoined} & ${asstJoined}`;
      } else if (mainJoined) {
        assigned = mainJoined;
      } else if (asstJoined) {
        assigned = asstJoined;
      }

      const payload = {
        ...formData,
        batch: formData.batch || "Batch 8",
        mainTeacherNames: mainNames,
        mainTeacherName: mainJoined,
        assistantTeacherNames: asstNames,
        assistantTeacherName: asstJoined,
        assignedTeacher: assigned,
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
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="ምድቦች እና መምህራን (Sections & Teachers)"
        description="Class sections and the teachers assigned to each one."
        action={
          <ModalForm
            title="Create New Section"
            triggerText="Add Section"
            onSubmit={handleCreateSection}
            image={siteImages.adminTeacher}
          >
            <div className="grid gap-4 sm:grid-cols-2">
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

              <Field label="Batch / ዙር" htmlFor="sectionBatch" hint="e.g. Batch 8" required>
                <input
                  id="sectionBatch"
                  placeholder="Batch 8"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                />
              </Field>
            </div>

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

            <Field
              label="Main Teachers (ዋና መምህራን)"
              htmlFor="sectionMainTeachers"
              hint="አንድ ወይም ከዚያ በላይ ዋና መምህራንን መምረጥ ይችላሉ (Select 1 or more main teachers)"
            >
              <CustomMultiSelect
                id="sectionMainTeachers"
                values={formData.mainTeacherNames || []}
                onChange={(vals) =>
                  setFormData({
                    ...formData,
                    mainTeacherNames: vals,
                    mainTeacherName: vals.join(", "),
                  })
                }
                placeholder="ዋና መምህራንን ይምረጡ..."
                options={staffList.map((staff) => ({
                  value: staff.fullName,
                  label: `${staff.fullName} (${staff.role})`,
                }))}
              />
            </Field>

            <Field
              label="Assistant Teachers (ረዳት መምህራን)"
              htmlFor="sectionAssistantTeachers"
              hint="አንድ ወይም ከዚያ በላይ ረዳት መምህራንን መምረጥ ይችላሉ (Select 1 or more assistant teachers)"
            >
              <CustomMultiSelect
                id="sectionAssistantTeachers"
                values={formData.assistantTeacherNames || []}
                onChange={(vals) =>
                  setFormData({
                    ...formData,
                    assistantTeacherNames: vals,
                    assistantTeacherName: vals.join(", "),
                  })
                }
                placeholder="ረዳት መምህራንን ይምረጡ..."
                options={staffList.map((staff) => ({
                  value: staff.fullName,
                  label: `${staff.fullName} (${staff.role})`,
                }))}
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
        items={filteredSections.map((s) => {
          const mainTeachers = getMainTeachers(s);
          const assistantTeachers = getAssistantTeachers(s);

          return {
            id: s._id ?? s.section,
            title: s.section,
            badge: (
              <Badge tone="primary">
                {`${s.program || "Begena"}${s.batch ? ` · ${s.batch}` : ""}`}
              </Badge>
            ),
            fields: [
              {
                label: "Main teachers / ዋና መምህራን",
                value:
                  mainTeachers.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {mainTeachers.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">TBA</span>
                  ),
                wide: true,
              },
              {
                label: "Assistant teachers / ረዳት መምህራን",
                value:
                  assistantTeachers.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {assistantTeachers.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  ),
                wide: true,
              },
            ],
            actions: (
              <RowActions
                onEdit={() => {
                  setSectionToEdit(s);
                  const mTeachers = getMainTeachers(s);
                  const aTeachers = getAssistantTeachers(s);
                  setFormData({
                    section: s.section,
                    program: s.program || "Begena",
                    batch: s.batch || "Batch 8",
                    mainTeacherName: mTeachers.join(", "),
                    mainTeacherNames: mTeachers,
                    assistantTeacherName: aTeachers.join(", "),
                    assistantTeacherNames: aTeachers,
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
          };
        })}
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
              <div className="grid gap-4 sm:grid-cols-2">
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

                <Field label="Batch / ዙር" htmlFor="editSectionBatch" required>
                  <input
                    id="editSectionBatch"
                    value={data.batch || "Batch 8"}
                    onChange={(e) =>
                      setData({ ...data, batch: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="Section Name" htmlFor="editSectionName">
                <input
                  id="editSectionName"
                  value={data.section}
                  onChange={(e) => setData({ ...data, section: e.target.value })}
                />
              </Field>

              <Field
                label="Main Teachers (ዋና መምህራን)"
                htmlFor="editSectionMainTeachers"
                hint="አንድ ወይም ከዚያ በላይ ዋና መምህራንን መምረጥ ይችላሉ (Select 1 or more main teachers)"
              >
                <CustomMultiSelect
                  id="editSectionMainTeachers"
                  values={data.mainTeacherNames || []}
                  onChange={(vals) =>
                    setData({
                      ...data,
                      mainTeacherNames: vals,
                      mainTeacherName: vals.join(", "),
                    })
                  }
                  placeholder="ዋና መምህራንን ይምረጡ..."
                  options={staffList.map((staff) => ({
                    value: staff.fullName,
                    label: `${staff.fullName} (${staff.role})`,
                  }))}
                />
              </Field>

              <Field
                label="Assistant Teachers (ረዳት መምህራን)"
                htmlFor="editSectionAssistantTeachers"
                hint="አንድ ወይም ከዚያ በላይ ረዳት መምህራንን መምረጥ ይችላሉ (Select 1 or more assistant teachers)"
              >
                <CustomMultiSelect
                  id="editSectionAssistantTeachers"
                  values={data.assistantTeacherNames || []}
                  onChange={(vals) =>
                    setData({
                      ...data,
                      assistantTeacherNames: vals,
                      assistantTeacherName: vals.join(", "),
                    })
                  }
                  placeholder="ረዳት መምህራንን ይምረጡ..."
                  options={staffList.map((staff) => ({
                    value: staff.fullName,
                    label: `${staff.fullName} (${staff.role})`,
                  }))}
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
