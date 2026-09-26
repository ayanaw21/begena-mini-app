"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminHome() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error("You must login first");
      router.push("/admin/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-amber-400">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <main className="p-6">
          <h1 className="text-2xl font-bold text-amber-400 mb-6">Admin Control Panel</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Programs</CardTitle>
                <CardDescription>Manage Begena, Masinko, Kirar & instruments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/programs">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Programs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Students</CardTitle>
                <CardDescription>In-person registration & student ID records</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/students">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Students
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Sections & Teachers</CardTitle>
                <CardDescription>Main & Assistant teacher assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/sections">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Sections
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Staff & Instructors</CardTitle>
                <CardDescription>Manage admins, main & assistant staff</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/staff">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Staff
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Payments</CardTitle>
                <CardDescription>Verify slips, Approve / Reject</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/payments">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Attendance Sheet</CardTitle>
                <CardDescription>Track Present, Absent & Risk Decision Center</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/attendance">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Track Attendance
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Class Schedules</CardTitle>
                <CardDescription>Flexible 1x, 2x, Nx weekly timetables</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/schedules">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Schedules
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Announcements</CardTitle>
                <CardDescription>Broadcast notices to students</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/announcements">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full">
                    Manage Announcements
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
