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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Students</CardTitle>
                <CardDescription>Manage student information</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/students">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    View Students
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Sections</CardTitle>
                <CardDescription>Manage sections and teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/sections">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    View Sections
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Payments</CardTitle>
                <CardDescription>View and manage payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/payments">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    View Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">Announcements</CardTitle>
                <CardDescription>Manage announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/announcements">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    View Announcements
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-amber-950 hover:border-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-400">
                  Class Schedules
                </CardTitle>
                <CardDescription>Manage class schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/schedules">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    View Schedules
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
