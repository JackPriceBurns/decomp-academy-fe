import { LessonSource } from "@/lib/lessons/types";

export const floats: LessonSource[] = [
  {
    id: "floats-add",
    chapter: "floats",
    order: 1,
    title: "Floats Live in a Different Register File",
    difficulty: 1,
    concepts: ["floating-point", "registers", "single-precision"],
    brief: `
# A whole separate set of registers

Integers ride in \`r3\`, \`r4\`, … — but floating-point values get their own bank,
\`f1\` through \`f13\`. The first \`float\` argument arrives in **\`f1\`**, the second in
**\`f2\`**, and the result comes back in **\`f1\`** (the way \`r3\` works for ints).
Further float arguments continue in \`f3\`, \`f4\`, … just as integer arguments march
up \`r5\`, \`r6\` — so a three-\`float\` function takes its third argument in \`f3\`.

A \`float\` is **single-precision** (32-bit), and PowerPC has single-precision
arithmetic that ends in **\`s\`**. Addition is \`fadds\`:

\`\`\`asm
fadds f1, f1, f2   # f1 = a + b, single precision
blr
\`\`\`

Same three-operand shape as \`add\`: destination first, then the two sources.

## Your task

Write \`add_f\`, returning the sum of two \`f32\`s.
`,
    symbol: "add_f",
    starter: `f32 add_f(f32 a, f32 b) {
    return 0.0f;
}
`,
    solution: `f32 add_f(f32 a, f32 b) {
    return a + b;
}
`,
    hints: [
      "Float arguments arrive in f1 and f2, not r3/r4.",
      "Single-precision add is `fadds f1, f1, f2`.",
    ],
  },
  {
    id: "floats-mul",
    chapter: "floats",
    order: 2,
    title: "Single-Precision Multiply",
    difficulty: 1,
    concepts: ["floating-point", "multiply", "single-precision"],
    brief: `
# \`fmuls\`

Multiplication of two \`f32\`s is the single-precision **\`fmuls\`**:

\`\`\`asm
fmuls f1, f1, f2   # f1 = a * b
blr
\`\`\`

Unlike the integer world there is no "multiply low / multiply high" split and no
immediate form — floating-point multiply is one clean instruction. The trailing
\`s\` is the tell that the operands and result are 32-bit single precision rather
than 64-bit double.

## Your task

Write \`mul_f\` to match the \`fmuls\` above.
`,
    symbol: "mul_f",
    starter: `f32 mul_f(f32 a, f32 b) {
    return 0.0f;
}
`,
    solution: `f32 mul_f(f32 a, f32 b) {
    return a * b;
}
`,
    hints: [
      "Single-precision multiply ends in `s`.",
      "`a * b` becomes `fmuls f1, f1, f2`.",
    ],
  },
  {
    id: "floats-sub",
    chapter: "floats",
    order: 3,
    title: "Subtraction Keeps Its Order",
    difficulty: 1,
    concepts: ["floating-point", "single-precision", "operand-order"],
    brief: `
# No \`subf\` surprise here

Remember how integer subtraction used \`subf\` and *reversed* its operands? The
floating-point unit has a real **\`fsubs\`** that computes \`fD = fA - fB\` in the
natural order:

\`\`\`asm
fsubs f1, f1, f2   # f1 = a - b
blr
\`\`\`

Destination, then the operands left-to-right exactly as written in the C. The
floating-point instruction set is generally more regular than the integer one —
one fewer idiom to memorize.

## Your task

Write \`sub_f\` to compile to the \`fsubs\` above.
`,
    symbol: "sub_f",
    starter: `f32 sub_f(f32 a, f32 b) {
    return 0.0f;
}
`,
    solution: `f32 sub_f(f32 a, f32 b) {
    return a - b;
}
`,
    hints: [
      "Float subtract is `fsubs`, and it does not reverse operands.",
      "`a - b` becomes `fsubs f1, f1, f2`.",
    ],
  },
  {
    id: "floats-div",
    chapter: "floats",
    order: 4,
    title: "Floating-Point Division Is Real",
    difficulty: 2,
    concepts: ["floating-point", "divide", "single-precision"],
    brief: `
# \`fdivs\`

Integer division by a constant got strength-reduced into shifts. Floating-point
division has no such trick — \`fdivs\` is a genuine hardware divide and the
compiler emits it directly:

\`\`\`asm
fdivs f1, f1, f2   # f1 = a / b
blr
\`\`\`

Be aware: dividing a float by a *constant* (say \`x / 2.0f\`) is usually turned
into a **multiply by the reciprocal** (\`x * 0.5f\`) instead, which is cheaper.
You only get \`fdivs\` when the divisor is a runtime value.

## Your task

Write \`div_f\` to match the \`fdivs\` above.
`,
    symbol: "div_f",
    starter: `f32 div_f(f32 a, f32 b) {
    return 0.0f;
}
`,
    solution: `f32 div_f(f32 a, f32 b) {
    return a / b;
}
`,
    hints: [
      "Dividing by a runtime float uses `fdivs`.",
      "`a / b` becomes `fdivs f1, f1, f2`.",
    ],
  },
  {
    id: "floats-div-const-reciprocal",
    chapter: "floats",
    order: 4.5,
    title: "Dividing by a Constant Becomes a Multiply",
    difficulty: 2,
    concepts: ["floating-point", "divide", "reciprocal", "strength-reduction"],
    brief: `
# A float divide that isn't a divide

Dividing a float by a **power-of-two constant** doesn't need \`fdivs\` at all.
MWCC folds it into a multiply by the *exactly representable* reciprocal — so
\`x / 4.0f\` becomes \`x * 0.25f\`, a single \`fmuls\`:

\`\`\`asm
lfs   f0, ...      # load the reciprocal constant 0.25f from the pool
fmuls f1, f1, f0   # x * 0.25f  — no fdivs in sight
blr
\`\`\`

The \`0.25f\` lives in a read-only float pool (loaded with \`lfs\`), and the divide
is gone entirely. This fold only happens when the reciprocal is *exact* — i.e.
powers of two. \`x / 3.0f\` keeps a real \`fdivs\`, because \`1/3\` can't be stored
exactly. So a lone \`lfs\` + \`fmuls\` where the source "obviously" divides tells you
the divisor was a power of two — and writing \`x / 4.0f\` in C reproduces it; you
don't hand-write the \`0.25f\`.

## Your task

Write \`quarter\` taking an \`f32 x\` so it compiles to the \`lfs\` + \`fmuls\` above.
`,
    symbol: "quarter",
    starter: `f32 quarter(f32 x) {
    return 0.0f;
}
`,
    solution: `f32 quarter(f32 x) {
    return x / 4.0f;
}
`,
    hints: [
      "Dividing by a compile-time constant doesn't use `fdivs` — it folds to a reciprocal multiply.",
      "Expect an `lfs` of the reciprocal then a single `fmuls`, no division.",
    ],
  },
  {
    id: "floats-double-add",
    chapter: "floats",
    order: 5,
    title: "Doubles Drop the 's'",
    difficulty: 2,
    concepts: ["floating-point", "double-precision", "types"],
    brief: `
# \`f64\` is double precision

A \`f32\` is single precision; an \`f64\` (\`double\`) is **double precision**, and the
hardware has a parallel set of instructions *without* the trailing \`s\`. The same
\`a + b\`, typed as \`f64\`, compiles to \`fadd\` instead of \`fadds\`:

\`\`\`asm
fadd f1, f1, f2    # f1 = a + b, double precision
blr
\`\`\`

So \`fadd\`/\`fmul\`/\`fsub\`/\`fdiv\` are the double-precision forms, and
\`fadds\`/\`fmuls\`/\`fsubs\`/\`fdivs\` are single. **The presence or absence of that one
letter tells you the operand type** — which is exactly the kind of clue you use
to recover the original C declarations.

## Your task

Write \`add_d\` to compile to the \`fadd\` above.
`,
    symbol: "add_d",
    starter: `f64 add_d(f64 a, f64 b) {
    return 0.0;
}
`,
    solution: `f64 add_d(f64 a, f64 b) {
    return a + b;
}
`,
    hints: [
      "Double precision drops the `s` suffix.",
      "`a + b` on f64 becomes `fadd f1, f1, f2`.",
    ],
  },
  {
    id: "floats-frsp-highlight",
    chapter: "floats",
    order: 6,
    title: "★ The Spurious frsp: f32 vs double Helpers",
    difficulty: 3,
    concepts: ["floating-point", "types", "frsp", "highlight"],
    brief: `
# Why the parameter type matters

Here is a common decompilation pitfall worth recognizing. Suppose the target is a
small single-precision helper:

\`\`\`asm
lfs   f0, ...      # load 0.5f
fmuls f1, f0, f1   # x * 0.5f
blr
\`\`\`

Three instructions. Now watch what happens if you write the helper taking a
\`double\` and returning a \`float\` — \`f32 fn(double x){ return x * 0.5; }\`:

\`\`\`asm
lfd   f0, ...      # load 0.5 as a *double*
fmul  f1, f0, f1   # double multiply
frsp  f1, f1       # ROUND result back down to single  ← spurious!
blr
\`\`\`

The compiler did the math in double precision, then had to **\`frsp\`** (round to
single precision) to produce the \`f32\` return value. That extra \`frsp\` — and the
\`fmul\`/\`lfd\` instead of \`fmuls\`/\`lfs\` — will never match a target built from a
clean single-precision helper.

**A good default:** for single-precision helpers, write \`f32 fn(f32)\` rather than
\`f32 fn(double)\` (or \`double fn(double)\`). Keeping everything in \`f32\` keeps the math single
precision and the \`frsp\` disappears.

## Your task

Write \`halve\` to reproduce the assembly above — with **no \`frsp\`**.
Use \`f32\` throughout and the \`0.5f\` literal (note the \`f\` suffix).
`,
    symbol: "halve",
    starter: `f32 halve(double x) {
    // careful: this signature forces a double multiply + frsp
    return x * 0.5;
}
`,
    solution: `f32 halve(f32 x) {
    return x * 0.5f;
}
`,
    hints: [
      "A `double` parameter forces double-precision math, then an `frsp` to narrow the result.",
      "Type the parameter as `f32` and use the `0.5f` literal so the multiply stays single precision (`fmuls`, no `frsp`).",
    ],
  },
  {
    id: "floats-literal",
    chapter: "floats",
    order: 7,
    title: "Loading a Float Constant from the SDA",
    difficulty: 2,
    concepts: ["floating-point", "constants", "lfs", "sda"],
    brief: `
# Float literals don't fit in an immediate

There is no "load immediate float" instruction — a 32-bit constant can't be
encoded inline. Instead MWCC parks the value in the **small data area (SDA)** and
loads it with **\`lfs\`** (load floating single), addressed relative to \`r2\`/\`r13\`:

\`\`\`asm
lfs   f0, ...      # load the constant 0.25f from the SDA
fmuls f1, f0, f1   # x * 0.25f
blr
\`\`\`

The \`...\` is a relocation the linker fills in; in the disassembler you'll see a
concrete SDA-relative offset off \`r2\`, e.g. \`lfs f0, 0x25f0(r2)\` (or a symbolic
\`lfs f0, lit@sda21(r2)\`). When you spot \`lfs\` feeding straight into an
\`fmuls\`/\`fadds\`, the original C almost certainly had a literal like \`0.25f\` in
the expression.

## Your task

Write \`quarter\` taking an \`f32 x\` to match the target assembly above.
`,
    symbol: "quarter",
    starter: `f32 quarter(f32 x) {
    return 0.0f;
}
`,
    solution: `f32 quarter(f32 x) {
    return x * 0.25f;
}
`,
    hints: [
      "A float constant is loaded from the small data area with `lfs`, not an immediate.",
      "`x * 0.25f` becomes `lfs f0, ...` then `fmuls f1, f0, f1`.",
    ],
  },
  {
    id: "floats-fmadds-highlight",
    chapter: "floats",
    order: 8,
    title: "★ Fused Multiply-Add",
    difficulty: 3,
    concepts: ["floating-point", "fmadds", "fp-contract", "highlight"],
    brief: `
# One instruction for \`a * b + c\`

PowerPC has a **fused multiply-add**: it multiplies and adds in a single
rounding step. With \`fp_contract\` **on** (it is, in this environment), MWCC will
contract a \`multiply followed by add\` into one **\`fmadds\`**:

\`\`\`asm
fmadds f1, f1, f2, f3   # f1 = a * b + c, single precision, one rounding
blr
\`\`\`

Read the operand order carefully: \`fmadds fD, fA, fC, fB\` computes
\`fD = (fA * fC) + fB\`. So in \`fmadds f1, f1, f2, f3\`, the multiply is \`f1 * f2\`
and \`f3\` is the addend.

This is a key floating-point idiom to recognize. If you write the three steps
as separate \`fmuls\` + \`fadds\`, you won't match a contracted target — and
vice versa. The double-precision cousin is \`fmadd\` (no \`s\`); related forms are
\`fmsubs\` (\`a*b - c\`), \`fnmadds\`, and \`fnmsubs\`.

## Your task

Write \`fma3\` taking three \`f32\`s so it compiles to the \`fmadds\` above. Write it
as a plain expression — let the compiler fuse it.
`,
    symbol: "fma3",
    starter: `f32 fma3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
`,
    solution: `f32 fma3(f32 a, f32 b, f32 c) {
    return a * b + c;
}
`,
    hints: [
      "With fp_contract on, a multiply feeding an add fuses into one instruction.",
      "`a * b + c` becomes a single `fmadds f1, f1, f2, f3`.",
    ],
  },
  {
    id: "floats-int-to-float",
    chapter: "floats",
    order: 9,
    title: "Integer to Float: The Magic-Number Trick",
    difficulty: 3,
    concepts: ["floating-point", "conversion", "int-to-float"],
    brief: `
# There is no plain "int → float" instruction

PowerPC's only integer/float conversion hardware is \`fctiwz\` (float → int). To go
the *other* way, MWCC uses a famous bit-twiddling trick. It builds a double whose
bit pattern is \`0x43300000:(x ^ 0x80000000)\` and then subtracts the matching bias
constant \`0x4330000000000000\`, leaving the integer value as a float:

\`\`\`asm
xoris r3, r3, 0x8000   # flip the sign bit (handle signedness)
lis   r0, 0x4330       # high half of the magic double
lfd   f1, ...          # load the bias constant 0x4330000000000000
stw   r3, 12(r1)       # assemble  0x43300000:(x ^ 0x80000000) on the stack
stw   r0, 8(r1)
lfd   f0, 8(r1)        # reload it as a double
fsubs f1, f0, f1       # subtract the bias → the converted value
blr
\`\`\`

PowerPC is **big-endian**, so the high word sits at the *lower* address: \`8(r1)\`
holds \`0x43300000\` and \`12(r1)\` holds \`x ^ 0x80000000\`. The two \`stw\`s together
lay down the 8-byte double \`0x43300000:(x ^ 0x80000000)\`, which \`lfd f0, 8(r1)\`
then reads back.

You don't write any of this — \`(f32)x\` produces the whole dance. When you see the
\`xoris … 0x4330 … lfd … stw/stw … lfd … fsubs\` pattern in disassembly, that's the
signature of a cast from \`int\` to floating point.

## Your task

Write \`i2f\` taking an \`int x\` to reproduce the assembly above.
`,
    symbol: "i2f",
    starter: `f32 i2f(int x) {
    return 0.0f;
}
`,
    solution: `f32 i2f(int x) {
    return (f32)x;
}
`,
    hints: [
      "int→float has no single instruction; MWCC uses the 0x43300000 magic-number trick.",
      "Just write `(f32)x` and let the compiler emit the xoris/lfd/stw/fsubs sequence.",
    ],
  },
  {
    id: "floats-float-to-int",
    chapter: "floats",
    order: 10,
    title: "Float to Int: fctiwz and the Store/Load Dance",
    difficulty: 3,
    concepts: ["floating-point", "conversion", "fctiwz", "float-to-int"],
    brief: `
# \`fctiwz\` produces the bits in an FPR

Converting a float to an integer uses **\`fctiwz\`** ("convert to integer word,
round toward zero"). But there's a catch: the result lands in a *floating-point*
register, and there is no direct FPR→GPR move. So MWCC stores the FPR to the
stack and loads the low word back into a GPR:

\`\`\`asm
fctiwz f0, f1        # convert x, result in low half of f0
stfd   f0, 8(r1)     # spill the 8-byte FPR to the stack
lwz    r3, 12(r1)    # +4 from the stfd base = low word = the int result
blr
\`\`\`

That \`fctiwz\` → \`stfd\` → \`lwz\` is the unmistakable signature of a \`(int)\` cast
from a float. The integer result lands in the **low 32-bit word** of the 64-bit
FPR; because PowerPC is big-endian, that low word lives at the *higher* address,
so the \`lwz\` reads \`12(r1)\` — i.e. **+4** past the \`stfd\` base at \`8(r1)\`. The
round-toward-zero \`fctiwz\` matches C's truncating conversion semantics.

## Your task

Write \`f2i\` taking an \`f32 x\` to match the target assembly above.
`,
    symbol: "f2i",
    starter: `int f2i(f32 x) {
    return 0;
}
`,
    solution: `int f2i(f32 x) {
    return (int)x;
}
`,
    hints: [
      "float→int is `fctiwz`, then a store/load to move the bits FPR→GPR.",
      "Write `(int)x`; expect `fctiwz` then `stfd`/`lwz` of the low word.",
    ],
  },
  {
    id: "floats-compare-branch",
    chapter: "floats",
    order: 11,
    title: "Comparing Floats: fcmpo Feeding a Branch",
    difficulty: 4,
    concepts: ["floating-point", "compare", "fcmpo", "branch"],
    brief: `
# The compare-then-branch rule

When a float comparison feeds an \`if\`, MWCC uses **\`fcmpo\`** (floating compare,
ordered) to set a condition register, then branches on it. Comparing against
\`0.0f\` first loads the constant with \`lfs\`:

\`\`\`asm
lfs   f0, ...        # load 0.0f
fcmpo cr0, f1, f0    # compare x against 0.0
bgelr-               # if x >= 0, return x as-is
fmr   f1, f0         # else result = 0.0
blr
\`\`\`

A reliable rule of thumb: **a float compare that feeds a
branch is just the plain operator** — write \`if (x < 0.0f)\` and you get
\`fcmpo\` + branch. (A float comparison whose *boolean result is stored or
returned* compiles to a different, messier form — the compiler still does the
\`fcmpo\`, but then *materializes* the 0/1 result into a GPR, typically with an
\`mfcr\` plus \`rlwinm\` to extract and shift the condition bit. If you see the
compare's result land in a general register rather than steer a branch, the
original C stored or returned the boolean — so reach for the plain branch shape
first.) "Ordered" (\`fcmpo\`) vs "unordered" matters only for NaN handling;
normal C comparisons use \`fcmpo\`.

## Your task

Write \`relu\` taking an \`f32 x\`: return \`0.0f\` if \`x < 0.0f\`, otherwise \`x\`.
Use a plain \`if\` with the \`<\` operator.
`,
    symbol: "relu",
    starter: `f32 relu(f32 x) {
    // return x when non-negative, else 0
    return x;
}
`,
    solution: `f32 relu(f32 x) {
    if (x < 0.0f) {
        return 0.0f;
    }
    return x;
}
`,
    hints: [
      "A float compare feeding a branch is the plain operator → `fcmpo` plus a conditional branch.",
      "`if (x < 0.0f) return 0.0f;` compiles to `lfs` of 0.0f, `fcmpo`, and a branch.",
    ],
  },
  {
    id: "floats-abs-neg",
    chapter: "floats",
    order: 12,
    title: "Absolute Value and Negation",
    difficulty: 2,
    concepts: ["floating-point", "fabs", "fneg", "sign-bit"],
    brief: `
# Sign-bit instructions

Two tiny, single-instruction operations round out the chapter. Floating-point
**negation** is \`fneg\` (it just flips the sign bit), and **absolute value** is
\`fabs\` (it clears the sign bit). The single-precision intrinsic \`__fabsf\` lowers
straight to \`fabs\`:

\`\`\`asm
fabs f0, f1        # |x|  (clear sign bit)
fneg f1, f0        # -|x| (flip sign bit)
blr
\`\`\`

Unlike \`fadds\`/\`fmuls\`, the sign-bit instructions have **no \`s\` variant**: they
appear as \`fabs\`/\`fneg\` even on an \`f32\`. This is one of the few exceptions to
the single/double suffix rule from earlier — flipping a sign bit is bit-identical
at single and double precision, so there's nothing to round and no need for a
separate form.

So \`-__fabsf(x)\` is "absolute value, then negate", and you see the two sign-bit
ops back to back. Neither rounds or touches the magnitude bits — they're as cheap
as a register move.

## Your task

Write \`negabs\` taking an \`f32 x\` to compile to the two sign-bit instructions above.
`,
    symbol: "negabs",
    starter: `f32 negabs(f32 x) {
    return 0.0f;
}
`,
    solution: `f32 negabs(f32 x) {
    return -__fabsf(x);
}
`,
    hints: [
      "`__fabsf` lowers to `fabs` (clear sign bit); unary minus lowers to `fneg` (flip sign bit).",
      "`-__fabsf(x)` becomes `fabs f0, f1` then `fneg f1, f0`.",
    ],
  },
];
