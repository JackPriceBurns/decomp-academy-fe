import { LessonSource } from "@/lib/lessons/types";

// The Practice Gauntlet: programmatically generated drills. Each family is a
// parameterized template covering one authentic MWCC GC/2.0 idiom; expanding
// the parameter lists scales the lesson count without bound. Every target is
// still compiled live by the real compiler, so the drills are always truthful
// no matter how the compiler chooses to lower them.

const lessons: LessonSource[] = [];
let order = 0;
function push(l: Omit<LessonSource, "chapter" | "order">) {
  lessons.push({ ...l, chapter: "gauntlet", order: order++ });
}

const stub = (sig: string) => `${sig} {\n    // your code here\n    return 0;\n}\n`;

// ── Family 1: load an integer constant ──────────────────────────────────────
// Small constants fit in `li`; large ones need `lis`+`ori` (or `lis` alone).
const CONSTANTS = [0, 1, 7, 100, 255, 256, 1000, 32767, -1, -50, -1000, -32768, 0x8000, 0x10000, 0x12340000, 0x12345678];
for (const k of CONSTANTS) {
  const big = k > 32767 || k < -32768;
  push({
    id: `gauntlet-const-${k >= 0 ? k : "n" + -k}`,
    title: `Return ${k >= 0 ? k : k} (0x${(k >>> 0).toString(16)})`,
    difficulty: big ? 2 : 1,
    concepts: ["immediates", big ? "lis-ori" : "li"],
    brief: `
# Materializing a constant

A value that fits in signed 16 bits loads in one **\`li\`**. A wider value is
built from halves: **\`lis\`** (load immediate *shifted* — the high 16 bits),
then **\`addi\`** to add the low half (MWCC uses \`addi\`, not \`ori\`, for an
\`int\`). If the low 16 bits are all zero, the lone \`lis\` is enough.

${
      big
        ? (k & 0xffff) === 0
          ? "This constant's low half is zero, so a single `lis` does it."
          : "This constant needs the two-instruction `lis` + `addi` form."
        : "This constant fits in a single `li`."
    }

## Your task
Write \`get\` to match the target.
`,
    symbol: "get",
    starter: stub("int get(void)"),
    solution: `int get(void) {\n    return ${k};\n}\n`,
    hints: [
      big
        ? (k & 0xffff) === 0
          ? "Only the high 16 bits are set, so expect a single `lis`."
          : "This value is wider than 16 bits, so expect `lis` then `addi`."
        : "This value fits in a single immediate.",
      `Just \`return ${k};\`.`,
    ],
  });
}

// ── Family 2: multiply by a constant (strength reduction) ───────────────────
const MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 17, 24, 32, 64, 100, 128, 1000];
for (const k of MULTIPLIERS) {
  const pow2 = (k & (k - 1)) === 0;
  push({
    id: `gauntlet-mul-${k}`,
    title: `Multiply by ${k}`,
    difficulty: pow2 ? 2 : 3,
    concepts: ["strength-reduction", pow2 ? "shift" : "shift-add"],
    brief: `
# Multiply by ${k}

The optimizer never emits a register \`mullw\` for a constant. ${
      pow2
        ? `Because ${k} is a power of two, \`x * ${k}\` is just a left shift (\`slwi r3, r3, ${Math.log2(k)}\`).`
        : `For a non-power-of-two like ${k}, MWCC uses the immediate multiply \`mulli r3, r3, ${k}\` — a single instruction.`
    }

## Your task
Write \`scale\` to match the target.
`,
    symbol: "scale",
    starter: stub("int scale(int x)"),
    solution: `int scale(int x) {\n    return x * ${k};\n}\n`,
    hints: [
      pow2 ? `${k} is 2^${Math.log2(k)}, so this is a shift (\`slwi\`).` : `${k} is not a power of two, so expect a single \`mulli\`.`,
      `Write \`x * ${k}\` and match whatever the compiler emits.`,
    ],
  });
}

