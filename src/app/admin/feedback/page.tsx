"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconTrash,
  IconMail,
  IconMoodEmpty,
  IconX,
  IconCornerUpLeft,
  IconSend,
  IconCheck,
} from "@tabler/icons-react";
import {
  getFeedback,
  deleteFeedback,
  replyToFeedback,
  type FeedbackRow,
} from "@/lib/admin/feedback";
import type { Sentiment } from "@/lib/feedback";

const SENTIMENT_META: Record<Sentiment, { label: string; emoji: string; cls: string }> = {
  good: {
    label: "Good",
    emoji: "👍",
    cls: "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft",
  },
  confusing: { label: "Confusing", emoji: "😕", cls: "bg-warn/15 text-warn" },
  bug: { label: "Bug", emoji: "🐞", cls: "bg-bad/15 text-bad" },
};

function ago(iso?: string) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

type Filter = "all" | Sentiment;

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Transient errors from row actions (delete) — kept separate from the fatal
  // load `error` so a failed delete shows an inline, dismissible banner instead
  // of replacing the whole list with a (mislabeled) "failed to load" screen.
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getFeedback()
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const c = { good: 0, confusing: 0, bug: 0 };
    for (const r of rows ?? []) if (r.sentiment) c[r.sentiment] += 1;
    return c;
  }, [rows]);

  const shown = useMemo(
    () => (rows ?? []).filter((r) => filter === "all" || r.sentiment === filter),
    [rows, filter],
  );

  const remove = async (id: string) => {
    if (!window.confirm("Delete this feedback? This can't be undone.")) return;
    setDeleting(id);
    setActionError(null);
    try {
      await deleteFeedback(id);
      setRows((rs) => (rs ? rs.filter((r) => r.id !== id) : rs));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't delete that item.");
    } finally {
      setDeleting(null);
    }
  };

  // Patch the replied row in place so its "Replied" state survives filter changes.
  const onReplied = (id: string, repliedAt: string, replyMessage: string) =>
    setRows((rs) =>
      rs ? rs.map((r) => (r.id === id ? { ...r, repliedAt, replyMessage } : r)) : rs,
    );

  if (error) return <p className="text-red-400">Failed to load feedback: {error}</p>;
  if (!rows) return <p className="text-content-faint">Loading feedback…</p>;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: `All ${rows.length}` },
    { key: "good", label: `👍 ${counts.good}` },
    { key: "confusing", label: `😕 ${counts.confusing}` },
    { key: "bug", label: `🐞 ${counts.bug}` },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Feedback</h1>
          <p className="mt-1 text-sm text-content-secondary">
            {rows.length} submission{rows.length === 1 ? "" : "s"}, newest first.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-accent/10 text-accent"
                  : "text-content-secondary hover:bg-bg-softer hover:text-content-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-bad/30 bg-bad/[0.08] px-3.5 py-2.5 text-sm text-bad">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded p-1 text-bad/80 transition hover:bg-bad/10 hover:text-bad"
          >
            <IconX size={15} />
          </button>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-line bg-bg-soft/40 px-6 py-16 text-center text-content-faint">
          <IconMoodEmpty size={28} />
          <p className="text-sm">No feedback{filter === "all" ? " yet" : " in this filter"}.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <FeedbackCard
              key={r.id}
              row={r}
              deleting={deleting === r.id}
              onDelete={() => remove(r.id)}
              onReplied={onReplied}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedbackCard({
  row: r,
  deleting,
  onDelete,
  onReplied,
}: {
  row: FeedbackRow;
  deleting: boolean;
  onDelete: () => void;
  onReplied: (id: string, repliedAt: string, replyMessage: string) => void;
}) {
  const meta = r.sentiment ? SENTIMENT_META[r.sentiment] : null;
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    const message = draft.trim();
    if (!message) return;
    setSending(true);
    setErr(null);
    try {
      const { repliedAt, replyMessage } = await replyToFeedback(r.id, message);
      onReplied(r.id, repliedAt, replyMessage);
      setComposing(false);
      setDraft("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't send the reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <li className="rounded-lg border border-line bg-bg-soft/40 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {meta && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-semibold ${meta.cls}`}
              >
                {meta.emoji} {meta.label}
              </span>
            )}
            <span className="text-sm font-medium text-content-primary">{r.lesson}</span>
            {r.source && (
              <span className="rounded bg-bg-softer px-1.5 py-0.5 text-2xs text-content-faint">
                {r.source}
              </span>
            )}
            <span className="text-2xs text-content-faint">{ago(r.createdAt)}</span>
            {r.repliedAt && (
              <span className="inline-flex items-center gap-1 rounded-md bg-good/15 px-2 py-0.5 text-2xs font-semibold text-good theme-light:bg-good-soft/15 theme-light:text-good-soft">
                <IconCheck size={11} /> Replied {ago(r.repliedAt)}
              </span>
            )}
          </div>
          {r.message && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-content-secondary">{r.message}</p>
          )}

          {/* Contact + reply affordances */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {r.email ? (
              <>
                <a
                  href={`mailto:${r.email}`}
                  className="inline-flex items-center gap-1 text-2xs text-accent transition hover:underline"
                >
                  <IconMail size={12} /> {r.email}
                </a>
                {!composing && (
                  <button
                    onClick={() => {
                      setErr(null);
                      setComposing(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-2xs font-medium text-content-secondary transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                  >
                    <IconCornerUpLeft size={12} /> {r.repliedAt ? "Reply again" : "Reply"}
                  </button>
                )}
              </>
            ) : (
              <span className="text-2xs italic text-content-faint">
                Anonymous — no email to reply to
              </span>
            )}
          </div>

          {/* The reply we last sent (collapsed once a new compose starts) */}
          {r.replyMessage && !composing && (
            <div className="mt-2.5 rounded-md border border-line bg-bg-inset/50 px-3 py-2">
              <p className="text-2xs font-semibold uppercase tracking-wide text-content-faint">
                Your reply
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-content-secondary">
                {r.replyMessage}
              </p>
            </div>
          )}

          {/* Inline composer */}
          {composing && (
            <div className="mt-2.5">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
                  if (e.key === "Escape" && !sending) setComposing(false);
                }}
                rows={4}
                placeholder={`Write a reply to ${r.email}…`}
                disabled={sending}
                className="w-full resize-y rounded-md border border-line bg-bg-inset px-3 py-2 text-sm text-content-primary placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60"
              />
              {err && <p className="mt-1.5 text-xs text-bad">{err}</p>}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconSend size={13} /> {sending ? "Sending…" : "Send reply"}
                </button>
                <button
                  onClick={() => setComposing(false)}
                  disabled={sending}
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium text-content-secondary transition hover:bg-bg-softer hover:text-content-primary disabled:opacity-50"
                >
                  Cancel
                </button>
                <span className="ml-auto hidden text-2xs text-content-faint sm:block">
                  ⌘↵ to send · emails {r.email}
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete feedback"
          className="shrink-0 rounded-md p-1.5 text-content-faint transition hover:bg-bad/10 hover:text-bad disabled:opacity-50"
        >
          <IconTrash size={15} />
        </button>
      </div>
    </li>
  );
}
