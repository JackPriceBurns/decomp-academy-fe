"use client";

import { useEffect, useState } from "react";
import { getLessonStats, type LessonStatRow } from "@/lib/admin/stats";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function ago(iso?: string) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function rateColor(rate: number, attempts: number) {
  if (attempts === 0) return "text-content-faint";
  if (rate >= 0.5) return "text-red-400";
  if (rate >= 0.25) return "text-amber-400";
  return "text-content-secondary";
}

export default function AdminStatsPage() {
  const [rows, setRows] = useState<LessonStatRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessonStats()
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400">Failed to load stats: {error}</p>;
  if (!rows) return <p className="text-content-faint">Loading stats…</p>;

  const totalAttempts = rows.reduce((s, r) => s + r.attempts, 0);
  const totalFailures = rows.reduce((s, r) => s + r.failures, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Lesson compile stats</h1>
        <p className="mt-1 text-sm text-content-secondary">
          {rows.length} lessons · {totalAttempts.toLocaleString()} attempts ·{" "}
          {totalFailures.toLocaleString()} failures
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-2xs uppercase tracking-wide text-content-faint">
            <tr>
              <th className="px-4 py-2.5 font-medium">Lesson</th>
              <th className="px-4 py-2.5 text-right font-medium">Attempts</th>
              <th className="px-4 py-2.5 text-right font-medium">Failures</th>
              <th className="px-4 py-2.5 text-right font-medium">Fail rate</th>
              <th className="px-4 py-2.5 text-right font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.progressId} className="border-t border-line">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-content-primary">{r.title}</div>
                  <div className="text-2xs text-content-faint">{r.chapter}</div>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-content-secondary">
                  {r.attempts.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-content-secondary">
                  {r.failures.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-medium ${rateColor(
                    r.failRate,
                    r.attempts,
                  )}`}
                >
                  {r.attempts === 0 ? "—" : pct(r.failRate)}
                </td>
                <td className="px-4 py-2.5 text-right text-content-faint">{ago(r.lastAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
