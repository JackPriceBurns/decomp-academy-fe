"use client";

import { useContext } from "react";
import type { Seg } from "@/lib/objdiff/client";
import { InsnTipContext } from "./context";
import { instructionOperands } from "./glossary";

const ROT = [
  "text-rot-0",
  "text-rot-1",
  "text-rot-2",
  "text-rot-3",
  "text-rot-4",
  "text-rot-5",
  "text-rot-6",
  "text-rot-7",
];

function tokClass(tok: string): string {
  switch (tok) {
    case "mnemonic":
      return "text-syntax-mnemonic";
    case "num":
      return "text-syntax-num";
    case "symbol":
      return "text-syntax-str";
    case "branch":
      return "text-syntax-reg";
    case "addr":
      return "text-content-ghost";
    default:
      return "text-content";
  }
}

function segClass(s: Seg): string {
  switch (s.color) {
    case "replace":
      return "rounded-[3px] bg-warn/20 text-warn ring-1 ring-warn/30 theme-light:bg-warn/[0.15] theme-light:text-content-bright theme-light:ring-warn/50";
    case "delete":
      return "text-bad";
    case "insert":
      return "text-accent";
    case "dim":
      return "text-content-faint";
    case "data-flow":
      return "text-syntax-num/80";
    case "rotating":
      return ROT[(s.rot ?? 0) % ROT.length];
    default:
      return tokClass(s.tok);
  }
}

type Props = { segs: Seg[] | null };

export function AsmDiffLine({ segs }: Props) {
  const tip = useContext(InsnTipContext);
  if (!segs) return <span className="select-none text-line-strong">·</span>;
  const mnemonic = segs.find((s) => s.tok === "mnemonic")?.text.trim();
  const hover =
    mnemonic && tip
      ? {
          onMouseEnter: (e: { clientX: number; clientY: number }) =>
            tip.show(mnemonic, instructionOperands(segs), e.clientX, e.clientY),
          onMouseMove: (e: { clientX: number; clientY: number }) =>
            tip.show(mnemonic, instructionOperands(segs), e.clientX, e.clientY),
          onMouseLeave: tip.hide,
        }
      : undefined;

  return (
    <span className={mnemonic ? "cursor-help whitespace-pre" : "whitespace-pre"} {...hover}>
      {segs.map((s, i) => (
        <span key={i} className={segClass(s)}>
          {s.text}
        </span>
      ))}
    </span>
  );
}
