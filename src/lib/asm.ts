// Parse `powerpc-eabi-objdump -drz` output and normalize PowerPC instructions
// so that two independent compilations that are functionally identical compare
// equal even though absolute addresses / local branch targets differ.

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

const FUNC_HEADER = /^[0-9a-fA-F]+\s+<([^>]+)>:/;
const INSN_LINE = /^\s*([0-9a-fA-F]+):\s+((?:[0-9a-fA-F]{2}\s){1,4})\s*(.*)$/;
const RELOC_LINE = /^\s*[0-9a-fA-F]+:\s+R_PPC\w*\s+(\S+)/;

/** Parse the full objdump dump into a map of symbol name -> instructions. */
export function parseObjdump(text: string): Map<string, Instruction[]> {
  const out = new Map<string, Instruction[]>();
  let current: Instruction[] | null = null;
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const header = line.match(FUNC_HEADER);
    if (header) {
      current = [];
      out.set(header[1], current);
      continue;
    }

    const reloc = line.match(RELOC_LINE);
    if (reloc && current && current.length) {
      // Relocation belongs to the instruction just emitted.
      current[current.length - 1].reloc = reloc[1];
      continue;
    }

    const insn = line.match(INSN_LINE);
    if (insn && current) {
      const rest = insn[3].trim();
      if (!rest) continue;
      const sp = rest.indexOf("\t") >= 0 ? rest.indexOf("\t") : rest.indexOf(" ");
      const mnemonic = sp >= 0 ? rest.slice(0, sp) : rest;
      const rawOperands = sp >= 0 ? rest.slice(sp).trim() : "";
      current.push({ mnemonic, rawOperands, norm: "" });
    }
  }

  // Second pass: normalize each function's instructions now that relocs are attached.
  for (const insns of out.values()) {
    for (let i = 0; i < insns.length; i++) {
      insns[i].norm = normalize(insns[i], i);
    }
  }
  return out;
}

// Branches that take a target operand all start with 'b'. The register-indirect
// forms (return / count-register dispatch) carry no target and must be excluded.
const REG_INDIRECT_BRANCH = new Set([
  "blr", "blrl", "bctr", "bctrl", "bcctr", "bcctrl", "bclr", "bclrl",
]);

function isTargetBranch(mnemonic: string): boolean {
  // Covers b/ba/bl/bla, bc, and every extended conditional form including the
  // branch-prediction suffixes objdump prints, e.g. beq, bne-, bge+, bdnz+.
  return /^b/.test(mnemonic) && !REG_INDIRECT_BRANCH.has(mnemonic);
}

// objdump (-drz, gekko) prints branch/displacement targets as BARE hex with no
// "0x" prefix (e.g. `b 48`, `bne+ 8`, `bl 10`). Match an optional 0x either way.
const TRAILING_HEX = /(?:0x)?([0-9a-fA-F]+)\s*$/;

/** Produce a canonical, position-stable representation of an instruction. */
function normalize(insn: Instruction, index: number): string {
  let ops = insn.rawOperands;

  // Strip objdump's trailing "<symbol+0x..>" annotations on the operand text.
  ops = ops.replace(/\s*<[^>]*>/g, "");

  const branch = isTargetBranch(insn.mnemonic);

  if (insn.reloc) {
    // Replace the (meaningless across builds) numeric address/displacement with
    // the relocation symbol so symbol references compare structurally.
    if (branch) {
      ops = ops.replace(TRAILING_HEX, `@${insn.reloc}`);
    } else {
      // For lis/addi/lwz/lfs etc. the reloc patches an immediate or a
      // displacement: `0(r0)` -> `@sym(r0)`, `,123` -> `,@sym`.
      ops = ops
        .replace(/-?\d+\(/, `@${insn.reloc}(`)
        .replace(/(,\s*)-?\d+$/, `$1@${insn.reloc}`)
        .replace(/(?:0x)?[0-9a-fA-F]+(?=\s*$)/, `@${insn.reloc}`);
    }
  } else if (branch) {
    // Local branch: rewrite the absolute byte target into a delta (in
    // instructions) from this one, so it is independent of load address and of
    // how many instructions precede it.
    ops = ops.replace(TRAILING_HEX, (_m, hex) => {
      const targetByte = parseInt(hex, 16);
      const targetIndex = Math.round(targetByte / 4);
      const delta = targetIndex - index;
      return `.${delta >= 0 ? "+" : ""}${delta}`;
    });
  }

  ops = ops.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
  return ops ? `${insn.mnemonic} ${ops}` : insn.mnemonic;
}
