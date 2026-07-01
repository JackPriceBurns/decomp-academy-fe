"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/auth/Field";
import { AuthError } from "@/components/auth/AuthError";
import { login, authMessage } from "@/lib/auth/cognito";
import { useAuth } from "@/lib/auth/AuthContext";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      await refresh();
      router.push(next);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "UserNotConfirmedException") {
        router.push(`/confirm?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      setError(authMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to sync your progress.">
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthError message={error} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-accent transition hover:text-accent-hover hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy && <IconLoader2 size={15} className="animate-spin" />} Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-content-muted">
        New here?{" "}
        <Link
          href="/register"
          className="text-accent transition hover:text-accent-hover hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
