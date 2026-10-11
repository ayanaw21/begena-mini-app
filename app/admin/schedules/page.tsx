"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Section, Program } from "@/types";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

interface Schedule {
  _id?: string;
  program?: string;
  type?: string;
  section: string;
  date?: string;
  time?: string;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const [formData, setFormData] = useState<Schedule>({
    program: "በገና (Begena)",
    type: "basic",
    section: "",
    date: "Monday",
    time: "17:00 - 19:00",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDay, setFilterDay] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      const [secRes, progRes] = await Promise.all([
        api.get("/sections"),
        api.get("/programs"),
      ]);
      setSections(secRes.data.sections || []);
      setPrograms(progRes.data.programs || []);
    } catch (err) {
      console.error("Failed to fetch metadata", err);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await api.get<{ schedules: Schedule[] }>("/class-schedules", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch schedules");
    }
  }, []);

  const handleCreateSchedule = async () => {
    if (!formData.section) {
      toast.error("Please select a section");
      return;
    }

    try {
      const payload = {
        program: formData.program || "በገና (Begena)",
        type: formData.type || "basic",
        section: formData.section,
        date: formData.date || "Monday",
        time: formData.time || "17:00 - 19:00",
        sessions: [
          {
            day: formData.date || "Monday",
            startTime: (formData.time || "17:00").split("-")[0]?.trim() || "17:00",
            endTime: (formData.time || "19:00").split("-")[1]?.trim() || "19:00",
            room: "Main Hall",
          },
        ],
      };

      await api.post("/class-schedules", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSchedules();
      setFormData({
        program: programs.length > 0 ? programs[0].name : "በገና (Begena)",
        type: "basic",
        section: "",
        date: "Monday",
        time: "17:00 - 19:00",
      });
      toast.success("Schedule created successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to create schedule");
      } else {
        toast.error("Failed to create schedule");
      }
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleToEdit?._id) return;
    try {
      const payload = {
        ...scheduleToEdit,
        sessions: [
          {
            day: scheduleToEdit.date || "Monday",
            startTime: (scheduleToEdit.time || "17:00").split("-")[0]?.trim() || "17:00",
            endTime: (scheduleToEdit.time || "19:00").split("-")[1]?.trim() || "19:00",
            room: "Main Hall",
          },
        ],
      };

      await api.put(`/class-schedules/${scheduleToEdit._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSchedules();
      setEditModalOpen(false);
      setScheduleToEdit(null);
      toast.success("Schedule updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to update schedule");
      } else {
        toast.error("Failed to update schedule");
      }
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete?._id) return;
    try {
      await api.delete(`/class-schedules/${scheduleToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Schedule deleted successfully");
      fetchSchedules();
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete schedule");
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchSchedules();
  }, [fetchMetadata, fetchSchedules]);

  const getSectionsForProgram = useCallback(
    (progName?: string) => {
      if (!progName) return sections;
      const pLower = progName.toLowerCase().trim();
      const progObj = programs.find((p) => p.name === progName);
      const codeLower = progObj ? progObj.code.toLowerCase().trim() : "";

      const matched = sections.filter((sec) => {
        if (!sec.program) return true;
        const sProg = sec.program.toLowerCase().trim();
        return (
          sProg === pLower ||
          sProg.includes(pLower) ||
          pLower.includes(sProg) ||
          (codeLower && (sProg === codeLower || sProg.includes(codeLower)))
        );
      });
      return matched.length > 0 ? matched : sections;
    },
    [sections, programs]
  );

  const uniqueTypes = Array.from(new Set(schedules.map((s) => s.type || "basic")));
  const uniqueSections = Array.from(new Set(sections.map((s) => s.section)));

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const secStr = s.section || "";
      const matchesSearch =
        (s.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        secStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = filterProgram ? s.program === filterProgram : true;
      const matchesType = filterType ? s.type === filterType : true;
      const matchesSection = filterSection ? s.section === filterSection : true;
      const matchesDay = filterDay ? s.date === filterDay : true;
      return matchesSearch && matchesProgram && matchesType && matchesSection && matchesDay;
    });
  }, [schedules, searchQuery, filterProgram, filterType, filterSection, filterDay]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="የትምህርት ክፍለ-ጊዜ (Class Schedules)"
        description="Weekly session times published to students per section."
        action={
          <ModalForm
            title="Add Class Schedule"
            triggerText="Add Schedule"
            onSubmit={handleCreateSchedule}
            image={siteImages.adminCard2}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Program" htmlFor="scheduleProgram">
                <CustomSelect
                  id="scheduleProgram"
                  value={formData.program || "በገና (Begena)"}
                  onChange={(val) => {
                    const available = getSectionsForProgram(val);
                    const keepSec = available.some((s) => s.section === formData.section);
                    setFormData({
                      ...formData,
                      program: val,
                      section: keepSec ? formData.section : "",
                    });
                  }}
                  options={programs.map((p) => ({
                    value: p.name,
                    label: `${p.name} (${p.code})`,
                  }))}
                />
              </Field>

              <Field label="Section" htmlFor="scheduleSection" required>
                <CustomSelect
                  id="scheduleSection"
                  value={formData.section}
                  onChange={(val) =>
                    setFormData({ ...formData, section: val })
                  }
                  placeholder="Choose section"
                  options={[
                    { value: "", label: "Choose section" },
                    ...getSectionsForProgram(formData.program).map((sec) => ({
                      value: sec.section,
                      label: `${sec.section}${sec.program ? ` (${sec.program})` : ""}`,
                    })),
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Session Day" htmlFor="scheduleDay">
                <CustomSelect
                  id="scheduleDay"
                  value={formData.date || "Monday"}
                  onChange={(val) =>
                    setFormData({ ...formData, date: val })
                  }
                  options={daysOfWeek.map((day) => ({
                    value: day,
                    label: day,
                  }))}
                />
              </Field>

              <Field label="Session Time" htmlFor="scheduleTime">
                <input
                  id="scheduleTime"
                  placeholder="17:00 - 19:00"
                  value={formData.time || "17:00 - 19:00"}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </Field>
            </div>
          </ModalForm>
        }
      />

      {/* Filters */}
      <div className="relative z-20 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by section or type..."
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
          className="w-auto min-w-[140px]"
          value={filterType}
          onChange={(val) => setFilterType(val)}
          options={[
            { value: "", label: "All types" },
            ...uniqueTypes.map((type) => ({
              value: type,
              label: type,
            })),
          ]}
        />
        <CustomSelect
          className="w-auto min-w-[150px]"
          value={filterSection}
          onChange={(val) => setFilterSection(val)}
          options={[
            { value: "", label: "All sections" },
            ...uniqueSections.map((section) => ({
              value: section,
              label: section,
            })),
          ]}
        />
        <CustomSelect
          className="w-auto min-w-[140px]"
          value={filterDay}
          onChange={(val) => setFilterDay(val)}
          options={[
            { value: "", label: "All days" },
            ...daysOfWeek.map((day) => ({
              value: day,
              label: day,
            })),
          ]}
        />
      </div>

      <DataCards
        emptyTitle="No schedules found"
        emptyDescription="Add a class schedule, or clear the filters above."
        items={filteredSchedules.map((s) => ({
          id: s._id ?? `${s.section}-${s.type}`,
          title: s.section,
          subtitle: s.program,
          badge: <Badge tone="primary">{s.type || "basic"}</Badge>,
          fields: [
            { label: "Day", value: s.date || "—" },
            { label: "Time", value: s.time || "—" },
          ],
          actions: (
            <RowActions
              onEdit={() => {
                setScheduleToEdit(s);
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setScheduleToDelete(s);
                setDeleteModalOpen(true);
              }}
            />
          ),
        }))}
      />

      {scheduleToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={scheduleToEdit}
          formData={scheduleToEdit}
          setFormData={(update: React.SetStateAction<Schedule>) =>
            setScheduleToEdit((prev) =>
              typeof update === "function" ? update(prev as Schedule) : update
            )
          }
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateSchedule}
          renderFields={(data: Schedule, setData) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program" htmlFor="editScheduleProgram">
                  <CustomSelect
                    id="editScheduleProgram"
                    value={data.program || "በገና (Begena)"}
                    onChange={(val) => {
                      const available = getSectionsForProgram(val);
                      const keepSec = available.some((s) => s.section === data.section);
                      setData({
                        ...data,
                        program: val,
                        section: keepSec ? data.section : "",
                      });
                    }}
                    options={programs.map((p) => ({
                      value: p.name,
                      label: `${p.name} (${p.code})`,
                    }))}
                  />
                </Field>

                <Field label="Section" htmlFor="editScheduleSection">
                  <CustomSelect
                    id="editScheduleSection"
                    value={data.section}
                    onChange={(val) => setData({ ...data, section: val })}
                    placeholder="Choose section"
                    options={[
                      { value: "", label: "Choose section" },
                      ...getSectionsForProgram(data.program).map((sec) => ({
                        value: sec.section,
                        label: `${sec.section}${sec.program ? ` (${sec.program})` : ""}`,
                      })),
                    ]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Session Day" htmlFor="editScheduleDay">
                  <CustomSelect
                    id="editScheduleDay"
                    value={data.date || "Monday"}
                    onChange={(val) => setData({ ...data, date: val })}
                    options={daysOfWeek.map((day) => ({
                      value: day,
                      label: day,
                    }))}
                  />
                </Field>

                <Field label="Session Time" htmlFor="editScheduleTime">
                  <input
                    id="editScheduleTime"
                    placeholder="17:00 - 19:00"
                    value={data.time || "17:00 - 19:00"}
                    onChange={(e) => setData({ ...data, time: e.target.value })}
                  />
                </Field>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Schedule"
        message={`Are you sure you want to delete the schedule for "${scheduleToDelete?.section}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
}
