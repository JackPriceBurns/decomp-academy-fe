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
import { confirmRegistration, resendCode, authMessage } from "@/lib/auth/cognito";

function ConfirmForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await confirmRegistration(email.trim(), code.trim());
      router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  }

  async function onResend() {
    setError(null);
    setNotice(null);
    try {
      await resendCode(email.trim());
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(authMessage(err));
    }
  }

  return (
    <AuthCard title="Verify your email" subtitle="Enter the 6-digit code we just emailed you.">
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthError message={error} />
        {notice && (
          <div className="mb-3 rounded-lg border border-good/25 theme-light:border-good-soft/25 bg-good/[0.08] theme-light:bg-good-soft/[0.08] px-3 py-2 text-xs text-good theme-light:text-good-soft">
            {notice}
          </div>
        )}
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy && <IconLoader2 size={15} className="animate-spin" />} Confirm account
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          onClick={onResend}
          className="text-accent transition hover:text-accent-hover hover:underline"
        >
          Resend code
        </button>
        <Link href="/login" className="text-content-muted transition hover:text-content">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ConfirmPage() {
  return (
    <AuthShell>
      <Suspense>
        <ConfirmForm />
      </Suspense>
    </AuthShell>
  );
}