// ── Family 3: shift by a constant amount ────────────────────────────────────
for (let n = 1; n <= 16; n++) {
  push({
    id: `gauntlet-shl-${n}`,
    title: `Shift left by ${n}`,
    difficulty: 1,
    concepts: ["shifts", "rlwinm"],
    brief: `
# Logical shift left by ${n}

\`x << ${n}\` is the extended mnemonic **\`slwi r3, r3, ${n}\`**, itself a special
\`rlwinm\` (rotate-left-${n}, mask the low ${n} bits to zero).

## Your task
Write \`shl\` on a \`u32\` to match the target.
`,
    symbol: "shl",
    starter: stub("u32 shl(u32 x)"),
    solution: `u32 shl(u32 x) {\n    return x << ${n};\n}\n`,
    hints: [`Left shift by ${n} is \`slwi r3, r3, ${n}\`.`, `Write \`x << ${n}\`.`],
  });
}
for (let n = 1; n <= 16; n++) {
  push({
    id: `gauntlet-shr-${n}`,
    title: `Unsigned shift right by ${n}`,
    difficulty: 1,
    concepts: ["shifts", "unsigned"],
    brief: `
# Logical shift right by ${n}

On an unsigned value, \`x >> ${n}\` is **\`srwi r3, r3, ${n}\`** — high bits filled
with zero. (On a *signed* value the compiler would use \`srawi\` to preserve the
sign instead.)

## Your task
Write \`shr\` on a \`u32\` to match the target.
`,
    symbol: "shr",
    starter: stub("u32 shr(u32 x)"),
    solution: `u32 shr(u32 x) {\n    return x >> ${n};\n}\n`,
    hints: [`Unsigned right shift by ${n} is \`srwi r3, r3, ${n}\`.`, `Write \`x >> ${n}\`.`],
  });
}
for (let n = 1; n <= 16; n++) {
  push({
    id: `gauntlet-sar-${n}`,
    title: `Signed shift right by ${n}`,
    difficulty: 2,
    concepts: ["shifts", "signed", "srawi"],
    brief: `
# Arithmetic shift right by ${n}

On a *signed* value, \`x >> ${n}\` preserves the sign bit, so MWCC uses the
algebraic shift **\`srawi r3, r3, ${n}\`** — a real opcode, not an \`rlwinm\`
mnemonic. (An unsigned \`>>\` would zero-fill with \`srwi\` instead; the type, not
the operator, decides.)

## Your task
Write \`sar\` on an \`s32\` so it compiles to the \`srawi\` above.
`,
    symbol: "sar",
    starter: stub("s32 sar(s32 x)"),
    solution: `s32 sar(s32 x) {\n    return x >> ${n};\n}\n`,
    hints: [`Signed right shift by ${n} is \`srawi r3, r3, ${n}\`.`, `Write \`x >> ${n}\` on an s32.`],
  });
}

// ── Family 4: single-bit set / clear / test ─────────────────────────────────
for (let bit = 0; bit < 16; bit++) {
  const mask = 1 << bit;
  push({
    id: `gauntlet-setbit-${bit}`,
    title: `Set bit ${bit}`,
    difficulty: 2,
    concepts: ["bitwise", "masks"],
    brief: `
# Set bit ${bit}

Setting a single bit is \`x |= 0x${mask.toString(16)}\`. A mask that fits the
\`ori\` immediate becomes one **\`ori\`**; a high mask uses \`oris\`.

## Your task
Write \`setb\` on a \`u32\`, returning \`x\` with bit ${bit} set.
`,
    symbol: "setb",
    starter: stub("u32 setb(u32 x)"),
    solution: `u32 setb(u32 x) {\n    return x | 0x${mask.toString(16)};\n}\n`,
    hints: [`Bit ${bit} is mask 0x${mask.toString(16)}.`, `OR it in: \`x | 0x${mask.toString(16)}\`.`],
  });
  push({
    id: `gauntlet-clrbit-${bit}`,
    title: `Clear bit ${bit}`,
    difficulty: 2,
    concepts: ["bitwise", "rlwinm"],
    brief: `
# Clear bit ${bit}

Write the clear as \`x &= ~0x${mask.toString(16)}\`. Because the *complement* of a
single bit is a contiguous run of ones, MWCC emits a single **\`rlwinm\`** (clear
one bit) rather than a two-immediate \`andi\` — the idiom from the bitwise chapter.

## Your task
Write \`clrb\` on a \`u32\`, returning \`x\` with bit ${bit} cleared.
`,
    symbol: "clrb",
    starter: stub("u32 clrb(u32 x)"),
    solution: `u32 clrb(u32 x) {\n    return x & ~0x${mask.toString(16)};\n}\n`,
    hints: [
      `Clear with \`x &= ~mask\` — the complement operator \`~\` is what yields the efficient rlwinm instruction.`,
      `Use \`x & ~0x${mask.toString(16)}\`.`,
    ],
  });
  push({
    id: `gauntlet-testbit-${bit}`,
    title: `Test bit ${bit}`,
    difficulty: 2,
    concepts: ["bitwise", "rlwinm"],
    brief: `
# Test bit ${bit}

Extracting one bit as a 0/1 value is \`(x >> ${bit}) & 1\`. MWCC folds the shift
and the mask into a single **\`rlwinm\`** that rotates bit ${bit} down to the
bottom and keeps only it (bit 0 collapses to a \`clrlwi\`).

## Your task
Write \`testb\` on a \`u32\`, returning bit ${bit} of \`x\` as 0 or 1.
`,
    symbol: "testb",
    starter: stub("u32 testb(u32 x)"),
    solution: `u32 testb(u32 x) {\n    return (x >> ${bit}) & 1;\n}\n`,
    hints: [
      `Isolate the bit with \`(x >> ${bit}) & 1\`.`,
      `It folds to a single \`rlwinm\` that drops bit ${bit} to the bottom.`,
    ],
  });
}

