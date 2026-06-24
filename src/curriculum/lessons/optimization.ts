import { LessonSource } from "@/lib/lessons/types";

export const optimization: LessonSource[] = [
  {
    id: "optimization-o4p",
    chapter: "optimization",
    order: 1,
    title: "What -O4,p Actually Does",
    difficulty: 2,
    concepts: ["optimization-level", "scheduling", "mental-model"],
    brief: `
# The compiler that fights you back

Every lesson on this site is compiled at **\`-O4,p\`** — the most aggressive
setting MWCC GC/2.0 has. The \`4\` is the optimization *level* (full
inlining, common-subexpression elimination, strength reduction, loop work). The
\`,p\` means **optimize for the pipeline** — schedule instructions for the
Gekko's execution units rather than just for size. (The \`,p\` is an MWCC-specific
sub-flag; if you know GCC's \`-O\` levels, this comma syntax has no GCC
equivalent.)

This changes the whole game. At \`-O0\` the assembly mirrors your C line by line.
At \`-O4,p\` the compiler is allowed to **reorder**, **fuse**, **delete**, and
**rematerialize** instructions as long as the observable result is identical.
Two things follow:

- The instruction *order* in the binary often does **not** match the source
  order. The optimizer hoists independent work to hide latency.
- To byte-match, you don't fight the optimizer — you feed it C whose
  *optimized* form equals the target. That is the entire craft of this chapter.

Here are two independent loads-and-adds, then a multiply of the results:

\`\`\`asm
lwz   r6, 0(r3)    # all four loads hoisted to the top...
lwz   r5, 4(r3)
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r3, r6, r5   # ...then the two adds...
add   r0, r4, r0
mullw r3, r3, r0   # ...then the dependent multiply
blr
\`\`\`

Notice the four \`lwz\` are batched at the front even though the source computed
\`a\` fully before touching \`b\`. That batching is \`,p\` scheduling at work — we
dissect it next lesson.

## Your task

Write \`combine(int *p)\` returning \`(p[0] + p[1]) * (p[2] + p[3])\`. Write the
natural C and let \`-O4,p\` schedule it.
`,
    symbol: "combine",
    starter: `int combine(int *p) {
    return 0;
}
`,
    solution: `int combine(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
`,
    hints: [
      "Write the two sums as separate subexpressions and multiply them.",
      "The optimizer will hoist all four loads to the top on its own — you don't write that order.",
      "`(p[0]+p[1]) * (p[2]+p[3])` is enough; -O4,p does the scheduling.",
    ],
  },
  {
    id: "optimization-scheduling",
    chapter: "optimization",
    order: 2,
    title: "Instruction Scheduling: Hiding Latency",
    difficulty: 3,
    concepts: ["scheduling", "latency", "pipelining"],
    brief: `
# Why the order looks scrambled

A load from memory takes several cycles before its result is usable. If the very
next instruction needs that value, the pipeline **stalls**. The \`,p\` scheduler
avoids this by moving *independent* instructions into the gap — the CPU does
useful work while the load is in flight.

Consider two completely independent sums that are then multiplied. With
scheduling **off**, MWCC emits them in source order — compute \`a\`, then \`b\`:

\`\`\`asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0   # a = p[0]+p[1]
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0   # b = p[2]+p[3]
mullw r3, r5, r0
\`\`\`

With scheduling **on** (the default at \`-O4,p\`), all four loads are issued
first so their latencies overlap, *then* the adds run back to back:

\`\`\`asm
lwz   r6, 0(r3)
lwz   r5, 4(r3)
lwz   r4, 8(r3)    # loads batched — latencies overlap
lwz   r0, 12(r3)
add   r3, r6, r5
add   r0, r4, r0
mullw r3, r3, r0
\`\`\`

Same instructions, **different order and register coloring**. The coloring
isn't random: MWCC assigns registers *after* it has reordered, so a different
schedule yields a different live-range layout and therefore different register
numbers. When a target's order looks "interleaved" like this, it's the
scheduler — not a clue about the source. Your C stays simple; the scheduler
produces the shape.

## Your task

The body is the same \`combine2(int *p)\` returning
\`(p[0] + p[1]) * (p[2] + p[3])\` — but this time **reproduce the unscheduled,
source-order form** (the first listing above). You can't get there by rewriting
the C; the lever is the pragma. Put \`#pragma scheduling off\` before the
function so the loads stay next to the adds that consume them.
`,
    symbol: "combine2",
    starter: `int combine2(int *p) {
    return 0;
}
`,
    solution: `#pragma scheduling off
int combine2(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
`,
    hints: [
      "The C body is identical to the previous lesson — two sums, then a multiply.",
      "To freeze the loads in source order, add `#pragma scheduling off` on the line before the function.",
      "With scheduling off, each `add` sits right after its own pair of loads — matching the first listing in the brief.",
    ],
  },
  {
    id: "optimization-peephole-merge",
    chapter: "optimization",
    order: 3,
    title: "The Peephole Optimizer: Dot-Form Merging",
    difficulty: 3,
    concepts: ["peephole", "dot-form", "condition-register"],
    brief: `
# A compare that disappears into the instruction before it

After scheduling, a separate **peephole** pass scans short windows of
instructions and rewrites them. Its signature trick on PowerPC is **dot-form
merging**.

Most arithmetic/logical instructions have a *recording* variant whose mnemonic
ends in \`.\` (e.g. \`add.\`, \`and.\`, \`rlwinm.\`). The recording form sets condition
register field \`cr0\` as a side effect — exactly as if you had compared the
result against zero. So when you mask a value and then test it against zero, the
peephole optimizer folds the \`cmpwi ...,0\` **into** the masking instruction by
flipping it to its dot form:

\`\`\`asm
clrlwi. r0, r3, 24   # r0 = x & 0xFF, AND set cr0 from the result
beq-    L            # branch on that cr0 — no separate compare!
add     r5, r4, r0
\`\`\`

The \`.\` on \`clrlwi.\` is the whole story: the comparison against zero was
absorbed. One instruction now does the mask *and* the test. Recognizing a
trailing \`.\` as "this result also feeds a branch/select" is essential reading
skill — and reproducing it means writing C where the masked value is reused.

## Your task

Write \`pick(int x, int a, int b)\`: let \`y = x & 0xFF\`; return \`a + y\` when \`y\`
is non-zero, otherwise \`b\`. The optimizer will merge the mask and the test into
a single \`clrlwi.\`.
`,
    symbol: "pick",
    starter: `int pick(int x, int a, int b) {
    return 0;
}
`,
    solution: `int pick(int x, int a, int b) {
    int y = x & 0xFF;
    return y ? a + y : b;
}
`,
    hints: [
      "Compute `y = x & 0xFF` into a named local so it's reused.",
      "Use the ternary `y ? a + y : b` so the masked value both feeds the test and is added.",
      "Because `y` is tested against zero, `x & 0xFF` becomes `clrlwi.` with the compare merged in.",
    ],
  },
  {
    id: "optimization-peephole-off",
    chapter: "optimization",
    order: 4,
    title: "#pragma peephole off: Unfusing the Merge",
    difficulty: 4,
    concepts: ["peephole", "pragma", "dot-form"],
    brief: `
# When the target *kept* its separate compare

Sometimes the retail object was compiled with the peephole pass disabled for a
region, so the dot-merge from the last lesson **never happened**. You will see
a plain (non-dot) instruction followed by an explicit \`cmpwi ...,0\`. No C
rewrite reproduces that — the only lever is the same pragma the original author
used:

\`\`\`c
#pragma peephole off
/* ...function... */
#pragma peephole reset
\`\`\`

With the pragma in force, the very same body that merged before now keeps the
compare split out:

\`\`\`asm
clrlwi  r0, r3, 24    # mask — NOT the dot form
cmpwi   r0, 0         # explicit compare the peephole would have absorbed
beq-    L
add     r3, r4, r0
\`\`\`

Side by side, the only difference is the dot-merge:

\`\`\`asm
# peephole ON (lesson 3)   # peephole OFF (this lesson)
clrlwi. r0, r3, 24         clrlwi  r0, r3, 24
                           cmpwi   r0, 0
beq-    L                  beq-    L
\`\`\`

The \`.\` is gone and a whole \`cmpwi\` reappears. This is the canonical
\`peephole off\` signature. In real decomp you bracket a function (or a run of
them) and pair every \`off\` with a \`reset\`.

> The \`#pragma peephole off\` / \`reset\` lines are part of **both** the starter and
> the solution here, so you can focus on the body. They apply to the reference
> target too — that's how the target acquired its un-merged shape.

## Your task

Fill in the body of \`pick2\` (same logic as \`pick\`) so that, with peephole
disabled, you match the un-merged \`clrlwi\` + \`cmpwi\` + \`beq-\` sequence.
`,
    symbol: "pick2",
    starter: `#pragma peephole off
int pick2(int x, int a, int b) {
    return 0;
}
#pragma peephole reset
`,
    solution: `#pragma peephole off
int pick2(int x, int a, int b) {
    int y = x & 0xFF;
    return y ? a + y : b;
}
#pragma peephole reset
`,
    hints: [
      "The body is exactly the `pick` body — `int y = x & 0xFF; return y ? a + y : b;`.",
      "The pragma, not the C, changes the output: the mask stays plain and the compare is emitted separately.",
      "Leave the `#pragma peephole off`/`reset` lines exactly as given.",
    ],
  },
  {
    id: "optimization-scheduling-off",
    chapter: "optimization",
    order: 5,
    title: "#pragma scheduling off: Freezing the Order",
    difficulty: 4,
    concepts: ["scheduling", "pragma", "ordering"],
    brief: `
# Putting the instructions back in source order

The other half of the SFA pragma pair is **\`scheduling off\`**. It tells MWCC to
emit instructions in (essentially) source order instead of reordering them to
hide latency. When a target was built this way, the scheduled "loads-first"
shape you saw earlier **does not appear** — the loads sit right next to the work
that consumes them.

Same two-sums-times body as lesson 1, but with scheduling disabled:

\`\`\`asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0    # a computed immediately after its loads
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0    # b computed immediately after its loads
mullw r3, r5, r0
\`\`\`

The four loads are *not* batched; each pair sits with its \`add\`. That ordering —
and the different register coloring it produces — is the fingerprint of
\`scheduling off\`. As with peephole, you bracket the region and always pair
\`off\` with \`reset\`. The two pragmas are frequently used together around a whole
function in real decomp.

> The \`#pragma scheduling off\` / \`reset\` lines are supplied in both the starter
> and the solution, and apply to the target, so concentrate on the body.

## Your task

Write the body of \`combine3(int *p)\` returning \`(p[0]+p[1]) * (p[2]+p[3])\`.
With scheduling off, it must match the un-batched, source-order load layout.
`,
    symbol: "combine3",
    starter: `#pragma scheduling off
int combine3(int *p) {
    return 0;
}
#pragma scheduling reset
`,
    solution: `#pragma scheduling off
int combine3(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
#pragma scheduling reset
`,
    hints: [
      "Same body as the very first lesson: two sums, then multiply them.",
      "The pragma forces source order, so each `add` follows its own pair of loads.",
      "Keep the `#pragma scheduling off`/`reset` lines untouched.",
    ],
  },
  {
    id: "optimization-fp-scheduling",
    chapter: "optimization",
    order: 6,
    title: "Scheduling Floating-Point Work",
    difficulty: 4,
    concepts: ["scheduling", "floating-point", "latency"],
    brief: `
# FP latencies are long — so the scheduler tries hardest here

Floating-point loads and \`fmuls\` have multi-cycle latencies, so the \`,p\`
scheduler is most visibly active on FP code. Take a two-element dot product
\`a[0]*b[0] + a[1]*b[1]\`. Written the obvious way it would load a[0],b[0], multiply,
load a[1],b[1], multiply-add. The scheduler instead hoists a later load and
starts the second product *early*, weaving the two computations together:

\`\`\`asm
lfs    f1, 4(r3)     # a[1] loaded first
lfs    f0, 4(r4)     # b[1]
lfs    f2, 0(r3)     # a[0] slotted in behind
fmuls  f0, f1, f0    # a[1]*b[1] started before a[0]*b[0]
lfs    f1, 0(r4)     # b[0]
fmadds f1, f2, f1, f0
blr
\`\`\`

The loads and the two FP ops are **interleaved**, not grouped per term. This is
the same scheduler from lesson 2, but the payoff is larger because FP stalls are
longer.

Note that the \`fmadds\` here comes from \`fp_contract\` fusion, *not* from the
scheduler — they're two independent mechanisms that happen to both be on at
\`-O4,p\`. The next lesson covers \`fp_contract\` in detail; for now just notice it
exists so you don't attribute the fused multiply-add to scheduling.

When an FP target's loads look shuffled across the multiplies, suspect the
scheduler before you suspect an exotic source expression.

## Your task

Write \`dot2(f32 *a, f32 *b)\` to match the interleaved \`fmuls\`/\`fmadds\` assembly
above. Write it as the plain sum of two products and let the scheduler interleave.
`,
    symbol: "dot2",
    starter: `f32 dot2(f32 *a, f32 *b) {
    return 0.0f;
}
`,
    solution: `f32 dot2(f32 *a, f32 *b) {
    return a[0]*b[0] + a[1]*b[1];
}
`,
    hints: [
      "Just write `a[0]*b[0] + a[1]*b[1]` — one expression.",
      "Let the scheduler interleave the loads — no need to introduce temporaries to force an order.",
      "The `+` of two products becomes an `fmuls` plus an `fmadds`, with loads woven between them.",
    ],
  },
  {
    id: "optimization-fp-contract",
    chapter: "optimization",
    order: 7,
    title: "fp_contract: Fused Multiply-Add",
    difficulty: 3,
    concepts: ["floating-point", "fp_contract", "fmadds"],
    brief: `
# One instruction or two?

The Gekko has a **fused multiply-add**: \`fmadds f1, fA, fC, fB\` computes
\`fA*fC + fB\` in a single instruction (and a single rounding step). When
**\`fp_contract\`** is **on** — our default — MWCC contracts an \`a*b + c\` pattern
into exactly that:

\`\`\`asm
fmadds f1, f1, f2, f3   # a*b + c, fused
blr
\`\`\`

Turn \`fp_contract\` **off** and the compiler is forbidden from fusing; you get
the multiply and the add as **two** instructions with two roundings:

\`\`\`asm
fmuls f0, f1, f2        # a*b
fadds f1, f3, f0        # + c
blr
\`\`\`

This matters constantly in decomp: if a target shows a bare \`fmuls\` immediately
followed by \`fadds\` where you expected an \`fmadds\`, the original translation
unit very likely had \`fp_contract\` disabled. Reproduce it with the in-code
pragma rather than guessing at a different expression.

> The \`#pragma fp_contract off\` / \`reset\` lines are part of both the starter and
> the solution, and apply to the target, so just write the arithmetic body.

## Your task

Write \`madd(f32 a, f32 b, f32 c)\` so it compiles to the separate \`fmuls\` and
\`fadds\` above — not the fused \`fmadds\`.
`,
    symbol: "madd",
    starter: `#pragma fp_contract off
f32 madd(f32 a, f32 b, f32 c) {
    return 0.0f;
}
#pragma fp_contract reset
`,
    solution: `#pragma fp_contract off
f32 madd(f32 a, f32 b, f32 c) {
    return a*b + c;
}
#pragma fp_contract reset
`,
    hints: [
      "The body is simply `return a*b + c;`.",
      "Reordering to `c + a*b` won't dodge fusion — the pragma is what controls the split.",
      "With contraction off you get `fmuls` then `fadds`; with it on you'd get one `fmadds`.",
    ],
  },
  {
    id: "optimization-strength-reduction",
    chapter: "optimization",
    order: 8,
    title: "Strength Reduction in a Loop",
    difficulty: 4,
    concepts: ["strength-reduction", "loops", "induction-variable"],
    brief: `
# A multiply per iteration becomes one add per iteration

Inside a loop, \`i * K\` where \`i\` is the loop counter is a textbook target for
**strength reduction**. Instead of recomputing \`mulli ..., K\` every iteration,
the optimizer keeps a running value that starts at zero and increases by \`K\`
each pass — turning a multiply into a single add. (At \`-O4,p\` MWCC also unrolls
the hot path eight-wide, so the full function is large; the *idea* lives in the
remainder loop at the end.)

Don't be alarmed when your output runs to dozens of instructions: MWCC emits a
prologue that picks the eight-wide path when \`n\` is large, an unrolled body that
stores eight elements per pass — still a \`mulli\` per element there — under a
\`bdnz\`, and then the short tail loop below
that handles the leftover \`0..7\` elements one at a time. It's the tail loop where
the strength-reduced \`+= 12\` is cleanest, so that's what we show.

For \`dst[i] = i * 12\`, the tail loop shows the reduced form clearly:

\`\`\`asm
L:
  stw   r6, 0(r3)     # store the running product
  addi  r6, r6, 12    # product += 12  (was i*12, now just +12)
  addi  r3, r3, 4     # dst pointer also strength-reduced (+= 4)
  bdnz+ L
\`\`\`

There is no \`mulli\` in that loop body at all — both the value \`i*12\` and the
address \`&dst[i]\` became cheap induction variables incremented by a constant.
When you see a loop bumping a register by a fixed stride with no multiply in
sight, that's strength reduction, and the original C almost certainly used a
multiply or array index that *looked* expensive.

## Your task

Write \`fill(int *dst, int n)\` that sets \`dst[i] = i * 12\` for \`i\` in
\`0..n-1\`. Write the obvious multiply; \`-O4,p\` strength-reduces it for you.
`,
    symbol: "fill",
    starter: `void fill(int *dst, int n) {
}
`,
    solution: `void fill(int *dst, int n) {
    int i;
    for (i = 0; i < n; i++)
        dst[i] = i * 12;
}
`,
    hints: [
      "A simple `for (i = 0; i < n; i++) dst[i] = i * 12;` is all you write.",
      "Let the optimizer reduce it — matching the target requires the natural multiply form you'd write by hand.",
      "Expect heavy unrolling plus a tail loop that increments by 12 with no `mulli`.",
    ],
  },
  {
    id: "optimization-cse",
    chapter: "optimization",
    order: 9,
    title: "Common-Subexpression Elimination",
    difficulty: 3,
    concepts: ["cse", "redundancy", "optimization-level"],
    brief: `
# Compute it once, use it twice

When the same expression appears more than once and nothing in between can change
its value, \`-O4\` computes it **once** and reuses the result. This is
**common-subexpression elimination (CSE)**. It's why a target may contain *fewer*
arithmetic instructions than your source literally spelled out.

Write \`a / b\` twice in one expression and a simpler compiler would emit two
\`divw\`s (division is expensive). MWCC emits exactly one:

\`\`\`asm
divw  r3, r3, r4    # q = a / b   — computed ONCE
mulli r0, r3, 7     # q * 7
add   r3, r3, r0    # q + q*7
blr
\`\`\`

The second \`a / b\` reused \`r3\`; there is no second \`divw\`. When a target has one
copy of an expensive op but your C "uses it twice," don't add a temporary to
force two — write it naturally and trust CSE to collapse the duplicate, exactly
as the original author relied on it to.

One precondition, though: CSE only fires when nothing between the two uses can
change the value. An intervening store, a \`volatile\`, or a write through a
possibly-aliasing pointer all block it, and you'll see the expensive op appear
twice. So a single \`divw\` standing in for two source uses tells you the region
was side-effect-free between them — don't over-generalize the pattern to loops
or pointer writes where the compiler can't prove that.

## Your task

Write \`reuse(int a, int b)\` to match the assembly above — a single \`divw\` whose
result feeds both the add and the \`mulli\`.
`,
    symbol: "reuse",
    starter: `int reuse(int a, int b) {
    return 0;
}
`,
    solution: `int reuse(int a, int b) {
    return (a / b) + (a / b) * 7;
}
`,
    hints: [
      "Reading direction: one `divw` whose result is used twice means the source had two uses of `a / b` that CSE folded into one.",
      "So write the expression literally with `a / b` appearing twice — don't introduce a temporary.",
      "The single quotient is then reused by the `* 7` and the final add.",
    ],
  },
  {
    id: "optimization-capstone",
    chapter: "optimization",
    order: 10,
    title: "Capstone: Scheduling Meets fp_contract",
    difficulty: 5,
    concepts: ["scheduling", "fp_contract", "capstone", "lerp"],
    brief: `
# Everything at once

Time to combine the chapter. A linear interpolation \`a + (b - a) * t\` is the
beating heart of game code (it's literally what SFA's lighting lerps do). Do two
of them and add the results, and three optimizations fire together:

- **fp_contract** fuses each \`a + (b - a) * t\` so the final \`*t + a\` becomes one
  \`fmadds\` (after the \`fsubs\` for \`b - a\`).
- **scheduling** hoists all four \`lfs\` loads to the front and **interleaves** the
  two lerps so their latencies overlap.
- the whole thing stays branch-free and tightly register-allocated thanks to
  \`-O4\`.

At our default \`-O4,p\` with \`fp_contract on\`, the two lerps come out woven
together:

\`\`\`asm
lfs    f4, 0(r3)      # a[0]
lfs    f2, 0(r4)      # b[0]
lfs    f3, 4(r3)      # a[1]   — loads batched up front
lfs    f0, 4(r4)      # b[1]
fsubs  f2, f2, f4     # lerp0: b[0]-a[0]
fsubs  f0, f0, f3     # lerp1: b[1]-a[1]   — interleaved with lerp0
fmadds f2, f1, f2, f4 # lerp0: a[0] + (b[0]-a[0])*t   (fused)
fmadds f0, f1, f0, f3 # lerp1: a[1] + (b[1]-a[1])*t   (fused)
fadds  f1, f2, f0     # lerp0 + lerp1
blr
\`\`\`

Had this unit used \`#pragma scheduling off\`, the two lerps would appear as two
*separate* sequential blocks (load–load–fsubs–fmadds, then again) instead of the
interleaved form above — the exact distinction this chapter trains you to spot.

## Your task

Write \`blend(f32 *a, f32 *b, f32 t)\` returning
\`(a[0] + (b[0]-a[0])*t) + (a[1] + (b[1]-a[1])*t)\`. Write the two lerps plainly
and let the optimizer fuse and interleave.
`,
    symbol: "blend",
    starter: `f32 blend(f32 *a, f32 *b, f32 t) {
    return 0.0f;
}
`,
    solution: `f32 blend(f32 *a, f32 *b, f32 t) {
    f32 x = a[0] + (b[0] - a[0]) * t;
    f32 y = a[1] + (b[1] - a[1]) * t;
    return x + y;
}
`,
    hints: [
      "Write each lerp as `a[i] + (b[i] - a[i]) * t` and sum the two.",
      "fp_contract turns each `... * t + a[i]` into an `fmadds` — let the compiler do the fusion.",
      "The scheduler batches the four loads and interleaves the two lerps — write the math naturally, and the order will follow.",
    ],
  },
];
