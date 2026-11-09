"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { Program } from "@/types";
import toast from "react-hot-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

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

interface ParsedStaffRow {
  fullName: string;
  phoneNumber?: string;
  department?: string;
  role?: string;
  error?: string;
}

function parseStaffCSV(text: string, defaultRole: string): ParsedStaffRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

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

  const nameIdx = findIndex(["fullname", "full name", "name", "ስም", "መምህር"]);
  const phoneIdx = findIndex(["phonenumber", "phone number", "phone", "phoneno", "phone no", "ስልክ", "ቴሌፎን"]);
  const deptIdx = findIndex(["department", "dept", "ክፍል"]);
  const roleIdx = findIndex(["role", "ድርሻ", "ደረጃ"]);

  const rows: ParsedStaffRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    const fullName = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx].replace(/['"]/g, "").trim() : "";
    const phoneNumber = phoneIdx >= 0 && cols[phoneIdx] ? cols[phoneIdx].replace(/['"]/g, "").trim() : "";
    const department = deptIdx >= 0 && cols[deptIdx] ? cols[deptIdx].replace(/['"]/g, "").trim() : "General";
    const rawRole = roleIdx >= 0 && cols[roleIdx] ? cols[roleIdx].replace(/['"]/g, "").trim().toLowerCase() : defaultRole;

    if (!fullName) continue;

    const assignedRole = ["admin", "teacher"].includes(rawRole) ? rawRole : defaultRole;

    rows.push({
      fullName,
      phoneNumber,
      department: department || "General",
      role: assignedRole,
    });
  }

  return rows;
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

  // CSV Bulk Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importProgram, setImportProgram] = useState("Basic በገና");
  const [importRole, setImportRole] = useState("teacher");
  const [importFileName, setImportFileName] = useState("");
  const [importFileText, setImportFileText] = useState("");
  const [parsedStaff, setParsedStaff] = useState<ParsedStaffRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (importFileText) {
      const parsed = parseStaffCSV(importFileText, importRole);
      setParsedStaff(parsed);
    } else {
      setParsedStaff([]);
    }
  }, [importFileText, importRole]);

  const handleDownloadTemplate = () => {
    const csvContent =
      "Full Name,Phone Number,Department,Role\n" +
      "Alemayehu Tadesse,0911223344,Music,teacher\n" +
      "Marta Bekele,0922334455,Theology,teacher\n" +
      "Yosef Hailu,0933445566,Administration,admin\n";

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "teachers_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = async () => {
    if (parsedStaff.length === 0) {
      toast.error("ምንም የሚገባ መምህር አልተገኘም");
      return;
    }
    setIsImporting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        staff: parsedStaff.map((p) => ({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          department: p.department,
          role: p.role || importRole,
        })),
        program: importProgram,
        role: importRole,
      };
      const res = await api.post("/users/bulk", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || "መምህራን በተሳካ ሁኔታ ተመዝግበዋል");
      fetchStaff();
      setImportModalOpen(false);
      setImportFileName("");
      setImportFileText("");
      setParsedStaff([]);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "መምህራንን ማስገባት አልተቻለም");
    } finally {
      setIsImporting(false);
    }
  };

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
        title="መምህራን እና ሠራተኞች"
        description="የአስተዳዳሪዎችና የመምህራን ዝርዝር"
        action={
          <div className="flex flex-wrap items-center gap-2">
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
              <span>ፋይል አስገባ (Import CSV)</span>
            </button>

            <ModalForm
              title="አዲስ መምህር / ሠራተኛ መዝግብ"
              triggerText="አዲስ መምህር / ሠራተኛ"
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
        </div>
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

      {/* CSV Bulk Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="መምህራንን በ CSV ፋይል ማስገቢያ"
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <p className="text-sm font-medium text-foreground">
                የመምህራን ዝርዝር የያዘ CSV ፋይል ይምረጡ
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                የመምህሩ ሙሉ ስም፣ ስልክ ቁጥር እና ክፍል (Full Name, Phone Number, Department)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="border-white/10 hover:border-primary/40 text-xs shrink-0 gap-1.5"
            >
              <Download size={13} className="text-primary" />
              <span>የናሙና CSV አውርድ</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="የሚመደቡበት ፕሮግራም" htmlFor="importStaffProgram" required>
              <CustomSelect
                id="importStaffProgram"
                value={importProgram}
                onChange={(val) => setImportProgram(val)}
                options={programOptions}
              />
            </Field>

            <Field label="የተጠቃሚ ድርሻ" htmlFor="importStaffRole" required>
              <CustomSelect
                id="importStaffRole"
                value={importRole}
                onChange={(val) => setImportRole(val)}
                options={[
                  { value: "teacher", label: "Teacher / Instructor (መምህር)" },
                  { value: "admin", label: "Admin & Instructor (አስተዳዳሪ)" },
                ]}
              />
            </Field>
          </div>

          {/* File input box */}
          <div className="rounded-xl border-2 border-dashed border-white/15 p-6 text-center hover:border-primary/50 transition">
            <input
              type="file"
              id="staffCsvUpload"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImportFileName(file.name);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    setImportFileText(text || "");
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <label
              htmlFor="staffCsvUpload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <FileSpreadsheet size={22} />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {importFileName ? importFileName : "CSV ፋይል እዚህ ይምረጡ ወይም ይጎትቱ"}
              </span>
              <span className="text-xs text-muted-foreground">
                .csv ወይም .txt ፋይል ብቻ
              </span>
            </label>
          </div>

          {/* Parsed Preview Table */}
          {parsedStaff.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
                <span>ቅድመ-ዕይታ</span>
                <span className="text-emerald-400 font-semibold">
                  {parsedStaff.length} መምህራን ተለይተዋል
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-background/50 divide-y divide-white/5">
                {parsedStaff.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{p.fullName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {p.phoneNumber || "No phone"} · {p.department || "General"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {p.role || importRole}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setImportModalOpen(false);
                setImportFileName("");
                setImportFileText("");
                setParsedStaff([]);
              }}
              disabled={isImporting}
            >
              ሰርዝ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExecuteImport}
              disabled={isImporting || parsedStaff.length === 0}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isImporting
                ? "በማስገባት ላይ..."
                : `መምህራንን አስገባ (${parsedStaff.length})`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
