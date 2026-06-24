import { LessonSource } from "@/lib/lessons/types";

export const control: LessonSource[] = [
  {
    id: "control-eq-bool",
    chapter: "control",
    order: 1,
    title: "Returning a Comparison as a Bool",
    difficulty: 1,
    concepts: ["comparison", "boolean", "idiom"],
    brief: `
# A comparison with no branch in sight

When a function *returns* \`a == b\`, the result is a 0/1 integer, not a jump.
MWCC has a slick branchless idiom for equality. It subtracts the two values —
the difference is zero exactly when they're equal — then counts the leading
zero bits and shifts:

\`\`\`asm
subf   r0, r3, r4    # r0 = b - a   (zero iff a == b)
cntlzw r0, r0        # count leading zeros: 32 if r0==0, else < 32
srwi   r3, r0, 5     # r0 >> 5  ==  1 if it was 32, else 0
blr
\`\`\`

The trick: \`cntlzw\` returns **32** only for an all-zero word, and \`32 >> 5\` is
\`1\`; any non-zero difference counts fewer than 32 leading zeros, so \`>> 5\` gives
\`0\`. That \`subf\` → \`cntlzw\` → \`srwi r3, r0, 5\` trio is MWCC's signature for
"return \`a == b\`".

## Your task

Write \`is_equal\` so it compiles to the \`subf\` / \`cntlzw\` / \`srwi\` idiom above.
`,
    symbol: "is_equal",
    starter: `int is_equal(int a, int b) {
    /* TODO: return the result of comparing a and b */
    return 0;
}
`,
    solution: `int is_equal(int a, int b) {
    return a == b;
}
`,
    hints: [
      "Returning a comparison gives a 0/1 value with no branch.",
      "Equality is the `subf` / `cntlzw` / `srwi r3, r0, 5` idiom.",
    ],
  },
  {
    id: "control-ne-bool",
    chapter: "control",
    order: 2,
    title: "Not-Equal Is Its Own Idiom",
    difficulty: 2,
    concepts: ["comparison", "boolean", "idiom"],
    brief: `
# Inequality flips the recipe

\`a != b\` can't reuse the \`cntlzw\` trick directly — it needs a *non-zero* test
instead of a *zero* test. MWCC computes the difference both ways, ORs them, and
extracts the sign bit of the combination:

\`\`\`asm
subf r5, r3, r4    # b - a
subf r0, r4, r3    # a - b
or   r0, r5, r0    # nonzero (with bit 31 set somewhere) iff a != b
srwi r3, r0, 31    # pull bit 31 down to 0/1
blr
\`\`\`

ORing \`b - a\` with \`a - b\` guarantees the top bit is set whenever the two
differ (at least one of the two subtractions has bit 31 set), and is exactly
zero when they match. The final \`srwi r3, r0, 31\` isolates that sign bit as a
clean \`0\`/\`1\`. (Edge case: when \`a - b\` wraps to \`INT_MIN\`, \`b - a\` wraps to
\`INT_MIN\` too, but the OR is still \`INT_MIN\` so bit 31 stays set and the result
is still correct.)

## Your task

Write \`not_equal\` to match the target assembly above.
`,
    symbol: "not_equal",
    starter: `int not_equal(int a, int b) {
    return 0;
}
`,
    solution: `int not_equal(int a, int b) {
    return a != b;
}
`,
    hints: [
      "Inequality uses two subtractions ORed together.",
      "The sign bit is harvested with `srwi r3, r0, 31`.",
    ],
  },
  {
    id: "control-if-else",
    chapter: "control",
    order: 3,
    title: "If / Else: The Compare Feeds a Branch",
    difficulty: 2,
    concepts: ["if-else", "comparison", "branch"],
    brief: `
# When a comparison drives control flow

Returning *different constants* from the two arms of an \`if\`/\`else\` is the
first time you'll see a real **compare-and-branch**. The comparison no longer
produces a number — it sets the condition register, and a branch reads it:

\`\`\`asm
cmpw  r3, r4      # compare a against b, set cr0
li    r3, 20      # assume the else value first
bnelr-            # if a != b, return now with 20
li    r3, 10      # otherwise overwrite with the then value
blr
\`\`\`

First, that trailing \`-\` on \`bnelr-\` is a branch-prediction hint, not an
operand. Then two things to notice. MWCC **speculatively loads the else value**
(\`20\`) before the branch, so the equal case is the one that falls through and
reloads. And \`bnelr\` is a *conditional return* — "branch to link register if
not equal" — collapsing an entire else-arm into one instruction.

## Your task

Write \`pick\`: return \`10\` when \`a == b\`, otherwise \`20\`.
`,
    symbol: "pick",
    starter: `int pick(int a, int b) {
    return 0;
}
`,
    solution: `int pick(int a, int b) {
    if (a == b) return 10;
    else return 20;
}
`,
    hints: [
      "Two different return values force a `cmpw` plus a branch.",
      "Expect `cmpw`, a speculative `li r3, 20`, then `bnelr-`.",
    ],
  },
  {
    id: "control-clamp-low",
    chapter: "control",
    order: 4,
    title: "Clamping to Zero, Branchlessly",
    difficulty: 2,
    concepts: ["if", "clamp", "branchless", "idiom"],
    brief: `
# A guard that compiles to no branch at all

\`if (x < 0) return 0;\` looks like it needs a comparison and a jump. But
clamping a signed value up to zero is a classic branchless trick MWCC knows by
heart, built from an arithmetic shift and an *and-with-complement*:

\`\`\`asm
srawi r0, r3, 31   # r0 = all 1s if x < 0, else all 0s (sign mask)
andc  r3, r3, r0   # r3 = x AND (NOT mask) -> 0 if x<0, else x
blr
\`\`\`

\`srawi r0, r3, 31\` smears the sign bit across the whole word, producing
\`0xFFFFFFFF\` for negatives and \`0\` for non-negatives. \`andc\` then masks \`x\`
against the *inverse*: negatives become \`0\`, everything else passes through
untouched. No \`cmpwi\`, no branch — pure data flow.

Why branchless? MWCC recognises the clamp shape when both paths return a value
derived from the *same* register, and folds it into this \`srawi\`/\`andc\` pair.
The single-return form \`return x < 0 ? 0 : x;\` is recognised identically. Beware
that the logically equivalent inversion \`if (x >= 0) return x; return 0;\` falls
*outside* the recognised pattern and compiles to a different sequence — source
form can decide codegen.

## Your task

Write \`clamp_low\`: return \`0\` if \`x < 0\`, otherwise return \`x\`.
`,
    symbol: "clamp_low",
    starter: `int clamp_low(int x) {
    return 0;
}
`,
    solution: `int clamp_low(int x) {
    if (x < 0) return 0;
    return x;
}
`,
    hints: [
      "Clamping a signed value up to zero needs no branch.",
      "Expect a sign mask via `srawi r0, r3, 31` then `andc r3, r3, r0`.",
    ],
  },
  {
    id: "control-cmp-signed",
    chapter: "control",
    order: 5,
    title: "Signed Compare: cmpw",
    difficulty: 2,
    concepts: ["comparison", "signed", "branch", "types"],
    brief: `
# The type chooses the opcode

When a comparison feeds a branch, PowerPC has *two* compare instructions, and
the C **type** decides which one. For a signed \`int\`, MWCC emits **\`cmpw\`** —
the signed word compare:

\`\`\`asm
cmpw  r3, r4      # signed compare: treats r3, r4 as signed
li    r3, 200     # else value
bgelr-            # if a >= b, return 200
li    r3, 100     # then value
blr
\`\`\`

\`cmpw\` orders operands the way you'd expect for signed numbers: \`-1\` is *less
than* \`1\`. The condition test \`bgelr\` ("branch if greater-or-equal") reads the
signed ordering. This lesson is one half of a pair — the next swaps the types to
unsigned and watches the opcode change.

## Your task

Write \`pick_signed\` taking two signed \`int\`s: return \`100\` if \`a < b\`,
otherwise \`200\`.
`,
    symbol: "pick_signed",
    starter: `int pick_signed(int a, int b) {
    return 0;
}
`,
    solution: `int pick_signed(int a, int b) {
    if (a < b) return 100;
    return 200;
}
`,
    hints: [
      "Signed `int` operands feeding a branch use `cmpw`.",
      "Expect `cmpw r3, r4`, `li r3, 200`, `bgelr-`, `li r3, 100`.",
    ],
  },
  {
    id: "control-cmp-unsigned",
    chapter: "control",
    order: 6,
    title: "Unsigned Compare: cmplw",
    difficulty: 3,
    concepts: ["comparison", "unsigned", "branch", "types"],
    brief: `
# Same code, unsigned types, different instruction

Take the *exact same* \`if (a < b)\` logic from the previous lesson and change the
operands to \`u32\`. The structure is identical — but the compare becomes
**\`cmplw\`**, the *logical* (unsigned) word compare:

\`\`\`asm
cmplw r3, r4      # UNSIGNED compare
li    r3, 200
bgelr-
li    r3, 100
blr
\`\`\`

Why it matters: under unsigned ordering \`0xFFFFFFFF\` is the *largest* value, not
\`-1\`. Pick the wrong compare and a value like \`0xFFFFFFFF\` lands on the wrong
side of the branch. **The types in your C are what select \`cmpw\` vs \`cmplw\`** —
if your match shows \`cmplw\` but you wrote \`int\`, the original local or field was
unsigned. Spotting this mismatch — \`cmplw\` where you expected \`cmpw\` — is one of
the most useful debugging skills in decompilation: it points straight back to the
original type.

## Your task

Write \`pick_unsigned\` taking two \`u32\`s: return \`100\` if \`a < b\`, otherwise
\`200\`.
`,
    symbol: "pick_unsigned",
    starter: `int pick_unsigned(u32 a, u32 b) {
    return 0;
}
`,
    solution: `int pick_unsigned(u32 a, u32 b) {
    if (a < b) return 100;
    return 200;
}
`,
    hints: [
      "Unsigned operands feeding a branch use `cmplw`, not `cmpw`.",
      "The only difference from the signed version is the operand types.",
    ],
  },
  {
    id: "control-cmp-immediate",
    chapter: "control",
    order: 7,
    title: "Comparing Against a Constant: cmpwi vs cmplwi",
    difficulty: 3,
    concepts: ["comparison", "immediates", "signed", "unsigned", "types"],
    brief: `
# Constant compares get the immediate forms

Comparing against a literal folds the constant into the instruction, just like
arithmetic immediates. And the signed/unsigned split persists: a signed \`int\`
gives **\`cmpwi\`**, an unsigned operand gives **\`cmplwi\`**.

A signed \`if (a > 5)\` returning two values:

\`\`\`asm
cmpwi r3, 5       # signed immediate compare
li    r3, 9
blelr-            # a <= 5 -> return 9
li    r3, 7
blr
\`\`\`

The unsigned twin (\`u32 a\`) is the same shape with **\`cmplwi r3, 5\`** in line
one. Same rule as the register compares: the operand's type, not the constant,
chooses the opcode. Keep typing your locals and fields to the real field width
and the right immediate compare falls out automatically.

## Your task

Write \`over_five\` taking a signed \`int\`: return \`7\` if \`a > 5\`, otherwise \`9\`.
`,
    symbol: "over_five",
    starter: `int over_five(int a) {
    return 0;
}
`,
    solution: `int over_five(int a) {
    if (a > 5) return 7;
    return 9;
}
`,
    hints: [
      "Comparing against a constant uses an immediate compare.",
      "A signed `int` gives `cmpwi r3, 5`; a `u32` would give `cmplwi`.",
    ],
  },
  {
    id: "control-guard",
    chapter: "control",
    order: 8,
    title: "The Guard Clause / Early Return",
    difficulty: 3,
    concepts: ["if", "early-return", "branch", "guard"],
    brief: `
# Bailing out before the real work

A **guard clause** checks a precondition and returns early so the rest of the
function can assume it holds. Because the two arms do genuinely different work
(return a constant vs. perform a divide), MWCC keeps a real branch here rather
than going branchless:

\`\`\`asm
cmpwi r4, 0       # is the divisor zero?
bne-  .body       # no -> skip the guard, go do the work
li    r3, -1      # yes -> return the sentinel
blr
.body:
divw  r3, r3, r4  # safe: b is known non-zero here
blr
\`\`\`

The guard's body (\`li r3, -1\`; \`blr\`) sits inline right after the branch, and
the "real" code follows at the \`bne-\` target. Spotting a lone compare whose
taken branch jumps *over* a small return block is the fingerprint of an
early-return guard.

## Your task

Write \`safe_div\`: if \`b == 0\` return \`-1\`, otherwise return \`a / b\`.
`,
    symbol: "safe_div",
    starter: `int safe_div(int a, int b) {
    return 0;
}
`,
    solution: `int safe_div(int a, int b) {
    if (b == 0) return -1;
    return a / b;
}
`,
    hints: [
      "A guard clause keeps a real branch when the arms do different work.",
      "Expect `cmpwi r4, 0`, `bne-`, a `li r3, -1` bailout, then `divw`.",
    ],
  },
  {
    id: "control-ternary-max",
    chapter: "control",
    order: 9,
    title: "Ternary Max",
    difficulty: 3,
    concepts: ["ternary", "comparison", "select"],
    brief: `
# Selecting the larger of two

The ternary \`a > b ? a : b\` is just \`max(a, b)\`. MWCC compiles it to a compare,
a conditional skip, and a pair of moves that funnel the chosen value into the
return register:

\`\`\`asm
cmpw r3, r4      # compare a, b (signed int)
ble- .else       # if a <= b, keep b
mr   r4, r3      # a wins: stage a into r4
.else:
mr   r3, r4      # return whichever value is in r4
blr
\`\`\`

Read it carefully: when \`a > b\` the \`ble-\` is *not* taken, so \`mr r4, r3\`
copies \`a\` into \`r4\`; the final \`mr r3, r4\` then returns it. When \`a <= b\` the
branch skips that copy and \`b\` (already in \`r4\`) is returned. The double \`mr\` is
how the compiler merges both arms into a single exit.

## Your task

Write \`maxi\`, returning the larger of two signed \`int\`s using a ternary.
`,
    symbol: "maxi",
    starter: `int maxi(int a, int b) {
    return 0;
}
`,
    solution: `int maxi(int a, int b) {
    return a > b ? a : b;
}
`,
    hints: [
      "`a > b ? a : b` is max; expect a `cmpw` and a `ble-` skip.",
      "Both arms merge through `mr r4, r3` / `mr r3, r4`.",
    ],
  },
  {
    id: "control-ternary-min",
    chapter: "control",
    order: 10,
    title: "Ternary Min",
    difficulty: 3,
    concepts: ["ternary", "comparison", "select"],
    brief: `
# The mirror image

\`a < b ? a : b\` is \`min(a, b)\`, and the asm is the max idiom with one bit
flipped — the branch condition. Where max skipped on \`ble-\`, min skips on
\`bge-\`:

\`\`\`asm
cmpw r3, r4
bge- .else       # if a >= b, keep b
mr   r4, r3      # a is smaller: stage it
.else:
mr   r3, r4
blr
\`\`\`

The \`mr\`/\`mr\` merge is byte-for-byte identical to max; *only the condition code
in the branch differs* (\`bge\` vs \`ble\`). When you see this two-move shape after
a compare, the single branch condition tells you whether the original C was a
min or a max.

## Your task

Write \`mini\`, returning the smaller of two signed \`int\`s using a ternary.
`,
    symbol: "mini",
    starter: `int mini(int a, int b) {
    return 0;
}
`,
    solution: `int mini(int a, int b) {
    return a < b ? a : b;
}
`,
    hints: [
      "`a < b ? a : b` is min; the only change from max is `bge-` instead of `ble-`.",
      "The `mr r4, r3` / `mr r3, r4` merge is the same as max.",
    ],
  },
  {
    id: "control-short-circuit",
    chapter: "control",
    order: 11,
    title: "Short-Circuit && and ||",
    difficulty: 3,
    concepts: ["boolean", "short-circuit", "branch", "logic"],
    brief: `
# Two compares, lazily evaluated

C's \`&&\` and \`||\` are **short-circuit**: the second operand is only evaluated if
the first didn't already decide the answer. That laziness shows up directly as
*two separate compares with branches between them*. For \`a > 0 && b > 0\`:

\`\`\`asm
cmpwi r3, 0
ble-  .false     # a <= 0 -> whole && is false, skip the b test
cmpwi r4, 0
ble-  .false     # b <= 0 -> false
li    r3, 1      # both passed
blr
.false:
li    r3, 0
blr
\`\`\`

With \`&&\`, the *first* failing test jumps straight to the false exit — \`b\` is
never compared when \`a <= 0\`. \`||\` inverts the logic: the first *passing* test
jumps to the true exit. The same \`a > 0 || b > 0\` compiles to:

\`\`\`asm
cmpwi r3, 0
bgt-  .true      # a > 0 -> short-circuit, the || is already true
cmpwi r4, 0
ble-  .false     # last test still gates: b <= 0 -> false
.true:
li    r3, 1
blr
.false:
li    r3, 0
blr
\`\`\`

Note only the *early* operand jumps to true on success; the final compare still
falls through to the true path and branches to false on failure. Counting the
compares and reading which branch each one takes reconstructs the exact
\`&&\`/\`||\` expression.

## Your task

Write \`both_positive\`: return \`1\` if \`a > 0\` **and** \`b > 0\`, otherwise \`0\`.
`,
    symbol: "both_positive",
    starter: `int both_positive(int a, int b) {
    return 0;
}
`,
    solution: `int both_positive(int a, int b) {
    if (a > 0 && b > 0) return 1;
    return 0;
}
`,
    hints: [
      "`&&` short-circuits: a failing first test skips the second compare.",
      "Expect two `cmpwi ..., 0` with a `ble-` after each jumping to the false exit.",
    ],
  },
  {
    id: "control-switch",
    chapter: "control",
    order: 12,
    title: "Switch: The Compare Chain",
    difficulty: 4,
    concepts: ["switch", "branch", "comparison", "control-flow"],
    brief: `
# How MWCC lays out a switch

A \`switch\` over a handful of cases doesn't always become a jump table. For a
small dense set, MWCC builds a **binary-search compare chain** — it bisects the
case values with signed compares to reach the right arm in a logarithmic number
of tests:

\`\`\`asm
cmpwi r3, 2       # probe the middle case first
beq-  .case2
bge-  .hi         # x > 2 -> search the upper half
cmpwi r3, 0       # lower half: 0 or 1?
beq-  .case0
bge-  .case1
b     .default
.hi:
cmpwi r3, 4       # upper half: 3, or out of range?
bge-  .default
b     .case3
\`\`\`

Each \`.caseN\` is a tiny \`li r3, <value>\` / \`blr\` block, and anything that falls
through every test lands in \`.default\`. Note the cases are tested **in value
order**, not source order — the compiler sorts them to bisect. A cascade of
\`cmpwi\`/\`beq\`/\`bge\` against ascending constants is the unmistakable shape of a
dense \`switch\`. This compare-chain strategy is specific to small case sets;
larger dense switches (around seven or more consecutive cases) flip to a jump
table (a \`b\` through a computed table address), a pattern a later lesson covers.

## Your task

Write \`classify\`: a \`switch\` on \`x\` returning \`10\`, \`20\`, \`30\`, \`40\` for cases
\`0..3\`, and \`0\` by default.
`,
    symbol: "classify",
    starter: `int classify(int x) {
    return 0;
}
`,
    solution: `int classify(int x) {
    switch (x) {
        case 0: return 10;
        case 1: return 20;
        case 2: return 30;
        case 3: return 40;
        default: return 0;
    }
}
`,
    hints: [
      "A small dense switch becomes a binary-search compare chain, not a table.",
      "Cases are tested in value order with `cmpwi` / `beq-` / `bge-`.",
    ],
  },
];
