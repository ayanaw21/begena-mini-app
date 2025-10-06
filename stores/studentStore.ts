import { create } from "zustand";
import api from "@/lib/api";
import toast from "react-hot-toast";

import { Student, StudentState } from "@/types";

const useStudentStore = create<StudentState>((set, get) => ({
	students: [],
	loading: false,
	error: null,

	fetchStudents: async () => {
		set({ loading: true, error: null });
		try {
			const res = await api.get<{ students: Student[] }>("/students",{
				 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			set({ students: res.data.students, loading: false });
		} catch (err) {
			console.log(err);
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to Fetch students";
			set({ error: errorMessage, loading: false });
		}
	},

	getUniqueSections: () => {
		return Array.from(new Set(get().students.map((s) => s.section)));
	},
	getStudentsBySection: (section: string) => {
		return get().students.filter((student) => student.section === section);
	},
}));

export default useStudentStore;
