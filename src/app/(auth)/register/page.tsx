"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui";
import { AuthShell, AuthCard, Field, AuthError } from "@/components/auth/AuthCard";
import { signUp, authMessage } from "@/lib/auth/cognito";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      router.push(`/confirm?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Create your account" subtitle="Track and sync your decomp progress.">
        <form onSubmit={onSubmit} className="space-y-3">
          <AuthError message={error} />
          <Field
            label="Name (optional)"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-2xs text-content-faint">
            At least 8 characters, with an upper- and lower-case letter and a number.
          </p>
          <Button type="submit" disabled={busy} className="w-full">
            {busy && <IconLoader2 size={15} className="animate-spin" />} Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-content-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent transition hover:text-accent-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
