"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Section, Program } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
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
    <div className="space-y-4">
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Class Schedules</h1>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by section or type..."
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {uniqueSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
        >
          <option value="">All Days</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <ModalForm title="Add Class Schedule" onSubmit={handleCreateSchedule}>
        <div>
          <label className="block text-xs text-amber-400 mb-1">Select Program</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.program || "በገና (Begena)"}
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
          <label className="block text-xs text-amber-400 mb-1">Select Section</label>
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

        <div>
          <label className="block text-xs text-amber-400 mb-1">Batch Level / Type</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.type || "basic"}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="basic">basic</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-amber-400 mb-1">Session Day</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.date || "Monday"}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-amber-400 mb-1">Session Time</label>
          <input
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Time (e.g., 17:00 - 19:00)"
            value={formData.time || "17:00 - 19:00"}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
      </ModalForm>

      <DataTable
        columns={[
          { key: "program", label: "Program" },
          { key: "section", label: "Section" },
          { key: "type", label: "Type" },
          { key: "date", label: "Day" },
          { key: "time", label: "Time" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredSchedules.map((s) => ({
          ...s,
          actions: (
            <div className="flex gap-2" key={s._id ?? `${s.section}-${s.type}`}>
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 font-semibold"
                onClick={() => {
                  setScheduleToEdit(s);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 font-semibold"
                onClick={() => {
                  setScheduleToDelete(s);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
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
              <div>
                <label className="block text-xs text-amber-400 mb-1">Select Program</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.program || "በገና (Begena)"}
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
                <label className="block text-xs text-amber-400 mb-1">Select Section</label>
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

              <div>
                <label className="block text-xs text-amber-400 mb-1">Batch Level / Type</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.type || "basic"}
                  onChange={(e) => setData({ ...data, type: e.target.value })}
                >
                  <option value="basic">basic</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-amber-400 mb-1">Session Day</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.date || "Monday"}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-amber-400 mb-1">Session Time</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Time (e.g., 17:00 - 19:00)"
                  value={data.time || "17:00 - 19:00"}
                  onChange={(e) => setData({ ...data, time: e.target.value })}
                />
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Schedule"
        message={`Are you sure you want to delete the schedule for "${scheduleToDelete?.section}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
}
