"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { Program } from "@/types";
import toast from "react-hot-toast";

interface StaffMember {
  _id?: string;
  fullName: string;
  role: "admin" | "teacher";
  phoneNumber?: string;
  department?: string;
  specialization?: string;
  status?: "Active" | "Inactive";
  password?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<StaffMember>({
    fullName: "",
    role: "teacher",
    phoneNumber: "",
    department: "General",
    specialization: "Basic በገና",
    status: "Active",
    password: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data.programs || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get("/users/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff list");
    }
  }, []);

  const handleCreateStaff = async () => {
    try {
      await api.post("/users", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStaff();
      setFormData({
        fullName: "",
        role: "teacher",
        phoneNumber: "",
        department: "General",
        specialization: "በገና (Begena)",
        status: "Active",
        password: "",
      });
      toast.success("Staff member created successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to create staff");
      } else {
        toast.error("Failed to create staff member");
      }
    }
  };

  const handleUpdateStaff = async () => {
    if (!staffToEdit?._id) return;
    try {
      await api.put(`/users/${staffToEdit._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStaff();
      setEditModalOpen(false);
      setStaffToEdit(null);
      setFormData({
        fullName: "",
        role: "teacher",
        phoneNumber: "",
        department: "General",
        specialization: "በገና (Begena)",
        status: "Active",
        password: "",
      });
      toast.success("Staff member updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to update staff");
      } else {
        toast.error("Failed to update staff member");
      }
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete?._id) return;
    try {
      await api.delete(`/users/${staffToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Staff member deleted successfully");
      fetchStaff();
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete staff member");
    }
  };

  const programOptions = useMemo(() => {
    if (programs.length > 0) {
      return programs.map((p) => ({
        value: p.name,
        label: `${p.name} (${p.code})`,
      }));
    }
    return [
      { value: "Basic በገና", label: "Basic በገና (BASIC-BG)" },
      { value: "በገና (Begena)", label: "በገና (Begena)" },
      { value: "መሰንቆ (Masinko)", label: "መሰንቆ (Masinko)" },
      { value: "ክራር (Kirar)", label: "ክራር (Kirar)" },
    ];
  }, [programs]);

  useEffect(() => {
    fetchStaff();
    fetchPrograms();
  }, [fetchStaff, fetchPrograms]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="አስተማሪዎች እና አባላት (Staff & Instructors)"
        description="Admins and teachers who can sign in to the panel."
        action={
          <ModalForm
            title="Create New Staff Member"
            triggerText="Add Staff"
            onSubmit={handleCreateStaff}
            image={siteImages.adminTeacher}
          >
            <Field label="Full Name" htmlFor="staffName" required>
              <input
                id="staffName"
                placeholder="Motuma Kidanu"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role" htmlFor="staffRole" required>
                <CustomSelect
                  id="staffRole"
                  value={formData.role}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      role: val as "admin" | "teacher",
                    })
                  }
                  options={[
                    { value: "teacher", label: "Teacher / Instructor" },
                    { value: "admin", label: "Admin & Instructor" },
                  ]}
                />
              </Field>

              <Field label="Service Status" htmlFor="staffStatus">
                <CustomSelect
                  id="staffStatus"
                  value={formData.status || "Active"}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      status: val as "Active" | "Inactive",
                    })
                  }
                  options={[
                    { value: "Active", label: "Active (Current Batch)" },
                    { value: "Inactive", label: "Inactive / Past Servant" },
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Program" htmlFor="staffProgram" required hint="Select assigned program">
                <CustomSelect
                  id="staffProgram"
                  value={formData.specialization || (programs[0]?.name || "Basic በገና")}
                  onChange={(val) =>
                    setFormData({ ...formData, specialization: val })
                  }
                  options={
                    programOptions.some((o) => o.value === formData.specialization)
                      ? programOptions
                      : formData.specialization
                      ? [{ value: formData.specialization, label: formData.specialization }, ...programOptions]
                      : programOptions
                  }
                />
              </Field>

              <Field label="Department / Background" htmlFor="staffDepartment" hint="e.g. Software Eng, Alumni">
                <input
                  id="staffDepartment"
                  placeholder="e.g. Software Engineering"
                  value={formData.department || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" htmlFor="staffPhone">
                <input
                  id="staffPhone"
                  inputMode="tel"
                  placeholder="0911223344"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </Field>

              <Field
                label="Password"
                htmlFor="staffPassword"
                hint="Default is teacher123 if empty."
              >
                <input
                  id="staffPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Set an initial password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Field>
            </div>
          </ModalForm>
        }
      />

      <DataCards
        emptyTitle="No staff members registered"
        emptyDescription="Create a staff member to grant access."
        items={staff.map((s, idx) => ({
          id: s._id || s.fullName,
          title: s.fullName,
          subtitle: s.specialization
            ? `${s.specialization} · ${s.department || "General"}`
            : (s.department || "General"),
          badge: (
            <div className="flex gap-1.5 items-center">
              <Badge tone={s.role === "admin" ? "primary" : "info"}>
                {s.role === "admin" ? "Admin" : "Instructor"}
              </Badge>
              <Badge tone={s.status === "Inactive" ? "neutral" : "success"}>
                {s.status || "Active"}
              </Badge>
            </div>
          ),
          image: adminCardBackgrounds[idx % adminCardBackgrounds.length],
          fields: [
            { label: "Program", value: s.specialization || "Basic በገና" },
            { label: "Department", value: s.department || "General" },
            { label: "Phone", value: s.phoneNumber || "—" },
            { label: "Status", value: s.status || "Active" },
          ],
          actions: (
            <RowActions
              key={s._id}
              onEdit={() => {
                const normalizedProg =
                  s.specialization?.includes("መሰረታዊ") || s.specialization?.includes("Basic")
                    ? "Basic በገና"
                    : s.specialization || (programs[0]?.name || "Basic በገና");

                setStaffToEdit(s);
                setFormData({
                  ...s,
                  department: s.department || "የበገና ንዑስ ክፍል",
                  specialization: normalizedProg,
                  status: s.status || "Active",
                  password: "",
                });
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setStaffToDelete(s);
                setDeleteModalOpen(true);
              }}
            />
          ),
        }))}
      />

      {staffToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={staffToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateStaff}
          renderFields={(
            data: StaffMember,
            setData: React.Dispatch<React.SetStateAction<StaffMember>>
          ) => (
            <>
              <Field label="Full Name" htmlFor="editStaffName">
                <input
                  id="editStaffName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role" htmlFor="editStaffRole">
                  <CustomSelect
                    id="editStaffRole"
                    value={data.role}
                    onChange={(val) =>
                      setData({
                        ...data,
                        role: val as "admin" | "teacher",
                      })
                    }
                    options={[
                      { value: "teacher", label: "Teacher / Instructor" },
                      { value: "admin", label: "Admin & Instructor" },
                    ]}
                  />
                </Field>

                <Field label="Service Status" htmlFor="editStaffStatus">
                  <CustomSelect
                    id="editStaffStatus"
                    value={data.status || "Active"}
                    onChange={(val) =>
                      setData({
                        ...data,
                        status: val as "Active" | "Inactive",
                      })
                    }
                    options={[
                      { value: "Active", label: "Active (Current Batch)" },
                      { value: "Inactive", label: "Inactive / Past Servant" },
                    ]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program" htmlFor="editStaffProgram" required hint="Pick related program">
                  <CustomSelect
                    id="editStaffProgram"
                    value={
                      data.specialization?.includes("መሰረታዊ") || data.specialization?.includes("Basic")
                        ? "Basic በገና"
                        : data.specialization || (programs[0]?.name || "Basic በገና")
                    }
                    onChange={(val) =>
                      setData({ ...data, specialization: val })
                    }
                    options={
                      programOptions.some((o) => o.value === data.specialization)
                        ? programOptions
                        : data.specialization
                        ? [{ value: data.specialization, label: data.specialization }, ...programOptions]
                        : programOptions
                    }
                  />
                </Field>

                <Field label="Department / Background" htmlFor="editStaffDepartment">
                  <input
                    id="editStaffDepartment"
                    value={data.department || ""}
                    onChange={(e) =>
                      setData({ ...data, department: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="Phone Number" htmlFor="editStaffPhone">
                <input
                  id="editStaffPhone"
                  inputMode="tel"
                  value={data.phoneNumber || ""}
                  onChange={(e) =>
                    setData({ ...data, phoneNumber: e.target.value })
                  }
                />
              </Field>

              <Field
                label="New Password"
                htmlFor="editStaffPassword"
                hint="Leave empty to keep the current password."
              >
                <input
                  id="editStaffPassword"
                  type="password"
                  autoComplete="new-password"
                  value={data.password || ""}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                />
              </Field>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${staffToDelete?.fullName}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
      />
    </div>
  );
}
