import { LessonSource } from "@/lib/lessons/types";

export const advanced: LessonSource[] = [
  {
    id: "advanced-switch-jumptable",
    chapter: "advanced",
    order: 1,
    difficulty: 3,
    title: "Switch: The Jump Table",
    concepts: ["switch", "jump-table", "bctr", "control-flow"],
    brief: `
# The other kind of switch

In the control chapter you met the **compare chain** — a cascade of \`cmpwi\` /
\`beq-\` / \`bge-\` that bisects a handful of cases. But when the cases are
**dense and numerous** (here \`0..7\`, all consecutive), MWCC stops comparing
one value at a time and builds a **computed jump**: it uses \`x\` itself as an
index into a table of code addresses.

\`\`\`asm
cmplwi r3, 7        # bounds check: is x in 0..7?
bgt-   .default     # above the table -> default arm
lis    r4, table@ha # load the upper 16 bits of the @switch table address...
slwi   r0, r3, 2    # x * 4  (each table entry is a 4-byte address)
addi   r3, r4, table@lo # ...add the lower 16 bits -> r3 = full table base
lwzx   r0, r3, r0   # load table[x]  -> the target address
mtctr  r0           # move it into the count register
bctr                # branch to CTR  -> jump straight to case x
\`\`\`

Three fingerprints give it away: the **single \`cmplwi\` bounds check** (note
\`cmplwi\`, unsigned — a negative \`x\` wraps to a huge value and fails the check
for free), the \`slwi r0, r3, 2\` index scaling, and the
\`lwzx\` → \`mtctr\` → \`bctr\` trio that loads an address from a \`@switch\` rodata
table and jumps through it. After \`bctr\`, each case is its own tiny
\`li r3, N\` / \`blr\` block. No per-case compares at all — the dispatch is O(1).

## Your task

Write \`dispatch\`: a \`switch\` on \`x\` with cases \`0..7\` returning
\`100, 211, 322, 433, 544, 655, 766, 877\` respectively, and \`-1\` by default.
Eight dense cases is past the threshold, so this compiles to the table form.
`,
    symbol: "dispatch",
    starter: `int dispatch(int x) {
    return 0;
}
`,
    solution: `int dispatch(int x) {
    switch (x) {
        case 0: return 100;
        case 1: return 211;
        case 2: return 322;
        case 3: return 433;
        case 4: return 544;
        case 5: return 655;
        case 6: return 766;
        case 7: return 877;
        default: return -1;
    }
}
`,
    hints: [
      "Eight consecutive cases (0..7) is dense enough that MWCC builds a jump table, not a compare chain.",
      "Look for the `cmplwi r3, 7` bounds check then `lwzx` / `mtctr` / `bctr` dispatching through a @switch table.",
    ],
  },
  {
    id: "advanced-switch-decision",
    chapter: "advanced",
    order: 2,
    difficulty: 3,
    title: "Table or Chain? The Density Rule",
    concepts: ["switch", "jump-table", "compare-chain", "heuristic"],
    brief: `
# When does MWCC pick which?

The table form and the compare chain are *both* in MWCC's toolbox, and the
choice is mechanical: it depends on how many cases there are and how densely
they pack. Two rules of thumb that this compiler follows:

- **Dense and few → compare chain.** A run of \`0..5\` (six consecutive cases)
  still bisects with \`cmpwi\` / \`beq-\` / \`bge-\`. The crossover on this
  toolchain is **seven** consecutive cases: \`0..6\` and up switch to the table.
  Concretely: \`0..5\` (six cases) stays a compare chain; \`0..6\` (seven cases)
  is the first to cross into table form; lesson 1's \`0..7\` (eight cases) sits
  comfortably above the threshold. The rule is "at least seven," not "more than
  eight."
- **Sparse → compare chain, always.** Cases like \`1, 10, 100, 500\` are far
  apart. A table indexed by \`x\` would need 500 entries (mostly default) — far
  too big — so MWCC bisects them no matter how many there are:

\`\`\`asm
cmpwi r3, 100      # probe the middle case value
beq-  .case100
bge-  .hi          # x > 100 -> search the upper half
cmpwi r3, 10
beq-  .case10
bge-  .default
cmpwi r3, 1
beq-  .case1
b     .default
...
.case1: li r3, 11   # each case body is the same tiny li/blr...
        blr          # ...only the dispatch above differs from the table form
\`\`\`

So when you're matching a switch, **count the cases and check their spread
first**. A lone \`cmplwi\` + \`bctr\` means dense-and-many (write consecutive
cases). A staircase of \`cmpwi\`/\`beq-\` against scattered constants means the
original values were sparse — and the *constants in the asm* tell you exactly
which case labels to write.

## Your task

Write \`route\`, a sparse \`switch\` on \`x\`: case \`1\` → \`11\`, case \`10\` → \`22\`,
case \`100\` → \`33\`, case \`500\` → \`44\`, default \`0\`. Four scattered cases stays
a compare chain.
`,
    symbol: "route",
    starter: `int route(int x) {
    return 0;
}
`,
    solution: `int route(int x) {
    switch (x) {
        case 1:   return 11;
        case 10:  return 22;
        case 100: return 33;
        case 500: return 44;
        default:  return 0;
    }
}
`,
    hints: [
      "Sparse case values can't be table-indexed, so MWCC bisects them with a compare chain regardless of count.",
      "Expect `cmpwi` / `beq-` / `bge-` probing the case values in sorted order, no `bctr`.",
    ],
  },
  {
    id: "advanced-psq-callee-save",
    chapter: "advanced",
    order: 3,
    difficulty: 4,
    title: "Paired-Single FPR Saves in the Prologue",
    concepts: ["paired-singles", "psq_st", "callee-save", "prologue", "floats"],
    brief: `
# Why a float function stores 64 + 32 bits per register

The Gekko's floating-point registers \`f14\`–\`f31\` are **callee-saved**: a
function that keeps live float values across a call must preserve them and
restore them before returning. What's surprising is *how* MWCC saves each one —
not one store, but **two**:

\`\`\`asm
stwu   r1, -96(r1)
mflr   r0
stw    r0, 100(r1)
stfd   f31, 80(r1)        # save the 64-bit double view of f31...
psq_st f31, 88(r1), 0, 0  # ...AND the paired-single (two 32-bit) view
stfd   f30, 64(r1)
psq_st f30, 72(r1), 0, 0
...
\`\`\`

Each callee-saved FPR gets an \`stfd\` (store float double) **paired with a**
\`psq_st\` (*store paired-single quantized*). The Gekko can hold **two packed
32-bit floats** in one FPR, and \`stfd\` alone would only preserve the
double-precision lane — so MWCC emits the \`psq_st\` to guarantee both
paired-single halves survive too. The epilogue mirrors it exactly:
\`psq_l\` then \`lfd\` for each register, highest-numbered first.

When you see a prologue full of \`stfd\`/\`psq_st\` pairs climbing \`f31, f30,
f29...\`, that's just **callee-saved float registers** — the function is
float-heavy enough to spill them. You match it by writing C with enough live
\`f32\` values across calls; the saves fall out automatically.

## Your task

Write \`mix(f32 *p)\`: call the provided \`transform\` on \`p[0]..p[5]\` into six
locals \`a, b, c, d, e, g\` (we skip the name \`f\` so it isn't confused with the
\`f32\` type), then \`return a*b + c*d + e*g + a*c + b*d + e*a;\`. Holding six float
results across six calls forces several callee-saved FPRs — watch the
\`psq_st\`/\`stfd\` pairs appear in the prologue.
`,
    symbol: "mix",
    context: `extern f32 transform(f32);
`,
    starter: `f32 mix(f32 *p) {
    return 0.0f;
}
`,
    solution: `f32 mix(f32 *p) {
    f32 a = transform(p[0]);
    f32 b = transform(p[1]);
    f32 c = transform(p[2]);
    f32 d = transform(p[3]);
    f32 e = transform(p[4]);
    f32 g = transform(p[5]);
    return a*b + c*d + e*g + a*c + b*d + e*a;
}
`,
    hints: [
      "Each float local must survive a `bl transform`, so it lands in a callee-saved FPR (f31, f30, ...).",
      "Every saved FPR shows up as an `stfd`/`psq_st` pair in the prologue and a `psq_l`/`lfd` pair in the epilogue.",
    ],
  },
  {
    id: "advanced-psq-asm-exception",
    chapter: "advanced",
    order: 4,
    difficulty: 4,
    title: "Where Inline asm{} Earns Its Place: psq_l / psq_st",
    concepts: ["paired-singles", "asm", "intrinsics", "psq_l", "objdump"],
    brief: `
# When inline asm is the right tool

In decompilation the aim is clean C that byte-matches the target, so inline
\`asm{}\` is something you generally steer clear of — pasted assembly proves
nothing about the original source. There is one situation where it's genuinely
justified: the **paired-single load/store** instructions \`psq_l\` and \`psq_st\`
(and the \`ps_*\` arithmetic family). The reason is simple: **MWCC GC/2.0
has no intrinsic for them.** The exception you saw in the prologue lesson is
narrow: a callee-save \`psq_st\` falls out *automatically* with a fixed
register-and-offset pattern, but you cannot deliberately direct a \`psq_l\` (or
the \`ps_*\` arithmetic family) at an arbitrary pointer from C at all. So when the
original code deliberately packed two floats and loaded or moved them as a unit,
the only faithful recovery is a tiny \`asm{}\` block.

It compiles cleanly here as long as the pointer operands are
\`register\`-qualified (the assembler needs them already in a GPR):

\`\`\`asm
psq_l  f0, 0(r4), 0, 0   # load two packed 32-bit floats from src into f0
psq_st f0, 0(r3), 0, 0   # store both halves to dst
blr
\`\`\`

Read the operand form \`psq_l fD, offset(rA), W, I\`: \`W\` selects 1-vs-2 values,
\`I\` picks a graphics-quantization mode (\`0\` = no scaling, plain \`f32\`). One last
trap: **stock objdump mis-decodes paired-singles as PowerPC VSX**. A GameCube
decomp toolchain uses a patched objdump and disassembles with **\`-M gekko\`** (the
compiler service here already does) — without it, \`psq_l\` shows up as garbage VSX
mnemonics and you'll think the match is broken when it isn't.

## Your task

Write \`load_pair(register f32 *dst, register const f32 *src)\` that uses an
\`asm{}\` block to \`psq_l\` a packed pair from \`src\` into \`f0\` and \`psq_st\` it to
\`dst\`. This is the *only* lesson where \`asm{}\` is the right answer — keep both
pointer parameters \`register\`-qualified or the assembler rejects the operands.
`,
    symbol: "load_pair",
    starter: `void load_pair(register f32 *dst, register const f32 *src) {
    // asm { ... } using psq_l / psq_st
}
`,
    solution: `void load_pair(register f32 *dst, register const f32 *src) {
    asm {
        psq_l   f0, 0(src), 0, 0
        psq_st  f0, 0(dst), 0, 0
    }
}
`,
    hints: [
      "Paired-singles have no MWCC intrinsic, so a small `asm{}` block is the practical way to emit psq_l/psq_st.",
      "The operand form is `psq_l f0, 0(src), 0, 0`; keep both pointers `register`-qualified so they sit in GPRs.",
    ],
  },
  {
    id: "advanced-enum-sizing",
    chapter: "advanced",
    order: 5,
    difficulty: 3,
    title: "Enums Are int-Sized: Recovery Is Naming",
    concepts: ["enum", "enum-int", "types", "naming"],
    brief: `
# An enum compiles to nothing special

Under the compiler flags used here (\`-enum int\`, equivalently \`#pragma enum int\`),
every \`enum\` is exactly **int-sized — 4 bytes**. That has a liberating
consequence: an enum-typed field and an \`int\` field generate **identical**
code. Compare a struct field against an enum constant:

\`\`\`asm
lwz    r0, 0(r3)      # load the 4-byte state field
subfic r0, r0, 2      # r0 = 2 - state   (zero iff state == 2)
cntlzw r0, r0
srwi   r3, r0, 5      # the "== " idiom -> 0/1
blr
\`\`\`

That \`lwz\` (a full word, not \`lbz\`/\`lhz\`) confirms the field is 4 bytes wide,
and the \`subfic\`/\`cntlzw\`/\`srwi\` is the plain equality idiom you already know.
One wrinkle: the control chapter compared two *variables* with \`subf\`, but here
one side is the **compile-time constant** \`2\`, so MWCC folds it into a single
\`subfic r0, r0, 2\` (subtract-from-immediate, computing \`r0 = 2 - state\`, zero
exactly when \`state == 2\`). Same logical operation, immediate form.
Now here's the point: **this is byte-for-byte the same** whether you wrote
\`a->state == STATE_RUN\` with a real enum or \`a->state == 2\` with a bare \`int\`
and a magic number. The enum names contribute *zero* bytes.

So **recovering an enum is a naming decision, not a codegen one.** When the asm
compares a 4-byte field against small integer constants \`0, 1, 2, 3...\`, you're
free to introduce an \`enum\` and meaningful names — it won't change a single
instruction, it just makes the C readable and the intent obvious.

## Your task

Write \`is_running(struct Actor *a)\` to match the assembly above. The
\`State\` enum and \`Actor\` struct are provided. Confirm for yourself that
replacing \`STATE_RUN\` with the literal \`2\` produces the same asm.
`,
    symbol: "is_running",
    context: `typedef enum { STATE_IDLE, STATE_WALK, STATE_RUN, STATE_JUMP } State;
struct Actor { State state; int hp; };
`,
    starter: `int is_running(struct Actor *a) {
    return 0;
}
`,
    solution: `int is_running(struct Actor *a) {
    return a->state == STATE_RUN;
}
`,
    hints: [
      "With -enum int the enum is 4 bytes, so the field loads with a full `lwz` and STATE_RUN is just the value 2.",
      "The compare is the standard `subfic` / `cntlzw` / `srwi r3, r0, 5` equality idiom — enums add no instructions.",
    ],
  },
  {
    id: "advanced-volatile-cse",
    chapter: "advanced",
    order: 6,
    difficulty: 4,
    title: "Volatile Defeats CSE: Two Reads, Two Loads",
    concepts: ["volatile", "cse", "optimization", "loads"],
    brief: `
# When the optimizer is forbidden to remember

At \`-O4,p\` MWCC aggressively **CSEs** (common-subexpression eliminates) memory
reads: if you load the same global twice with nothing changing it in between,
it loads **once** and reuses the value. A plain global summed with itself:

\`\`\`asm
lwz r0, g_plain@sda21(r2)   # ONE load...
add r3, r0, r0              # ...reused for both operands
blr
\`\`\`

Mark that same global **\`volatile\`** and the rule inverts. \`volatile\` means
"every access is observable — never fold, never cache, never reorder." So two
reads in the source become **two real loads** in the asm:

\`\`\`asm
lwz r3, g_counter@sda21(r2) # first read
lwz r0, g_counter@sda21(r2) # SECOND read -- not CSE'd
add r3, r3, r0
blr
\`\`\`

This is the single most reliable fingerprint of \`volatile\`: **a value loaded
more times than the source seems to need, with no store in between.** If your
match keeps the CSE'd single load but the target shows the redundant reload, the
original variable was \`volatile\` — and vice versa. It matters far beyond
counting loads: \`volatile\` also blocks the reordering \`,p\` scheduling would
otherwise do, which is exactly what hardware-register code depends on.

## Your task

Write \`twice_vol\` to reproduce the assembly above, using the provided
\`volatile int g_counter\`. Two \`lwz\` of the same global is the expected result —
not the CSE'd single load you'd see without \`volatile\`.
`,
    symbol: "twice_vol",
    context: `extern volatile int g_counter;
`,
    starter: `int twice_vol(void) {
    return 0;
}
`,
    solution: `int twice_vol(void) {
    return g_counter + g_counter;
}
`,
    hints: [
      "volatile forbids common-subexpression elimination, so each source read becomes its own load.",
      "Expect two `lwz` of g_counter then `add r3, r3, r0` — a plain int would load once and do `add r3, r0, r0`.",
    ],
  },
  {
    id: "advanced-volatile-hwreg",
    chapter: "advanced",
    order: 7,
    difficulty: 4,
    title: "Volatile Hardware Registers",
    concepts: ["volatile", "hardware-register", "vu32", "memory-mapped"],
    brief: `
# Reading a memory-mapped register

The GameCube exposes hardware through **memory-mapped registers** — fixed
addresses like \`0xCC003000\` where each read returns live device state. The
idiomatic access is a cast through a \`volatile\` pointer: \`*(vu32*)0xCC003000\`
(\`vu32\` is \`volatile u32\`). The \`volatile\` is load-bearing in the most literal
sense — without it, reading the register twice would CSE to one load and you'd
miss whatever changed between reads.

Two reads of the same hardware register therefore stay two reads:

\`\`\`asm
lis r3, 0xCC00      # build the high half of the address (shown as -13312)
lwz r0, 0x3000(r3)  # first read of the register
lwz r3, 0x3000(r3)  # SECOND read -- volatile keeps it
add r3, r0, r3
blr
\`\`\`

Note \`lis\` materializes the upper 16 bits of \`0xCC003000\` and the \`lwz\`
displacement carries the lower \`0x3000\`. (objdump prints the \`lis\` immediate as
the signed \`-13312\`: the bit pattern \`0xCC00\` is \`52224\` read unsigned but
\`-13312\` as a signed 16-bit value — \`lis\` shifts it left 16 to give
\`0xCC000000\`, and the \`0x3000\` displacement completes \`0xCC003000\`.) Every
access reloads. This repeated
load-from-a-fixed-address pattern, with no store between the loads, is the
signature of polling a hardware register — and recovering it means typing the
pointer \`volatile\`, not bolting on a workaround.

## Your task

Write \`read_status\` to match the assembly above. The \`vu32\` typedef is part
of the shared preamble. Both loads must survive as separate \`lwz\`.
`,
    symbol: "read_status",
    starter: `int read_status(void) {
    return 0;
}
`,
    solution: `int read_status(void) {
    int a = *(vu32*)0xCC003000;
    int b = *(vu32*)0xCC003000;
    return a + b;
}
`,
    hints: [
      "Cast the fixed address through `vu32` (volatile u32) so each dereference is a real load.",
      "Expect `lis r3, 0xCC00` then two `lwz r?, 0x3000(r3)` — the volatile prevents merging them.",
    ],
  },
  {
    id: "advanced-state-machine",
    chapter: "advanced",
    order: 8,
    difficulty: 5,
    title: "Capstone: A Volatile-Guarded Enum State Machine",
    concepts: ["switch", "jump-table", "enum", "volatile", "state-machine"],
    brief: `
# Putting the idioms together

Real engine code rarely shows one idiom at a time. A frame's state-machine step
might check a \`volatile\` abort flag, then dispatch on an \`enum\` state through a
\`switch\`. Each piece you've learned is visible in the asm — stacked:

\`\`\`asm
lwz    r0, g_abort@sda21(r2) # volatile read of the abort flag...
cmpwi  r0, 0
beq-   .run                  # ...not aborting -> proceed
li     r3, -1                # aborting -> bail with sentinel
blr
.run:
cmplwi r3, 7                 # enum-state switch on s (still in r3, first arg): bounds check (8 dense cases)
bgt-   .default
lis    r4, table@ha          # ...jump-table dispatch
slwi   r0, r3, 2
addi   r3, r4, table@lo
lwzx   r0, r3, r0
mtctr  r0
bctr                         # jump straight to the case for this state
\`\`\`

Three lessons in one fingerprint: the **\`volatile\` guard** (a single \`lwz\` of
the flag feeding a \`beq-\` early-return), the **enum** (the state arrives as a
plain 4-byte int — naming, no codegen cost), and the **jump table** (eight dense
states cross the threshold into \`cmplwi\`/\`lwzx\`/\`mtctr\`/\`bctr\`). Recovering
this means recognizing all three at once and writing each in its natural C form.

## Your task

Write \`step_state(GameState s)\`. First, if the provided \`volatile int g_abort\`
is non-zero, \`return -1\`. Otherwise \`switch\` on \`s\` over the eight \`GameState\`
values (\`ST_BOOT\`..\`ST_QUIT\`) returning \`1..8\` in order, with \`0\` by default.
The enum and \`g_abort\` are provided in context.
`,
    symbol: "step_state",
    context: `typedef enum {
    ST_BOOT, ST_INIT, ST_MENU, ST_LOAD, ST_PLAY, ST_PAUSE, ST_OVER, ST_QUIT
} GameState;
extern volatile int g_abort;
`,
    starter: `int step_state(GameState s) {
    return 0;
}
`,
    solution: `int step_state(GameState s) {
    if (g_abort) return -1;
    switch (s) {
        case ST_BOOT:  return 1;
        case ST_INIT:  return 2;
        case ST_MENU:  return 3;
        case ST_LOAD:  return 4;
        case ST_PLAY:  return 5;
        case ST_PAUSE: return 6;
        case ST_OVER:  return 7;
        case ST_QUIT:  return 8;
        default:       return 0;
    }
}
`,
    hints: [
      "The volatile g_abort read is one `lwz` feeding a `cmpwi`/`beq-` early return of -1.",
      "Eight dense enum cases dispatch through the jump table: `cmplwi 7`, `bgt-`, `lwzx`/`mtctr`/`bctr`.",
    ],
  },
];
