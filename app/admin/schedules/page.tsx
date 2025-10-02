"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface Schedule {
  _id?: string;
  type: string;
  section: string;
  date: string;
  time: string;
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
  const [formData, setFormData] = useState<Schedule>({
    type: "",
    section: "",
    date: "",
    time: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDay, setFilterDay] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(
    null
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);

  const fetchSchedules = async () => {
    try {
      const res = await api.get<{ schedules: Schedule[] }>("/class-schedules", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSchedules(res.data.schedules);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch schedules");
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await api.post("/class-schedules", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchSchedules();
      setFormData({ type: "", section: "", date: "", time: "" });
      toast.success("Schedule created successfully");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message || "Failed to create schedule"
      );
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleToEdit?._id) return;
    try {
      await api.put(`/class-schedules/${scheduleToEdit._id}`, scheduleToEdit, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchSchedules();
      setEditModalOpen(false);
      setScheduleToEdit(null);
      toast.success("Schedule updated successfully");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message || "Failed to update schedule"
      );
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete?._id) return;
    try {
      await api.delete(`/class-schedules/${scheduleToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Schedule deleted successfully");
      await fetchSchedules();
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete schedule");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const uniqueTypes = Array.from(new Set(schedules.map((s) => s.type)));
  const uniqueSections = Array.from(new Set(schedules.map((s) => s.section)));

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.section.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType ? s.type === filterType : true;
      const matchesSection = filterSection ? s.section === filterSection : true;
      const matchesDay = filterDay ? s.date === filterDay : true;
      return matchesSearch && matchesType && matchesSection && matchesDay;
    });
  }, [schedules, searchQuery, filterType, filterSection, filterDay]);

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">
        Class Schedules
      </h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by Type or Section"
          className="p-2 rounded bg-gray-700 text-white flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

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

      <ModalForm title="Add Schedule" onSubmit={handleCreateSchedule}>
        <select
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="">Select Type</option>
          <option value="basic">basic</option>
          <option value="advanced">advanced</option>
        </select>

        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Section"
          value={formData.section}
          onChange={(e) =>
            setFormData({ ...formData, section: e.target.value })
          }
        />

        <select
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        >
          <option value="">Select Day</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Time (e.g., 2:30pm - 3:30pm)"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />
      </ModalForm>

      <DataTable
        columns={[
          { key: "type", label: "Type" },
          { key: "section", label: "Section" },
          { key: "date", label: "Day" },
          { key: "time", label: "Time" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredSchedules.map((s) => ({
          ...s,
          actions: (
            <div className="flex gap-2" key={s._id ?? `${s.section}-${s.type}`}>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setScheduleToEdit(s);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700"
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
              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="basic">basic</option>
                <option value="advanced">advanced</option>
              </select>

              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Section"
                value={data.section}
                onChange={(e) => setData({ ...data, section: e.target.value })}
              />

              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Time (e.g., 2:30pm - 3:30pm)"
                value={data.time}
                onChange={(e) => setData({ ...data, time: e.target.value })}
              />
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Schedule"
        message={`Are you sure you want to delete the schedule for "${scheduleToDelete?.section}" (${scheduleToDelete?.type})?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
}
