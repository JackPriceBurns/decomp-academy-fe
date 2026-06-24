import { LessonSource } from "@/lib/lessons/types";

export const loops: LessonSource[] = [
  {
    id: "loops-for-sum",
    chapter: "loops",
    order: 1,
    title: "The Anatomy of a Counted Loop",
    difficulty: 1,
    concepts: ["for-loop", "induction-variable", "control-flow"],
    brief: `
# A loop is just a backward branch

Until now every function ran straight down to its \`blr\`. A loop adds one new
idea: a **branch that jumps backwards** so the same instructions run again. The
classic shape MWCC emits for a \`for\` loop puts the **test at the bottom**: the
body sits in the middle, the comparison and the conditional branch sit at the
*bottom*, and a single unconditional \`b\` at the top jumps *into* that test
first. That leading \`b\` is what makes the loop behave as **pre-tested** — the
condition is checked before the body ever runs, so the zero-iteration case is
handled. (Two names, one shape: the test is *physically* at the bottom, but
*behaviorally* the loop is pre-tested thanks to that jump-to-test at the top.)

\`\`\`asm
li   r0, 0          # s = 0
li   r4, 0          # i = 0
b    test           # jump straight to the test (pre-test)
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
test:
cmpw r4, r3         # i < n ?
blt+ body           # if so, go round again
mr   r3, r0         # return s
blr
\`\`\`

The variable \`i\` that drives the loop is its **induction variable**. Notice the
test is at the bottom, reached first via that leading \`b\` — if \`n <= 0\` the body
never runs.

> **A note on optimization.** At the project's full \`-O4,p\` setting MWCC would
> *unroll* this tiny sum into a long pipelined mess, because it can compute the
> trip count in advance. To study the clean loop skeleton we dial the optimizer
> down one notch with \`#pragma optimization_level 1\`. Keep that pragma in your
> answer — it is part of the target.

## Your task

Write \`sum\`, returning the sum \`0 + 1 + ... + (n-1)\`.
`,
    symbol: "sum",
    starter: `#pragma optimization_level 1
int sum(int n) {
    // accumulate 0 + 1 + ... + (n-1)
    return 0;
}
`,
    solution: `#pragma optimization_level 1
int sum(int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) s += i;
    return s;
}
`,
    hints: [
      "Declare an accumulator `s = 0` and an induction variable `i`.",
      "A standard `for (i = 0; i < n; i++) s += i;` is exactly this skeleton.",
      "The leading `b` to the test means a zero-or-negative `n` runs the body zero times.",
    ],
  },
  {
    id: "loops-while-equivalence",
    chapter: "loops",
    order: 2,
    title: "While Is the Same Loop",
    difficulty: 1,
    concepts: ["while-loop", "for-loop", "control-flow"],
    brief: `
# \`for\` and \`while\` compile identically

A \`for\` loop is pure syntactic sugar. Once you hoist the initializer above the
loop and drop the increment at the bottom of the body, a \`for\` *is* a \`while\`.
The compiler erases the distinction completely — both produce the exact same
**pre-tested, bottom-branching** skeleton:

\`\`\`asm
li   r4, 0          # i = 0
li   r0, 0          # s = 0
b    test           # pre-test
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
test:
cmpw r4, r3         # i < n ?
blt+ body
mr   r3, r0
blr
\`\`\`

This is worth internalizing as a decompiler: when you see this shape you cannot
tell from the asm alone whether the dev wrote \`for\` or \`while\`. A simple rule:
prefer \`for\` when a counter is explicit (\`for (i = 0; i < n; i++)\`), and
\`while\` when the condition reads more naturally as a standalone predicate. The
compiler does not care and neither does the diff tool — the match is identical
either way.

> Same as before, we keep \`#pragma optimization_level 1\` so the loop stays
> rolled instead of being unrolled.

## Your task

Write \`sum\` again, but this time express it as a \`while\` loop. It must produce
byte-for-byte the same code as the \`for\` version.
`,
    symbol: "sum",
    starter: `#pragma optimization_level 1
int sum(int n) {
    int i = 0, s = 0;
    // turn this into a while loop
    return s;
}
`,
    solution: `#pragma optimization_level 1
int sum(int n) {
    int i = 0, s = 0;
    while (i < n) {
        s += i;
        i++;
    }
    return s;
}
`,
    hints: [
      "Initialize `i` and `s` before the loop, then `while (i < n) { s += i; i++; }`.",
      "Keep the increment as the last statement of the body — that mirrors the `for`.",
      "The emitted asm is identical to the `for` lesson; `for` and `while` are the same loop.",
    ],
  },
  {
    id: "loops-do-while",
    chapter: "loops",
    order: 3,
    title: "Do-While: The Tightest Loop",
    difficulty: 2,
    concepts: ["do-while", "control-flow", "branch-elimination"],
    brief: `
# One branch, none wasted

A \`do { } while ()\` loop always runs its body **at least once**, so the compiler
doesn't need the pre-test. That leading \`b test\` from the \`for\`/\`while\` shape
*disappears*. What's left is the tightest possible loop: body, test, branch back
— a single conditional branch and nothing else:

\`\`\`asm
li   r4, 0          # i = 0
li   r0, 0          # s = 0
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
cmpw r4, r3         # i < n ?
blt+ body           # only branch in the whole loop
mr   r3, r0
blr
\`\`\`

Because this form is so clean, MWCC at full \`-O4,p\` is happy to leave it rolled —
no \`#pragma\` needed here. When you spot a loop with **no pre-test branch at the
top**, the original was almost certainly a \`do\`/\`while\` — or a loop where the
author had reason to guarantee the body would run.

> **A caution on semantics.** A \`do\`/\`while\` runs the body even when the guard
> is false on entry. For this sum that happens to be harmless — \`n == 0\` runs
> the body once (\`s += 0\`, \`i\` becomes 1), then \`1 < 0\` is false and we return
> 0, which is still correct, but only by accident of the arithmetic. In real
> decompilation you choose \`do\`/\`while\` only when you can confirm the loop is
> always entered at least once — often because a caller-side check guarantees
> \`n\` is positive. Don't reach for it just to drop the pre-test branch.

## Your task

Write \`sum\` as a \`do\`/\`while\` loop. Assume the body always runs at least once.
`,
    symbol: "sum",
    starter: `int sum(int n) {
    int i = 0, s = 0;
    // use a do/while loop
    return s;
}
`,
    solution: `int sum(int n) {
    int i = 0, s = 0;
    do {
        s += i;
        i++;
    } while (i < n);
    return s;
}
`,
    hints: [
      "`do { s += i; i++; } while (i < n);` puts the test at the bottom only.",
      "There is no leading `b` — the body is entered directly, then the branch loops back.",
      "This is the canonical tight loop: body, compare, conditional branch.",
    ],
  },
  {
    id: "loops-countdown",
    chapter: "loops",
    order: 4,
    title: "Counting Down Is Cheaper",
    difficulty: 2,
    concepts: ["countdown", "induction-variable", "immediates"],
    brief: `
# Compare against zero, not a bound

Counting *up* to \`n\` forces the loop test to compare the induction variable
against \`n\` — a register-to-register \`cmpw\`. Counting *down* to zero lets the
compiler compare against the constant 0 instead, using the immediate form
\`cmpwi rA, 0\`. There is no separate bound to keep live, so the loop is a touch
cheaper and the variable can double as both counter and value:

\`\`\`asm
li   r0, 0          # s = 0
b    test
body:
add  r0, r0, r3     # s += n
addi r3, r3, -1     # n--
test:
cmpwi r3, 0         # n > 0 ?  (compare against immediate 0)
bgt+ body
mr   r3, r0
blr
\`\`\`

This is why hand-tuned 2002 game code so often counts down: \`cmpwi rX, 0\` needs
no register for the limit. Recognizing a downward-counting loop and rewriting it
as \`for (i = n; i > 0; i--)\` is a common matching move.

> A count-down in the asm does **not** always mean the developer wrote one.
> Optimizing compilers will sometimes flip a count-up loop into count-down form
> for exactly this reason, so don't reflexively assume the source counted down —
> match what the asm shows, and reach for count-down in your own C only when it
> is what reproduces the target.

> \`#pragma optimization_level 1\` again keeps the loop from unrolling.

## Your task

Write \`sum\`, returning \`n + (n-1) + ... + 1\` by counting **down** from \`n\`.
`,
    symbol: "sum",
    starter: `#pragma optimization_level 1
int sum(int n) {
    int s = 0;
    // count down from n to 1
    return s;
}
`,
    solution: `#pragma optimization_level 1
int sum(int n) {
    int s = 0;
    for (; n > 0; n--) s += n;
    return s;
}
`,
    hints: [
      "Loop `for (; n > 0; n--)` and accumulate `s += n` — reuse `n` itself as the counter.",
      "Counting down lets the test be `cmpwi r3, 0` instead of a register compare.",
      "The decrement is `addi r3, r3, -1`; the test is `bgt+`.",
    ],
  },
  {
    id: "loops-array-sum",
    chapter: "loops",
    order: 5,
    title: "Walking an Array by Index",
    difficulty: 2,
    concepts: ["arrays", "indexed-load", "addressing"],
    brief: `
# \`a[i]\` means scale, then load

To read \`a[i]\` where \`a\` is an \`int*\`, the address is \`a + i*4\`. The compiler
scales the index with \`slwi r0, r5, 2\` (\`i * 4\`) and then uses the **indexed
load** \`lwzx rD, rA, rB\`, which loads from \`rA + rB\` in one instruction:

\`\`\`asm
li   r6, 0          # s = 0
li   r5, 0          # i = 0
b    test
body:
slwi r0, r5, 2      # i * 4
addi r5, r5, 1      # i++
lwzx r0, r3, r0     # load a[i]  (from a + i*4)
add  r6, r6, r0     # s += a[i]
test:
cmpw r5, r4         # i < n ?
blt+ body
mr   r3, r6
blr
\`\`\`

The array pointer \`a\` arrives in \`r3\` and the length \`n\` in \`r4\` — no globals,
just the two arguments. Note the \`slwi\`+\`lwzx\` pair recomputing the address from
scratch every iteration; the final lesson of this chapter shows how the compiler
can eliminate that multiply entirely.

> \`#pragma optimization_level 1\` keeps the index-based loop rolled and readable.

## Your task

Write \`sum\`, returning the sum of the first \`n\` elements of \`a\`.
`,
    symbol: "sum",
    starter: `#pragma optimization_level 1
int sum(int *a, int n) {
    int i, s = 0;
    // sum a[0..n-1]
    return s;
}
`,
    solution: `#pragma optimization_level 1
int sum(int *a, int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) s += a[i];
    return s;
}
`,
    hints: [
      "`a` is in r3, `n` is in r4 — take them straight as parameters.",
      "`for (i = 0; i < n; i++) s += a[i];` is the whole function.",
      "Indexing `a[i]` becomes `slwi` (scale by 4) followed by `lwzx` (indexed load).",
    ],
  },
  {
    id: "loops-array-max",
    chapter: "loops",
    order: 6,
    title: "Finding the Maximum",
    difficulty: 3,
    concepts: ["arrays", "ctr-loop", "conditional-update"],
    brief: `
# A known trip count uses the count register

This loop scans \`a[1..n-1]\` keeping the largest value seen. Because the trip
count (\`n - 1\`) is known *before* the loop starts, MWCC loads it into the special
**count register** with \`mtctr\` and uses \`bdnz\` ("decrement CTR, branch if
non-zero") as the loop branch — no explicit counter compare needed. The body
itself is data-dependent (it only updates \`m\` when \`a[i] > m\`), so the loop stays
rolled even at full \`-O4,p\`:

\`\`\`asm
addi r0, r4, -1     # trip count = n - 1
addi r5, r3, 4      # p = &a[1]
lwz  r3, 0(r3)      # m = a[0]
mtctr r0            # CTR = n - 1
cmpwi r4, 1
blelr-              # if n <= 1, return a[0]
body:
lwz  r0, 0(r5)      # x = a[i]
cmpw r0, r3         # x > m ?
ble- skip
mr   r3, r0         #   m = x
skip:
addi r5, r5, 4      # advance pointer
bdnz+ body          # CTR--, loop while non-zero
blr
\`\`\`

Two idioms to bank: \`mtctr\`/\`bdnz\` is *the* signature of a counted loop with a
precomputed trip count, and \`blelr-\` is "compare-then-return" fused into the
early exit. Keep the \`mtctr\`/\`bdnz\` pair in mind — it returns in the break
lesson, where the same count register drives a loop that also has an early exit.

## Your task

Write \`amax\`, returning the largest of the \`n\` elements of \`a\` (assume \`n >= 1\`).
`,
    symbol: "amax",
    starter: `int amax(int *a, int n) {
    int i, m = a[0];
    // keep the largest element
    return m;
}
`,
    solution: `int amax(int *a, int n) {
    int i, m = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] > m) m = a[i];
    }
    return m;
}
`,
    hints: [
      "Seed `m = a[0]`, then loop `i` from 1 to `n-1`.",
      "Update conditionally: `if (a[i] > m) m = a[i];` becomes a compare and a `mr`.",
      "A known trip count makes MWCC use `mtctr` / `bdnz` for the loop.",
    ],
  },
  {
    id: "loops-strlen",
    chapter: "loops",
    order: 7,
    title: "Walking a Pointer to a Sentinel",
    difficulty: 3,
    concepts: ["pointers", "sentinel", "byte-load"],
    brief: `
# No counter, just a moving pointer

Some loops have no numeric bound at all — they advance a pointer until they hit a
**sentinel** value, like the \`'\\0'\` that terminates a C string. Here there is no
induction integer; the pointer in \`r3\` *is* the loop state. Each iteration loads
a byte with \`lbz\` (load byte, zero-extended), tests it, and bumps the pointer:

\`\`\`asm
li   r4, 0          # n = 0
b    test
body:
addi r4, r4, 1      # n++
addi r3, r3, 1      # p++
test:
lbz  r0, 0(r3)      # *p
cmplwi r0, 0        # *p != 0 ?   (unsigned compare)
bne+ body
mr   r3, r4
blr
\`\`\`

Two things to notice. The byte load is \`lbz\` because the data is \`u8\`, and the
test is \`cmplwi\` — an *unsigned* compare, because \`u8\` is unsigned. Typing the
pointer as \`u8*\` (not \`char*\`) is what keeps the load clean with no sign-extend.

\`u8\` is the project's own name for an unsigned byte — \`typedef unsigned char
u8;\` from a shared header, the same \`u8\`/\`u16\`/\`u32\` convention nearly every GC
decompilation uses. It matters here: \`char\` would invite a sign-extending load,
giving subtly different asm, so reach for the exact project type the target was
built with.

## Your task

Write \`slen\`, counting bytes until the zero terminator (a from-scratch \`strlen\`).
\`p\` is a \`u8*\`.
`,
    symbol: "slen",
    starter: `int slen(u8 *p) {
    int n = 0;
    // advance until *p == 0
    return n;
}
`,
    solution: `int slen(u8 *p) {
    int n = 0;
    while (*p) {
        n++;
        p++;
    }
    return n;
}
`,
    hints: [
      "Loop `while (*p) { n++; p++; }` — the pointer itself is the loop state.",
      "A `u8` load is `lbz`; comparing an unsigned byte gives `cmplwi`, not `cmpwi`.",
      "Keep `p` typed as `u8*` so no sign-extension creeps in.",
    ],
  },
  {
    id: "loops-break",
    chapter: "loops",
    order: 8,
    title: "Breaking Out Early",
    difficulty: 3,
    concepts: ["break", "early-exit", "linear-search"],
    brief: `
# Two ways out of one loop

A \`break\` gives a loop a *second* exit. This linear search runs a counted loop
(so MWCC still uses \`mtctr\`/\`bdnz\` for the normal termination) but adds an inner
\`beq-\` that jumps straight out the moment it finds \`k\`. Both exits land on the
same \`mr r3, r6\` that returns the index \`i\`:

\`\`\`asm
li   r6, 0          # i = 0
mtctr r4            # CTR = n
cmpwi r4, 0
ble- done           # n <= 0: skip loop entirely
body:
lwz  r0, 0(r3)      # a[i]
cmpw r5, r0         # a[i] == k ?
beq- done           # break: jump out early
addi r3, r3, 4      # advance pointer
addi r6, r6, 1      # i++
bdnz+ body          # otherwise keep counting
done:
mr   r3, r6         # return i (the found index, or n)
blr
\`\`\`

When you see a loop with a CTR-driven \`bdnz\` *and* an extra conditional branch
out of the middle, that middle branch is your \`break\`. If \`k\` is never found the
loop falls through normally with \`i == n\`.

## Your task

Write \`find\`, returning the index of the first element of \`a\` equal to \`k\`, or
\`n\` if there is none.
`,
    symbol: "find",
    starter: `int find(int *a, int n, int k) {
    int i;  /* the for loop you write below sets i; it holds the answer */
    // return the first index where a[i] == k, else n
    return i;
}
`,
    solution: `int find(int *a, int n, int k) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == k) break;
    }
    return i;
}
`,
    hints: [
      "A plain counted `for` with `if (a[i] == k) break;` inside.",
      "When `k` is found, `break` leaves the loop with `i` holding the index.",
      "If the loop finishes normally `i == n`, which is the not-found answer.",
    ],
  },
  {
    id: "loops-anatomy-model",
    chapter: "loops",
    order: 8.5,
    title: "A Mental Model: The Five Parts of a Loop",
    difficulty: 2,
    concepts: ["control-flow", "break", "continue", "mental-model"],
    concept: true,
    brief: `
# One model for every loop

The earlier lessons matched specific \`for\`/\`while\`/\`do\` loops. Once you've seen a
few, it pays to carry a single mental model: **any** compiled loop decomposes
into the same five labelled regions. Name them and a wall of branches turns into
a flowchart.

- **\`pre_loop\`** — runs once before the loop: initialise the induction variable,
  then (for a pre-tested loop) an unconditional \`b loop_cond\` so the condition is
  checked *before* the first body.
- **\`loop_body\`** — the work. This is where \`break\` and \`continue\` originate.
- **\`loop_incrementer\`** — where the induction variable advances. A \`for\` loop
  has one; a \`while\`/\`do\` folds the step into the body.
- **\`loop_cond\`** — the test plus the backward branch to \`loop_body\`.
- **\`post_loop\`** — the first instruction *after* the loop: control lands here
  when the condition finally fails, or when a \`break\` jumps out.

## Read the wiring straight from the asm

You don't need the source to find the five regions — the branches themselves
give them away. There are only four connections to trace:

- **\`pre_loop\` branches to \`loop_cond\`.** That leading unconditional \`b\` is the
  jump-to-test, so it points straight at the condition.
- **\`loop_body\` falls through into \`loop_incrementer\`.** No branch between them;
  the body runs off its bottom edge into the step.
- **\`loop_incrementer\` falls through into \`loop_cond\`.** The step runs off its
  bottom edge into the test.
- **\`loop_cond\` branches back to \`loop_body\` when the condition holds, and falls
  through into \`post_loop\` when it fails.** That conditional branch is your
  anchor: its target is the top of the body, the instruction after it is
  \`post_loop\`.

So the recipe is mechanical. Find the **backward conditional branch** first — its
target is \`loop_body\`. Trace the unconditional \`b\` that jumps *into* the test to
find \`pre_loop\`. Everything the condition reads is \`loop_cond\`, and the
fall-through past it is \`post_loop\`. Label those once and the rest of the function
is just straight-line code wrapped around them.

## break and continue are just branches

\`\`\`asm
loop_body:
    cmpwi r3, 0
    bne-  skip_continue
    b     loop_incrementer   # 'continue' -> jump to the step, then re-test
skip_continue:
    cmpwi r3, 2
    bne-  skip_break
    b     post_loop          # 'break' -> leave the loop entirely
skip_break:
    ...
\`\`\`

A **\`continue\`** branches forward to \`loop_incrementer\` (in a \`for\`) or straight
to \`loop_cond\` (in a \`while\`); a **\`break\`** branches to \`post_loop\`. That's the
whole trick — once you can label the five regions, every \`break\`/\`continue\`
target is obvious.

## The three forms differ only in wiring

- **\`do/while\`** — no jump-to-test in \`pre_loop\`; the body always runs once, then
  \`loop_cond\` at the bottom decides whether to repeat. The simplest shape.
- **\`while\`** — \`pre_loop\` adds the leading \`b loop_cond\` so a zero-iteration case
  is handled; \`continue\` targets \`loop_cond\`.
- **\`for\`** — same as \`while\` but with a distinct \`loop_incrementer\`; \`continue\`
  now targets the incrementer, *not* the condition.

## The count-register variant

When the compiler can precompute the trip count, it may track it in the **count
register** and merge \`loop_incrementer\` and \`loop_cond\` into a single
**\`bdnz\`** ("branch if decremented CTR is not zero"). The explicit compare
disappears, which is why Ghidra and IDA often mis-label these as an
\`if\`-guarded \`do/while\` — but it's still just the same five-part loop with two
of its parts fused into one instruction.

## A worked example: recovering a compound condition

Labelling isn't busywork — it's often the *entire* insight that makes a function
match. Here is a real loop (a \`find_if\`-style scan), prologue and epilogue
stripped, with the five regions written in:

\`\`\`asm
        b       loop_cond        # pre_loop: p = mKillers.begin(); jump to test
loop_incrementer:
        addi    r30, r30, 4      #   p++
loop_cond:
        cmplw   r30, r29         #   p != end ?
        beq     post_loop        #     equal -> leave the loop     (clause A fails)
        mr      r12, r31
        lwz     r3, 0(r30)       #   load *p
        mtctr   r12
        bctrl                    #   call isDead(*p)
        cmpwi   r3, 0
        bne+    loop_incrementer #   isDead -> go round again       (clause B holds)
post_loop:
        subf    r3, r30, r29     # p - end
\`\`\`

\`loop_body\` is empty here, so the \`bne+\` jumps straight to \`loop_incrementer\`. The
payoff is in reading the **condition** off the labels. Notice \`loop_cond\` leaves
the loop in *two* places: the \`beq post_loop\` near the top, and the fall-through
after \`bne+\` at the bottom. Two exits out of one test means two clauses joined
with \`&&\` — the loop keeps going only while \`p != end\` **and** \`isDead(*p)\`:

\`\`\`cpp
// real game code is often C++, but the labelling technique is identical
for (p = mKillers.begin(); p != end && isDead(*p); p++) {}
return p != end;
\`\`\`

Miss that the test is compound and you reach for the obvious-looking shape
instead — a plain \`p != end\` loop with the \`isDead\` check as an \`if (...) break;\`
inside the body. It *looks* equivalent, but it reorders the compare and the call
and re-tests \`p != end\` in a different spot, so it doesn't match. On a real GC
function that single insight — that \`loop_cond\` held both clauses — was the
difference between a **76%** attempt and a **97%** one. The labels did the work:
once you've circled \`loop_cond\`, every branch leaving it is a clause of the \`&&\`.

There's no exercise here — keep the five-part map in your head and the next time
a loop's control flow looks like spaghetti, label the regions first.
`,
    symbol: "",
    starter: "",
    solution: "",
    hints: [],
  },
  {
    id: "loops-nested",
    chapter: "loops",
    order: 9,
    title: "Nested Loops",
    difficulty: 4,
    concepts: ["nested-loops", "multiply", "control-flow"],
    brief: `
# A loop inside a loop

Nesting just stacks two skeletons: the outer loop's body *is* the inner loop. The
inner counter \`j\` is re-initialized to 0 at the top of every outer pass, and the
outer counter \`i\` only advances after the inner loop completes. Each shape is the
same pre-tested loop you already know:

\`\`\`asm
li   r6, 0          # s = 0
li   r4, 0          # i = 0
b    otest
obody:
li   r5, 0          # j = 0   (reset every outer pass)
b    itest
ibody:
mullw r0, r4, r5    # i * j
addi r5, r5, 1      # j++
add  r6, r6, r0     # s += i*j
itest:
cmpw r5, r3         # j < n ?
blt+ ibody
addi r4, r4, 1      # i++
otest:
cmpw r4, r3         # i < n ?
blt+ obody
mr   r3, r6
blr
\`\`\`

The product \`i * j\` is a *variable* multiply, so it lands on \`mullw\` (no shift
trick is possible). The giveaway for nesting is that inner-counter reset (\`li r5,
0\`) sitting inside the outer body.

> \`#pragma optimization_level 1\` keeps both loops rolled.

## Your task

Write \`grid\`, returning the sum of \`i * j\` over all \`0 <= i < n\` and \`0 <= j < n\`.
`,
    symbol: "grid",
    starter: `#pragma optimization_level 1
int grid(int n) {
    int i, j, s = 0;
    // sum i*j over the n-by-n grid
    return s;
}
`,
    solution: `#pragma optimization_level 1
int grid(int n) {
    int i, j, s = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            s += i * j;
        }
    }
    return s;
}
`,
    hints: [
      "Two stacked `for` loops; accumulate `s += i * j` in the inner body.",
      "`j` is reset to 0 at the start of each outer iteration — that's the `li r5, 0` inside.",
      "`i * j` is a variable multiply, so it compiles to `mullw`.",
    ],
  },
  {
    id: "loops-strength-reduction",
    chapter: "loops",
    order: 10,
    title: "Strength-Reduced Induction",
    difficulty: 4,
    concepts: ["strength-reduction", "induction-variable", "pointers"],
    brief: `
# The multiply that vanishes

In lesson 5 every \`a[i]\` cost a \`slwi\` (scale \`i\` by 4) plus an \`lwzx\`. But the
addresses \`a[0], a[1], a[2], ...\` form an arithmetic sequence — each is exactly 4
bytes past the last. The compiler exploits this with **strength reduction on the
induction variable**: instead of recomputing \`a + i*4\` from \`i\` each time, it
keeps a *pointer* and advances it by 4. The multiply disappears entirely, leaving
a plain \`lwz 0(r3)\` and an \`addi r3, r3, 4\`:

\`\`\`asm
li   r4, 0          # n = 0
b    test
body:
addi r3, r3, 4      # p++  (one int = 4 bytes)
addi r4, r4, 1      # n++
test:
lwz  r0, 0(r3)      # a[n]  -> just *p, no scaling
cmpwi r0, 0         # a[n] != 0 ?
bne+ body
mr   r3, r4
blr
\`\`\`

Even though the C source still *indexes* with \`a[n]\`, there is no \`slwi\` and no
\`lwzx\` — the address advances by a constant 4 each pass. This is one of the most
useful loop idioms to recognize: when you see a pointer marching by a fixed
stride with no per-iteration multiply, the original C was very likely an
*indexed* array access that the compiler strength-reduced.

One detail surprises people: the \`addi r3, r3, 4\` sits *above* the \`lwz\`, so it
looks like the pointer advances *before* the load. It does — but only on
repeat passes. This is the same bottom-tested shape from lesson 1: the leading
\`b test\` jumps **past** that \`addi\` on first entry, so iteration 0 loads
\`a[0]\` with \`r3\` still pointing at the array head. Only when \`bne+\` branches
back to \`body\` does the increment run, advancing to \`a[1]\`, \`a[2]\`, and so on.
Read top-to-bottom it is "advance, load, test, branch"; the first iteration just
skips the advance.

## Your task

Write \`count\`, returning how many elements precede the first zero in \`a\` (the
length of a zero-terminated \`int\` array). Index with \`a[n]\` and let the compiler
turn it into a marching pointer.
`,
    symbol: "count",
    starter: `int count(int *a) {
    int n = 0;
    // advance n until a[n] == 0
    return n;
}
`,
    solution: `int count(int *a) {
    int n = 0;
    while (a[n]) n++;
    return n;
}
`,
    hints: [
      "`while (a[n]) n++;` — write the index access, not pointer arithmetic.",
      "Because the address advances by a constant 4, MWCC keeps a pointer and uses `addi r3, r3, 4`.",
      "The result is a plain `lwz 0(r3)` with no `slwi` and no `lwzx` — the multiply is strength-reduced away.",
    ],
  },
];