// ── Family 5: read a struct field of a given type at a given offset ─────────
const FIELD_TYPES: { t: string; load: string }[] = [
  { t: "s32", load: "lwz" },
  { t: "u8", load: "lbz" },
  // Returning an s8 directly needs no extsb — the byte is never promoted to int.
  { t: "s8", load: "lbz" },
  { t: "u16", load: "lhz" },
  { t: "s16", load: "lha" },
  { t: "f32", load: "lfs" },
];
const OFFSETS = [0, 4, 8, 12, 16, 24, 32];
for (const { t, load } of FIELD_TYPES) {
  for (const off of OFFSETS) {
    // Pad the struct with bytes up to the requested offset, then place the field.
    // Offset 0 needs no padding member (a zero-length array is non-portable).
    const decl =
      off === 0
        ? `typedef struct { ${t} field; } S;`
        : `typedef struct { u8 _pad[${off}]; ${t} field; } S;`;
    push({
      id: `gauntlet-field-${t}-${off}`,
      title: `Read a ${t} field at offset ${off}`,
      difficulty: off === 0 ? 2 : 3,
      concepts: ["structs", "loads", t],
      brief: `
# Load a \`${t}\` at byte offset ${off}

A typed field access compiles to a single load with the field's displacement.
A \`${t}\` field reads with **\`${load}\`**${
        off === 0 ? " at displacement 0" : ` at displacement ${off}`
      }. The *type* picks the load opcode; the *offset* picks the displacement.${
        t === "s8"
          ? `

Note that \`s8\` reads with \`lbz\` (the same byte-load as \`u8\`), *not* a
sign-extending load. MWCC returns the byte directly in r3 without extending it
in the callee — the ABI only requires the low 8 bits of the return register to
hold a valid \`s8\`.`
          : ""
      }

\`\`\`c
${decl}
\`\`\`

## Your task
Write \`read\` to reproduce the assembly above.
`,
      symbol: "read",
      context: decl,
      starter: `${t} read(S* s) {\n    return 0;\n}\n`,
      solution: `${t} read(S* s) {\n    return s->field;\n}\n`,
      hints: [
        `A ${t} loads with ${load}.`,
        `The field sits at offset ${off}, so expect a displacement of ${off}.`,
        `Just \`return s->field;\`.`,
      ],
    });
  }
}

// ── Family 6: index a typed array (scale by element size) ───────────────────
const ARRAY_TYPES: { t: string; loadx: string }[] = [
  { t: "u8", loadx: "lbzx (scale 1)" },
  { t: "s16", loadx: "lhax (scale 2)" },
  { t: "u16", loadx: "lhzx (scale 2)" },
  { t: "s32", loadx: "lwzx (scale 4)" },
  { t: "f32", loadx: "lfsx (scale 4)" },
];
for (const { t, loadx } of ARRAY_TYPES) {
  push({
    id: `gauntlet-array-${t}`,
    title: `Index a ${t} array`,
    difficulty: 3,
    concepts: ["pointers", "arrays", t],
    brief: `
# Indexed load from a \`${t}\` array

\`a[i]\` scales the index by \`sizeof(${t})\` and uses an indexed load: **${loadx}**.
Unlike a constant displacement, a *variable* index must be scaled at runtime${
      t === "u8"
        ? `. For a 1-byte element the scale is 1, so no shift is needed — just the
indexed load.`
        : `: MWCC first emits a \`slwi\` to multiply the index by the element size,
then the indexed load. So expect two instructions, e.g. \`slwi r0, r4, N\`
followed by the load.`
    }

## Your task
Write \`at\` to match the target.
`,
    symbol: "at",
    starter: `${t} at(${t}* a, int i) {\n    return 0;\n}\n`,
    solution: `${t} at(${t}* a, int i) {\n    return a[i];\n}\n`,
    hints: [`A ${t} element uses ${loadx}.`, `Write \`a[i]\`.`],
  });
}

