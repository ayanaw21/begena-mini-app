export interface Admin {
  id: string;
  fullName: string;
  role: "admin";
}

export interface Student {
  _id?: string;
  fullName: string;
  begenaId: string;
  batch: string;
  section: string;
  department: string;
  phoneNumber: string;
}

export interface Section {
  _id?: string;
  section: string;
  assignedTeacher: string;
  classDate: string; // YYYY-MM-DD
  classTime: string; // HH:MM AM/PM
}

export interface Payment {
  _id?: string;
  fullName: string;
  section: string;
  screenshot: string;
  month: string;
  begenaId: string;
  batch: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  _id?: string;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
}

export interface ClassSchedule {
  _id?: string;
  type: string; 
  section: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
}
