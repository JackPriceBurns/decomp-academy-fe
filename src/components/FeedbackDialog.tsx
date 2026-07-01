"use client";

import { useEffect, useState } from "react";
import { IconX, IconSend, IconLoader2, IconCircleCheckFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cx } from "@/components/ui/cx";
import { useAuth } from "@/lib/auth/AuthContext";
import { submitFeedback, type FeedbackSource, type Sentiment } from "@/lib/feedback";

const SENTIMENTS: { key: Sentiment; label: string; emoji: string }[] = [
  { key: "good", label: "Good", emoji: "👍" },
  { key: "confusing", label: "Confusing", emoji: "😕" },
  { key: "bug", label: "Bug", emoji: "🐞" },
];

export function FeedbackDialog({
  open,
  onClose,
  source,
  course,
  lessonId,
  lessonTitle,
  heading = "Send feedback",
  subheading,
}: {
  open: boolean;
  onClose: () => void;
  source: FeedbackSource;
  course?: string;
  lessonId?: string;
  lessonTitle?: string;
  heading?: string;
  subheading?: string;
}) {
  const { status, user } = useAuth();
  const signedIn = status === "authed" && !!user;

  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Reset whenever the dialog (re)opens, so a reused instance starts clean.
  useEffect(() => {
    if (open) {
      setSentiment(null);
      setMessage("");
      setEmail("");
      setState("idle");
      setError(null);
    }
  }, [open]);

  // Close shortly after a successful submit so the "thanks" lands but doesn't linger.
  useEffect(() => {
    if (state !== "done") return;
    const t = setTimeout(onClose, 1600);
    return () => clearTimeout(t);
  }, [state, onClose]);

  if (!open) return null;

  const prompt = source === "lesson" ? "How's this lesson?" : "How's the course working for you?";
  const placeholder =
    source === "lesson"
      ? "Anything confusing, broken, or missing here? (optional)"
      : "Anything you'd change, or that's working well? (optional)";

  const canSubmit = (sentiment !== null || message.trim().length > 0) && state !== "sending";

  const submit = async () => {
    if (!canSubmit) return;
    setState("sending");
    setError(null);
    try {
      await submitFeedback({
        source,
        course,
        lessonId,
        lessonTitle,
        sentiment: sentiment ?? undefined,
        message,
        email: signedIn ? user!.email : email,
      });
      setState("done");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Couldn't send your feedback.");
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="feedback-title">
      {state === "done" ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <IconCircleCheckFilled size={44} className="text-good theme-light:text-good-soft" />
          <h2 className="text-lg font-bold text-content-bright">Thanks for the feedback!</h2>
          <p className="text-sm text-content-muted">
            It goes straight to the team — we read every note.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-start justify-between gap-3">
            <h2 id="feedback-title" className="text-lg font-bold text-content-bright">
              {heading}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1.5 -mt-1.5 rounded-md p-1.5 text-content-faint transition hover:bg-bg-softer hover:text-content-primary"
            >
              <IconX size={18} />
            </button>
          </div>

          {subheading ? (
            <p className="mb-4 text-sm text-content-muted">{subheading}</p>
          ) : source === "lesson" && lessonTitle ? (
            <p className="mb-4 text-sm text-content-muted">
              On <span className="text-content-secondary">{lessonTitle}</span>
            </p>
          ) : (
            <div className="mb-4" />
          )}

          <p className="mb-2 text-sm font-medium text-content-secondary">{prompt}</p>
          <div className="grid grid-cols-3 gap-2">
            {SENTIMENTS.map((s) => {
              const active = sentiment === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSentiment(active ? null : s.key)}
                  aria-pressed={active}
                  className={cx(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition",
                    active
                      ? "border-accent bg-accent/10 text-content-primary"
                      : "border-line bg-bg-inset text-content-muted hover:border-line-strong hover:text-content-secondary",
                  )}
                >
                  <span className="text-xl leading-none">{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder={placeholder}
            className="mt-3 w-full resize-none rounded-lg border border-line bg-bg-inset px-3 py-2.5 text-sm text-content-primary placeholder:text-content-faint focus:border-accent focus:outline-none"
          />

          {!signedIn && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional — only if you'd like a reply)"
              className="mt-2 w-full rounded-lg border border-line bg-bg-inset px-3 py-2.5 text-sm text-content-primary placeholder:text-content-faint focus:border-accent focus:outline-none"
            />
          )}

          {error && <p className="mt-3 text-sm text-bad">{error}</p>}

          <Button onClick={submit} disabled={!canSubmit} className="mt-4 w-full">
            {state === "sending" ? (
              <>
                <IconLoader2 size={15} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                <IconSend size={15} /> Send feedback
              </>
            )}
          </Button>
        </>
      )}
    </Modal>
  );
}
