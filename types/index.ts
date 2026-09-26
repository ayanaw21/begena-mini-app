export interface Admin {
	id: string;
	fullName: string;
	role: "admin" | "teacher";
	phoneNumber?: string;
}

export interface Program {
	_id?: string;
	name: string;
	code: string;
	description?: string;
	isActive?: boolean;
}

export interface Student {
	_id?: string;
	fullName: string;
	studentId?: string;
	begenaId: string;
	program?: string;
	batch: string;
	section: string;
	department: string;
	phoneNumber: string;
	registrationYear?: number;
	academicStatus?: "Active" | "Graduated" | "Suspended" | "Warning";
}

export interface StudentState {
	students: Student[];
	loading?: boolean;
	error?: string | null;
	fetchStudents: () => Promise<void>;
	createStudent?: (studentData: Omit<Student, "_id">) => Promise<void>;
	updateStudent?: (
		id: string,
		studentData: Omit<Student, "_id">
	) => Promise<void>;
	deleteStudent?: (id: string) => Promise<void>;
	getStudentById?: (id: string) => Student | undefined;
	getUniqueSections?: () => string[];
	getStudentsBySection?: (section: string) => Student[];
}

export interface Section {
	_id?: string;
	section: string;
	program?: string;
	mainTeacher?: string;
	mainTeacherName?: string;
	assistantTeacher?: string;
	assistantTeacherName?: string;
	assignedTeacher?: string;
	capacity?: number;
	classDate?: string;
	classTime?: string;
}

export interface ScheduleSession {
	day: string;
	startTime: string;
	endTime: string;
	room?: string;
}

export interface ClassSchedule {
	_id?: string;
	program?: string;
	type?: string;
	section: string;
	sessions?: ScheduleSession[];
	date?: string;
	time?: string;
}

export interface Payment {
	_id?: string;
	fullName: string;
	studentId?: string;
	begenaId: string;
	program?: string;
	section: string;
	batch: string;
	month: string;
	year?: string;
	screenshot: string;
	status?: "Pending" | "Approved" | "Rejected";
	adminNotes?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Announcement {
	_id?: string;
	title: string;
	body: string;
	date: string;
	time: string;
}

export interface AttendanceSummaryItem {
	studentIdObj: string;
	studentId: string;
	fullName: string;
	program: string;
	section: string;
	academicStatus: "Active" | "Graduated" | "Suspended" | "Warning";
	totalSessions: number;
	presentCount: number;
	absentCount: number;
	permissionCount: number;
	attendanceRate: number;
	riskLevel: string;
}
