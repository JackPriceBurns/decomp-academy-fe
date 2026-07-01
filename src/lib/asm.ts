// Shape of a single PowerPC instruction as returned by the compile API's
// /target endpoint. The API parses and normalizes objdump output server-side;
// the frontend renders the target listing and diffs the object files via
// objdiff (see lib/objdiff), so it only needs this type.

// Names the instruction-set glossary + mnemonic-matching rules a diff renders —
// NOT the platform or grader. Each value is the disassembly arch (matching
// objdiff's arch ids, since it's objdiff's printing the glossary must align with),
// narrowed to an "<arch>:<encoding>" form only when one arch prints more than one
// mnemonic set:
//   - "ppc"       PowerPC (GameCube / Gekko)
//   - "arm:thumb" ARMv4T Thumb (Game Boy Advance)
// A MIPS track would add "mips"; ARM's 32-bit encoding would add "arm:a32".
export type AsmDialect = "ppc" | "arm:thumb";

export interface Instruction {
  /** Original mnemonic, e.g. "add", "stw", "bl". */
  mnemonic: string;
  /** Raw operand text as objdump printed it. */
  rawOperands: string;
  /** Canonical text used for equality, e.g. "add r3, r3, r4". */
  norm: string;
  /** Relocation symbol attached to this instruction, if any. */
  reloc?: string;
}
