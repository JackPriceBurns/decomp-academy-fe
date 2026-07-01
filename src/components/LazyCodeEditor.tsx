"use client";

import dynamic from "next/dynamic";
import { IconLoader2 } from "@tabler/icons-react";

export const LazyCodeEditor = dynamic(
  () => import("@/components/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-content-faint">
        <IconLoader2 className="mr-2 animate-spin" size={16} /> Loading editor…
      </div>
    ),
  },
);
