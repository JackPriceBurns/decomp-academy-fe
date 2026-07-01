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
import { forgotPassword, confirmPassword, authMessage } from "@/lib/auth/cognito";

function ForgotForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setStage("reset");
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await confirmPassword(email.trim(), code.trim(), password);
      router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  }

  if (stage === "reset") {
    return (
      <AuthCard
        title="Set a new password"
        subtitle="Enter the code we emailed you and choose a new password."
      >
        <form onSubmit={onReset} className="space-y-3">
          <AuthError message={error} />
          <Field
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Field
            label="New password"
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
            {busy && <IconLoader2 size={15} className="animate-spin" />} Reset password
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a code to reset it.">
      <form onSubmit={onRequest} className="space-y-3">
        <AuthError message={error} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy && <IconLoader2 size={15} className="animate-spin" />} Send reset code
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-content-muted">
        <Link
          href="/login"
          className="text-accent transition hover:text-accent-hover hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Suspense>
        <ForgotForm />
      </Suspense>
    </AuthShell>
  );
}
