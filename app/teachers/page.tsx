"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import Figure from "@/components/ui/figure";
import { siteImages, adminCardBackgrounds } from "@/lib/images";
import { PageBody, PageContainer, PageHeader, Panel } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Phone, GraduationCap, Music, Building2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export interface Teacher {
  _id?: string;
  fullName: string;
  role: "teacher" | "admin";
  phoneNumber?: string;
  department?: string;
  specialization?: string;
  status?: "Active" | "Inactive";
}

// Default fallback list in case backend is loading or offline
const defaultTeachers: Teacher[] = [
  {
    _id: "t1",
    fullName: "Teacher Solomon",
    role: "teacher",
    phoneNumber: "0911000001",
    department: "የበገና ንዑስ ክፍል (Begena Department)",
    specialization: "በገና ድርደራና ቅኝት (Begena Tuning & Playing)",
    status: "Active",
  },
  {
    _id: "t2",
    fullName: "Teacher Martha",
    role: "teacher",
    phoneNumber: "0911000002",
    department: "የበገና ንዑስ ክፍል (Begena Department)",
    specialization: "የበገና ዜማና መሰረታዊ ስልጠና (Begena Chants & Basic Training)",
    status: "Active",
  },
  {
    _id: "t3",
    fullName: "Teacher Ephrem",
    role: "teacher",
    phoneNumber: "0911000003",
    department: "የበገና ንዑስ ክፍል (Begena Department)",
    specialization: "የበገና ታሪክ፣ ቅኝቶችና ዜማ (Begena History, Scales & Melody)",
    status: "Active",
  },
  {
    _id: "t4",
    fullName: "መምህር ዮሐንስ አየለ (Teacher Yohannes)",
    role: "teacher",
    phoneNumber: "0911456780",
    department: "የበገና ንዑስ ክፍል",
    specialization: "አድቫንስድ የበገና ድርደራ (Advanced Begena Course)",
    status: "Active",
  },
  {
    _id: "t5",
    fullName: "ዲያቆን ያረጋል አበራ (Deacon Yaregal)",
    role: "teacher",
    phoneNumber: "0911567891",
    department: "የዜማና መንፈሳዊ ትምህርት ክፍል",
    specialization: "የዜማ ምልክቶችና የበገና ስርዓት (Begena Liturgical Practice)",
    status: "Active",
  },
  {
    _id: "t6",
    fullName: "መምህርት ሰላማዊት ታደሰ (Teacher Selamawit)",
    role: "teacher",
    phoneNumber: "0911678902",
    department: "የበገና ንዑስ ክፍል",
    specialization: "የጀማሪዎች የበገና ስልጠና (Beginners Begena Training)",
    status: "Active",
  },
  {
    _id: "t7",
    fullName: "መምህር ዳዊት ተመስገን (Teacher Dawit)",
    role: "teacher",
    phoneNumber: "0911789013",
    department: "የመሰንቆና ክራር ንዑስ ክፍል",
    specialization: "መሰንቆ ስልጠና (Traditional Masinko Training)",
    status: "Active",
  },
  {
    _id: "t8",
    fullName: "መምህር በረከት ግርማ (Teacher Bereket)",
    role: "teacher",
    phoneNumber: "0911890124",
    department: "የመሰንቆና ክራር ንዑስ ክፍል",
    specialization: "ክራር ስልጠና (Traditional Kirar Training)",
    status: "Active",
  },
  {
    _id: "t9",
    fullName: "መጋቤ ስብሐት አለሙ አጋ (Master Alemu Aga)",
    role: "teacher",
    phoneNumber: "0911000005",
    department: "የበገና ንዑስ ክፍል (ክብር መምህር)",
    specialization: "ጥንታዊ የበገና ድርደራና ትውፊት (Master of Begena)",
    status: "Active",
  },
  {
    _id: "t10",
    fullName: "Admin",
    role: "admin",
    phoneNumber: "0911000000",
    department: "የበገና ንዑስ ክፍል አስተዳደር",
    specialization: "አጠቃላይ አስተባባሪ (General Coordinator)",
    status: "Active",
  },
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(defaultTeachers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        // Try public endpoint first, or fallback to staff if authorized
        const res = await api.get("/users/teachers").catch(() =>
          api.get("/users/staff", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        );
        const fetched = res.data?.teachers || res.data?.staff;
        if (fetched && Array.isArray(fetched) && fetched.length > 0) {
          setTeachers(fetched);
        }
      } catch (err) {
        console.warn("Using offline teacher seed list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filterCategories = [
    { id: "All", label: "ሁሉም መምህራን (All)" },
    { id: "Begena", label: "በገና (Begena)" },
    { id: "Masinko", label: "መሰንቆ (Masinko)" },
    { id: "Kirar", label: "ክራር (Kirar)" },
    { id: "Admin", label: "አስተዳደር (Admin)" },
  ];

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      // Filter by category
      if (selectedFilter === "Begena") {
        const text = `${t.specialization || ""} ${t.department || ""}`.toLowerCase();
        if (!text.includes("begena") && !text.includes("በገና")) return false;
      } else if (selectedFilter === "Masinko") {
        const text = `${t.specialization || ""} ${t.department || ""}`.toLowerCase();
        if (!text.includes("masinko") && !text.includes("መሰንቆ")) return false;
      } else if (selectedFilter === "Kirar") {
        const text = `${t.specialization || ""} ${t.department || ""}`.toLowerCase();
        if (!text.includes("kirar") && !text.includes("ክራር")) return false;
      } else if (selectedFilter === "Admin") {
        if (t.role !== "admin") return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${t.fullName} ${t.specialization || ""} ${t.department || ""} ${t.phoneNumber || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [teachers, selectedFilter, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <PageBody>
        <PageContainer className="space-y-8">
          {/* Hero Banner */}
          <Figure
            src={siteImages.adminTeacher}
            alt="የበገና ንዑስ ክፍል መምህራን"
            ratio="ultrawide"
            priority
            scrim
          >
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              የግቢ ጉባኤ የበገና ንዑስ ክፍል
            </p>
            <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
              የመምህራን እና አሰልጣኞች ዝርዝር
            </h1>
          </Figure>

          <PageHeader
            title="የንዑስ ክፍሉ መምህራን"
            description="በግቢ ጉባኤው የበገና፣ የመሰንቆና የክራር ማሰልጠኛ መድረክ የሚያገለግሉ መምህራን እና አሰልጣኞች ዝርዝር።"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/schedule">የትምህርት ሰዓት ይመልከቱ</Link>
              </Button>
            }
          />

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በመምህሩ ስም፣ በመሳሪያ ወይም በክፍል ይፈልጉ..."
                className="bg-surface focus:border-primary focus:ring-primary/20 w-full rounded-xl border border-white/10 py-2.5 pl-10 pr-24 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="bg-surface-hover absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs text-neutral-300 hover:text-white"
                >
                  አጽዳ
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedFilter === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teachers Cards Grid */}
          {loading && teachers.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={24} className="text-primary mb-3 animate-spin" />
              <p className="text-sm">የመምህራን መረጃ በመጫን ላይ...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <Panel className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-white">ምንም መምህር አልተገኘም</p>
              <p className="text-muted-foreground text-xs">
                እባክዎ የፍለጋ ቃሉን ቀይረው እንደገና ይሞክሩ።
              </p>
            </Panel>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher, idx) => {
                const bgImage = adminCardBackgrounds[idx % adminCardBackgrounds.length];
                const isMainCoordinator = teacher.role === "admin";

                return (
                  <div
                    key={teacher._id || teacher.fullName}
                    className="group bg-surface relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 p-5 transition-all duration-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-950/20"
                  >
                    {/* Top Row: Avatar & Badges */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Avatar */}
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 text-amber-300 font-bold text-xl shadow-inner">
                          {teacher.fullName.includes("(")
                            ? teacher.fullName.charAt(0)
                            : teacher.fullName.replace("Teacher ", "").charAt(0)}
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white ring-2 ring-[#101e36]">
                            ✓
                          </span>
                        </div>

                        {/* Status & Role Badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge tone={isMainCoordinator ? "primary" : "info"}>
                            {isMainCoordinator ? "አስተዳዳሪ (Admin)" : "አስተማሪ (Instructor)"}
                          </Badge>
                          <Badge tone="success">
                            {teacher.status || "Active"}
                          </Badge>
                        </div>
                      </div>

                      {/* Name & Specialization */}
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                          {teacher.fullName}
                        </h3>
                        <p className="text-primary text-xs font-medium mt-0.5 flex items-center gap-1.5">
                          <Music className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span>{teacher.specialization || "በገና (Begena)"}</span>
                        </p>
                      </div>

                      {/* Details list */}
                      <div className="space-y-2 border-t border-white/5 pt-3 text-xs">
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                          <span className="text-neutral-400 truncate">ክፍል:</span>
                          <span className="text-white truncate font-medium">
                            {teacher.department || "የበገና ንዑስ ክፍል"}
                          </span>
                        </div>

                        {teacher.phoneNumber && (
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                            <span className="text-neutral-400">ስልክ:</span>
                            <a
                              href={`tel:${teacher.phoneNumber}`}
                              className="text-amber-300/90 hover:text-amber-200 font-mono"
                            >
                              {teacher.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer link to schedule */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">የትምህርት ክፍለ-ጊዜ</span>
                      <Link
                        href="/schedule"
                        className="text-primary hover:text-primary-hover font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        መርሐ-ግብር ይመልከቱ →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Footer />
    </div>
  );
}
