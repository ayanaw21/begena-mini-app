"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import PhotoPanel from "@/components/ui/photo-panel";
import { Field } from "@/components/ui/page";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      router.replace("/student/dashboard");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!studentId || !password) {
      toast.error("Please enter both Student ID and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/student/login", { studentId, password });
      if (res.data.token) {
        localStorage.setItem("studentToken", res.data.token);
        if (res.data.student) {
          localStorage.setItem("studentData", JSON.stringify(res.data.student));
        }
        toast.success("Welcome to your Student Portal!");
        router.push("/student/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Login failed. Check your ID and password.");
      } else {
        toast.error("Login failed. Check your Student ID and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-primary mb-8 block text-center text-lg font-bold tracking-wide"
        >
          በገና
        </Link>

        <PhotoPanel src={siteImages.authPanel} sizes="(max-width: 640px) 100vw, 420px" priority>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">🎓 የተማሪዎች ፖርታል</h1>
            <p className="text-muted-foreground text-sm">
              የክፍያ ታሪክዎን፣ የትምህርት ክፍለ-ጊዜዎን እና የክትትል ሁኔታዎን ይመልከቱ።
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <Field
              label="Student ID (ተማሪ መለያ)"
              htmlFor="studentId"
            >
              <input
                id="studentId"
                autoComplete="username"
                placeholder="BG-2026-001"
                className="font-mono uppercase"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field
              label="Password (የይለፍ ቃል)"
              htmlFor="password"
              hint="የመጀመሪያ ይለፍ ቃልዎ የስልክ ቁጥርዎ ነው።"
            >
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </PhotoPanel>

        <div className="text-muted-foreground mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to home
          </Link>
          <Link href="/payment" className="hover:text-primary transition-colors">
            Submit payment proof →
          </Link>
        </div>
      </div>
    </div>
  );
}