// ── Family 7: multiply a float by a literal ─────────────────────────────────
const FLOAT_LITS = ["0.5f", "0.25f", "2.0f", "3.0f", "10.0f", "0.0625f", "100.0f"];
for (const lit of FLOAT_LITS) {
  push({
    id: `gauntlet-fmul-${lit.replace(/[.f]/g, "")}`,
    title: `Float multiply by ${lit}`,
    difficulty: 2,
    concepts: ["floats", "fmuls", "literals"],
    brief: `
# Scale a float by ${lit}

The literal \`${lit}\` is loaded from the small-data area with **\`lfs\`**, then a
single-precision **\`fmuls\`** does the work. Keeping everything \`f32\` avoids a
\`frsp\` rounding step.

## Your task
Write \`scale\` so it compiles to the \`fmuls\` above.
`,
    symbol: "scale",
    starter: `f32 scale(f32 x) {\n    return 0.0f;\n}\n`,
    solution: `f32 scale(f32 x) {\n    return x * ${lit};\n}\n`,
    hints: [`The constant loads with \`lfs\`, the multiply is \`fmuls\`.`, `Write \`x * ${lit}\`.`],
  });
}

// ── Family 8: divide an unsigned value by a power of two ────────────────────
for (const sh of [1, 2, 3, 4, 5, 8, 10]) {
  const d = 1 << sh;
  push({
    id: `gauntlet-udiv-${d}`,
    title: `Unsigned divide by ${d}`,
    difficulty: 2,
    concepts: ["strength-reduction", "unsigned", "shifts"],
    brief: `
# Unsigned divide by ${d}

Dividing an **unsigned** value by the power of two ${d} discards the low ${sh}
bits — a single **\`srwi r3, r3, ${sh}\`**. No rounding fix-up is needed (that's
only for *signed* division by a power of two).

## Your task
Write \`udiv\` on a \`u32\` so it compiles to the \`srwi\` above.
`,
    symbol: "udiv",
    starter: stub("u32 udiv(u32 x)"),
    solution: `u32 udiv(u32 x) {\n    return x / ${d};\n}\n`,
    hints: [`${d} = 2^${sh}, so this is \`srwi r3, r3, ${sh}\`.`, `Write \`x / ${d}\`.`],
  });
}

// ── Family 9: divide a signed value by a power of two ───────────────────────
for (const sh of [2, 3, 4, 5, 8, 10]) {
  const d = 1 << sh;
  push({
    id: `gauntlet-sdiv-${d}`,
    title: `Signed divide by ${d}`,
    difficulty: 3,
    concepts: ["strength-reduction", "signed", "srawi", "addze"],
    brief: `
# Signed divide by ${d}

A *signed* divide by a power of two can't be a plain shift: C rounds toward zero
but an arithmetic shift rounds toward negative infinity, so MWCC adds a fixup.
The signature is **\`srawi r0, r3, ${sh}\`** followed by **\`addze r3, r0\`** — the
\`addze\` nudges the quotient back toward zero for negative inputs.

## Your task
Write \`sdiv\` on an \`s32\` so it compiles to the \`srawi\` + \`addze\` above.
`,
    symbol: "sdiv",
    starter: stub("s32 sdiv(s32 x)"),
    solution: `s32 sdiv(s32 x) {\n    return x / ${d};\n}\n`,
    hints: [
      `Signed divide by ${d} is \`srawi\` then \`addze\`, not a lone shift.`,
      `Write \`x / ${d}\` on an s32.`,
    ],
  });
}

export const gauntlet: LessonSource[] = lessons;
