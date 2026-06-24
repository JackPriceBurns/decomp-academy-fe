import { LessonSource } from "@/lib/lessons/types";

export const globals: LessonSource[] = [
  {
    id: "globals-read-int",
    chapter: "globals",
    order: 1,
    title: "Reading a Global Through the Small Data Area",
    difficulty: 2,
    concepts: ["globals", "sda", "sda21", "r13"],
    brief: `
# How a global is addressed

A 32-bit GameCube address won't fit in an instruction, so the compiler can't just
\`lwz\` a global by its absolute address. MWCC's answer is the **Small Data Area
(SDA)**: at startup, register **\`r13\`** is pointed at a fixed base, and frequently
used globals are gathered into a window reachable by a signed 16-bit offset from
it. That window is only 64 KB wide (±32 KB from the base), so on a large game
some globals spill out and have to be reached the longer way (the \`@ha\`/\`@l\`
addressing a few lessons from now). For anything that fits, reading one is a
single load with that offset baked in by the linker:

\`\`\`asm
lwz   r3, g@sda21(r13)   # load global g, r13-relative
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   g
\`\`\`

The \`@sda21\` operand is a **relocation** — in an unlinked object the disassembler
prints \`lwz r3, 0(0)\` with an attached \`R_PPC_EMB_SDA21 g\` line, because the
offset and base register aren't filled in until link time. That \`R_PPC_EMB_SDA21\`
line is the unmistakable signature of an ordinary (non-array) global. Whether the
global is \`extern\` or defined in this file, the access looks identical.

## Your task

Declare nothing yourself — \`extern int gFrameCount;\` is already provided. Write
\`readFrameCount\` to match the target assembly above.
`,
    symbol: "readFrameCount",
    context: `extern int gFrameCount;`,
    starter: `int readFrameCount(void) {
    return 0;
}
`,
    solution: `int readFrameCount(void) {
    return gFrameCount;
}
`,
    hints: [
      "A global int is loaded with a single `lwz` relative to r13 (the SDA base).",
      "`return gFrameCount;` compiles to `lwz r3, gFrameCount@sda21(r13)` — relocation R_PPC_EMB_SDA21.",
    ],
  },
  {
    id: "globals-write-int",
    chapter: "globals",
    order: 2,
    title: "Writing a Global",
    difficulty: 2,
    concepts: ["globals", "sda", "sda21", "store"],
    brief: `
# Storing through the same r13 window

Writing a global is the mirror image of reading one. The value is already in a
register (here the argument \`v\` in \`r3\`), and a single **\`stw\`** stores it at the
same \`@sda21\` offset from \`r13\`:

\`\`\`asm
stw   r3, g@sda21(r13)   # g = v
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   g
\`\`\`

Same relocation (\`R_PPC_EMB_SDA21\`), same base register — only the opcode flips
from load (\`lwz\`) to store (\`stw\`). No address has to be materialized first;
that's the whole point of the SDA. If you ever see a bare \`stw rX, sym@sda21(r13)\`
with nothing computing an address beforehand, the C was simply \`sym = value;\`.

## Your task

\`extern int gScore;\` is provided. Write \`setScore\`, taking an \`int v\`, so it
compiles to the \`stw\` above (no return value).
`,
    symbol: "setScore",
    context: `extern int gScore;`,
    starter: `void setScore(int v) {
    // hint: which opcode does a write use?
}
`,
    solution: `void setScore(int v) {
    gScore = v;
}
`,
    hints: [
      "Writing a global is a single store relative to r13.",
      "`gScore = v;` compiles to `stw r3, gScore@sda21(r13)` — relocation R_PPC_EMB_SDA21.",
    ],
  },
  {
    id: "globals-narrow-type",
    chapter: "globals",
    order: 3,
    title: "The Opcode Follows the Type",
    difficulty: 2,
    concepts: ["globals", "sda21", "types", "lbz", "lhz"],
    brief: `
# Narrow globals: same SDA, different load

The \`@sda21\` addressing doesn't change with the width of the global — but the
**opcode does**, exactly the way it tracks type for any load. The relocation stays
\`R_PPC_EMB_SDA21\`; the instruction tells you the declared type:

\`\`\`asm
lbz   r3, g@sda21(r13)   # u8  global  (load byte, zero-extend)
lhz   r3, g@sda21(r13)   # u16 global  (load halfword, zero-extend)
lha   r3, g@sda21(r13)   # s16 global  (load halfword, sign-extend)
\`\`\`

For a \`u8\` global you get **\`lbz\`** (load byte zero), for \`u16\` **\`lhz\`** (load
halfword zero), and a *signed* \`s16\` switches to **\`lha\`** (load halfword
algebraic = sign-extend). This is how you recover a global's type from
disassembly: the displacement says "it's a global," the opcode says "this wide,
this signedness." A byte global read with \`lbz\` was a \`u8\`, not an \`int\`.

Writes mirror this exactly — a \`u8\` store is \`stb rX, sym@sda21(r13)\` and a
16-bit store is \`sth rX, sym@sda21(r13)\` (there's no signed/unsigned distinction
on stores; only the width matters). That \`stb\`/\`sth\` is just the narrow-width
sibling of the \`stw\` from the previous lesson.

## Your task

\`extern u8 gPlayerHealth;\` is provided. Write \`readHealth\` to match the target.
Keep the return type \`u8\` so the load stays \`lbz\`.
`,
    symbol: "readHealth",
    context: `extern u8 gPlayerHealth;`,
    starter: `u8 readHealth(void) {
    return 0;
}
`,
    solution: `u8 readHealth(void) {
    return gPlayerHealth;
}
`,
    hints: [
      "A u8 global loads with `lbz` (byte, zero-extended), still at an @sda21 offset.",
      "`return gPlayerHealth;` compiles to `lbz r3, gPlayerHealth@sda21(r13)`.",
    ],
  },
  {
    id: "globals-read-float",
    chapter: "globals",
    order: 4,
    title: "A Global Float and the Second Small Data Area",
    difficulty: 3,
    concepts: ["globals", "sda", "sda2", "float", "lfs"],
    brief: `
# Floats get their own small-data section

Floating-point globals live in the SDA too, but conceptually in a *second*
small-data area. The GameCube ABI reserves **two** small-data base registers:
\`r13\` for the read/write sections (\`.sdata\`/\`.sbss\`) and **\`r2\`** for the
read-only ones (\`.sdata2\`, where const data and float constants sit). Don't read
\`r2\` as "the immutable global" register, though: MWCC parks float globals in
\`.sdata2\` *by default*, so even a writable \`f32\` like \`gGravity\` here is reached
through \`r2\`, while a plain \`int\` global goes to \`.sdata\` and uses \`r13\`. The
base register tracks the *section the compiler chose*, not the C \`const\`-ness. A
float global is read with **\`lfs\`** (load floating single) straight into an FPR:

\`\`\`asm
lfs   f1, fg@sda21(r2)   # load global float fg into f1
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   fg
\`\`\`

The relocation is still spelled \`R_PPC_EMB_SDA21\` — that one reloc type covers
both small-data windows, and the linker resolves it against whichever base
(\`r13\` or \`r2\`) the symbol's section uses. So an \`lfs sym@sda21\` feeding an FPR
result tells you \`sym\` was a global \`f32\`. No address computation, no constant
pool — just one load.

## Your task

\`extern f32 gGravity;\` is provided. Write \`readGravity\` to reproduce the \`lfs\` assembly above.
`,
    symbol: "readGravity",
    context: `extern f32 gGravity;`,
    starter: `f32 readGravity(void) {
    return 0.0f;
}
`,
    solution: `f32 readGravity(void) {
    return gGravity;
}
`,
    hints: [
      "A global f32 is loaded with `lfs` into f1, addressed in the small-data area.",
      "`return gGravity;` compiles to `lfs f1, gGravity@sda21(r2)` — relocation R_PPC_EMB_SDA21.",
    ],
  },
  {
    id: "globals-float-literal",
    chapter: "globals",
    order: 5,
    title: "Float Literals Become Pooled Constants",
    difficulty: 3,
    concepts: ["globals", "sda21", "literal-pool", "lfs", "constants"],
    brief: `
# Where does \`0.5f\` come from?

There's no "load immediate float" instruction, so a literal like \`0.5f\` can't be
encoded inline. MWCC parks it as an anonymous **pooled constant** in small data
and loads it with \`lfs\`, just like a named global — except the symbol is a
compiler-generated label such as \`@5\` rather than a name you wrote:

\`\`\`asm
lfs   f0, @5@sda21(r2)   # load the pooled constant 0.5f
fmuls f1, f0, f1         # x * 0.5f
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   @5
\`\`\`

That \`@5\` relocation against an \`R_PPC_EMB_SDA21\` entry is a **literal pool** load.
Identical machinery to a global float read — the only tell that it's a literal and
not a named global is the synthetic \`@N\` symbol. When you see an \`lfs\` of an \`@N\`
symbol feeding straight into an arithmetic op, the original C had a float
constant in the expression.

## Your task

Write \`scaleHalf\`, taking an \`f32 x\` and returning \`x * 0.5f\`. Use the \`0.5f\`
literal — the \`f\` suffix matters. Write \`0.5\` (a *double*) and MWCC promotes
\`x\` to double, multiplies in double precision, and converts back: you get
\`lfd\`/\`fmul\`/\`frsp\` instead of the \`lfs\`/\`fmuls\` shown above, and the match
fails. Forgetting the suffix is one of the most common real-world causes of a
float mismatch.
`,
    symbol: "scaleHalf",
    starter: `f32 scaleHalf(f32 x) {
    return 0.0f;
}
`,
    solution: `f32 scaleHalf(f32 x) {
    return x * 0.5f;
}
`,
    hints: [
      "A float literal is pooled into small data under a synthetic label and loaded with `lfs`.",
      "`x * 0.5f` becomes `lfs f0, @N@sda21` then `fmuls f1, f0, f1`.",
    ],
  },
  {
    id: "globals-address-of",
    chapter: "globals",
    order: 6,
    title: "Taking an Address: SDA li vs. the @ha/@l Pair",
    difficulty: 3,
    concepts: ["globals", "address-of", "sda21", "addr16", "lis", "ha-lo"],
    brief: `
# Two ways to materialize an address

Returning the *address* of a global (rather than its value) splits into two cases.

**A small-data scalar** has its address sitting one \`r13\`/\`r2\` offset away, so MWCC
just adds that offset into a register — encoded with the SDA21 relocation. At link
time it becomes a real \`addi r3, r13, g\`. Unlinked, the offset and base register
aren't filled in yet, so the disassembler prints the bare \`addi r3, r3, 0\`
(equivalently shown as \`li r3, 0\`) with the reloc attached — there's no
\`g@sda21(r13)\` text in the raw object; that operand only exists once the linker
resolves it:

\`\`\`asm
addi  r3, r13, g@sda21   # r3 = &g  (small-data scalar# "li r3, 0" + reloc unlinked)
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   g
\`\`\`

**A non-small-data symbol** — anything the linker places outside the SDA window,
such as an array — needs its full 32-bit address built from two halves with the
classic **high-adjusted / low** pair:

\`\`\`asm
lis   r3, tbl@ha        # r3 = high 16 bits (adjusted for sign of the low half)
addi  r3, r3, tbl@l     # add the low 16 bits → full &tbl
blr
\`\`\`
\`\`\`
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
\`\`\`

\`@ha\` is "high adjusted" (the top half, +1 if the low half is negative); \`@l\` is
the low half. That \`lis ...@ha\` / \`addi ...@l\` pair with \`R_PPC_ADDR16_HA\` +
\`R_PPC_ADDR16_LO\` is *the* signature of a non-SDA address. Arrays in particular
land here — which is exactly what this lesson exercises.

## Your task

\`extern int gPalette[];\` is provided. Write \`getPalette\`, returning the array's
address (\`gPalette\` decays to a pointer). Expect the \`lis @ha\` / \`addi @l\` pair.
`,
    symbol: "getPalette",
    context: `extern int gPalette[];`,
    starter: `int* getPalette(void) {
    return 0;
}
`,
    solution: `int* getPalette(void) {
    return gPalette;
}
`,
    hints: [
      "An array's address isn't in the SDA window, so it's built from two halves.",
      "`return gPalette;` compiles to `lis r3, gPalette@ha` then `addi r3, r3, gPalette@l` — relocations R_PPC_ADDR16_HA / R_PPC_ADDR16_LO.",
    ],
  },
  {
    id: "globals-array-index",
    chapter: "globals",
    order: 7,
    title: "Indexing a Global Array",
    difficulty: 4,
    concepts: ["globals", "array", "addr16", "lwzx", "scaled-index"],
    brief: `
# Base address plus a scaled index

Reading \`tbl[i]\` from a global array combines the address-building you just saw
with a **scaled, indexed load**. The base comes from the \`@ha\`/\`@l\` pair (arrays
aren't small-data), the index \`i\` is multiplied by the element size, and a single
indexed load (\`lwzx\` — "load word zero, indexed") fetches the element:

\`\`\`asm
lis   r4, tbl@ha        # high half of &tbl
slwi  r0, r3, 2         # r0 = i * 4   (sizeof(int) == 4)
addi  r3, r4, tbl@l     # r3 = &tbl  (add low half)
lwzx  r3, r3, r0        # r3 = *(&tbl + i*4) = tbl[i]
blr
\`\`\`
\`\`\`
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
\`\`\`

\`slwi r0, r3, 2\` is "shift left word immediate by 2" = multiply by 4, the
\`int\` element size. \`lwzx rD, rA, rB\` loads from \`rA + rB\` — base plus the scaled
offset, no displacement needed. The two \`R_PPC_ADDR16\` relocations confirm it's a
global array rather than a small-data scalar.

Notice the \`slwi\` lands *between* the \`lis\` and the \`addi\` even though it has
nothing to do with building the base address. That's instruction scheduling, not
meaning: the index scaling is independent of the address pair, so MWCC slots it
into the gap to hide the \`lis\` latency. Order like this is normal in real
CodeWarrior output — don't read it as significant.

## Your task

\`extern int gScores[];\` is provided. Write \`getScore\`, taking an \`int i\`, so it
compiles to the indexed array load above.
`,
    symbol: "getScore",
    context: `extern int gScores[];`,
    starter: `int getScore(int i) {
    return 0;
}
`,
    solution: `int getScore(int i) {
    return gScores[i];
}
`,
    hints: [
      "Array base via the @ha/@l pair, index scaled by the element size, then an indexed load.",
      "`gScores[i]` becomes `lis @ha`, `slwi r0, r3, 2`, `addi @l`, `lwzx r3, r3, r0`.",
    ],
  },
  {
    id: "globals-capstone",
    chapter: "globals",
    order: 8,
    title: "★ Capstone: A Lighting-Update Function",
    difficulty: 4,
    concepts: ["globals", "sda21", "capstone", "mixed-types", "highlight"],
    brief: `
# Many globals in one function

Real engine code reads and writes a fistful of globals per function. The assembly
below is drawn from \`worldplanet_updateMapLighting\` in Star Fox Adventures.
Every access is its own \`@sda21\` load or store; the types pick the opcodes. Here a
counter is bumped, a float is copied, and the product of two floats is truncated
into a byte global:

\`\`\`asm
stwu  r1, -16(r1)
lfs   f1, gSrcA@sda21(r2)     # read float global gSrcA
lfs   f0, gSrcB@sda21(r2)     # read float global gSrcB
lwz   r3, gCounter@sda21(r13) # read int global gCounter
fmuls f0, f1, f0             # gSrcA * gSrcB
stfs  f1, gLerpT@sda21(r2)    # gLerpT = gSrcA  (fmuls wrote f0, so f1 still holds gSrcA)
addi  r0, r3, 1              # gCounter + 1
stw   r0, gCounter@sda21(r13) # store it back
fctiwz f0, f0               # (s32) of the product
stfd  f0, 8(r1)
lwz   r0, 12(r1)            # move the low word FPR->GPR via the stack
stb   r0, gColor@sda21(r13)   # gColor = (u8) result
addi  r1, r1, 16
blr
\`\`\`
\`\`\`
R_PPC_EMB_SDA21   gSrcA / gSrcB / gCounter / gLerpT / gColor
\`\`\`

Nothing new per line — \`lwz\`/\`stw\` for the \`int\`, \`lfs\`/\`stfs\` for the floats,
\`stb\` for the \`u8\`, all at \`@sda21\` offsets — but together they're the texture of
real global-heavy code. The \`fctiwz\` -> \`stfd\` -> \`lwz\` is the float->int cast
from the floats chapter, here landing in a byte global.

## Your task

The globals are declared for you:
\`gCounter\` (int), \`gSrcA\`/\`gSrcB\`/\`gLerpT\` (f32), \`gColor\` (u8). Write
\`worldUpdate\` that:
1. increments \`gCounter\` (\`gCounter = gCounter + 1;\`),
2. copies \`gSrcA\` into \`gLerpT\`,
3. sets \`gColor = (u8)(s32)(gSrcA * gSrcB);\`.
`,
    symbol: "worldUpdate",
    context: `extern int gCounter;
extern f32 gSrcA;
extern f32 gSrcB;
extern f32 gLerpT;
extern u8 gColor;`,
    starter: `void worldUpdate(void) {
    // 1) bump gCounter
    // 2) gLerpT = gSrcA
    // 3) gColor = (u8)(s32)(gSrcA * gSrcB)
}
`,
    solution: `void worldUpdate(void) {
    gCounter = gCounter + 1;
    gLerpT = gSrcA;
    gColor = (u8)(s32)(gSrcA * gSrcB);
}
`,
    hints: [
      "Each global is an independent @sda21 access; the type fixes the opcode (lwz/stw, lfs/stfs, stb).",
      "Write the three statements in order; the float->int cast emits fctiwz/stfd/lwz before the `stb` to gColor.",
    ],
  },
];
