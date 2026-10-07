"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Panel } from "@/components/ui/page";
import { setToken, getValidToken } from "@/lib/auth";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getValidToken();
    if (token) {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!fullName || !password) {
      toast.error("Please enter both Full Name and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { fullName, password });
      setToken(res.data.token);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-primary mb-8 block text-center text-lg font-bold tracking-wide"
        >
          በገና
        </Link>

        <Panel className="p-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to manage students, payments and schedules.
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <Field label="Full Name" htmlFor="fullName">
              <input
                id="fullName"
                autoComplete="username"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field label="Password" htmlFor="password">
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
        </Panel>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
