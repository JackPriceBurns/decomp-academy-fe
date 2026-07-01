export type Status = "idle" | "running" | "ok" | "compileError" | "error";
export type Tab = "asm" | "console";
export type ScratchState =
  | { state: "idle" }
  | { state: "creating" }
  | { state: "done"; url: string }
  | { state: "error"; message: string };
