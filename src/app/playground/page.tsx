import type { Metadata } from "next";
import { PlaygroundWorkspace } from "@/components/playground/PlaygroundWorkspace";

export const metadata: Metadata = {
  title: "Playground · Decomp Academy",
  description:
    "Type C and watch the real Metrowerks CodeWarrior GC/2.0 compiler turn it into GameCube PowerPC assembly.",
};

export default function PlaygroundPage() {
  return <PlaygroundWorkspace />;
}
