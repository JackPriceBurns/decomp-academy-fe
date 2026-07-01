"use client";

import { createContext } from "react";
import type { InsnDoc } from "./glossary";

export interface InsnTipState {
  x: number;
  y: number;
  doc: InsnDoc;
  description: string;
}

export const InsnTipContext = createContext<{
  show: (mnemonic: string, operands: string[], x: number, y: number) => void;
  hide: () => void;
} | null>(null);
