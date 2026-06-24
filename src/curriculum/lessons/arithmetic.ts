import { LessonSource } from "@/lib/lessons/types";

export const arithmetic: LessonSource[] = [
  {
    id: "arithmetic-mul",
    chapter: "arithmetic",
    order: 1,
    title: "Multiplying Two Registers",
    difficulty: 1,
    concepts: ["arithmetic", "multiply"],
    brief: `
# Multiply low

PowerPC multiplies two registers with **\`mullw rD, rA, rB\`** ("multiply low
word"), keeping the low 32 bits of the product:

\`\`\`asm
mullw r3, r3, r4
blr
\`\`\`

There's no immediate form of \`mullw\`; multiplying by a *variable* always lands
here. Multiplying by a *constant* is a different story — that's the next lesson.

## Your task

Write \`mul2\` so it compiles to the \`mullw\` above.
`,
    symbol: "mul2",
    starter: `int mul2(int a, int b) {
    return 0;
}
`,
    solution: `int mul2(int a, int b) {
    return a * b;
}
`,
    hints: [
      "Multiplying two variables (not a constant) maps to one dedicated instruction.",
      "You only write C here — return the product and let the compiler emit the multiply.",
    ],
  },
  {
    id: "arithmetic-mul-const-pow2",
    chapter: "arithmetic",
    order: 2,
    title: "Multiply by a Power of Two",
    difficulty: 2,
    concepts: ["strength-reduction", "shifts"],
    brief: `
# Strength reduction

Compilers replace expensive operations with cheap equivalent ones — **strength
reduction**. Multiplying by a power of two becomes a left shift, which on
PowerPC is the \`rlwinm\` rotate instruction (MWCC prints it via the \`slwi\`
extended mnemonic):

\`\`\`asm
slwi r3, r3, 3    # x << 3  == x * 8
blr
\`\`\`

If you wrote \`x * 8\` *or* \`x << 3\` you'd get the same instruction — they're
identical to the compiler. Recognizing that \`* 8\` is "really" a shift is a core
decompiler instinct.

## Your task

Write \`times8\` to match the target.
`,
    symbol: "times8",
    starter: `int times8(int x) {
    return 0;
}
`,
    solution: `int times8(int x) {
    return x * 8;
}
`,
    hints: [
      "8 is a power of two, so this is a shift, not a multiply.",
      "Shifting left by 3 is the same as ×8 — write the multiply and the compiler reduces it for you.",
    ],
  },
  {
    id: "arithmetic-mul-const",
    chapter: "arithmetic",
    order: 3,
    title: "Multiply by a Small Constant",
    difficulty: 2,
    concepts: ["strength-reduction", "immediates"],
    brief: `
# \`mulli\` for constant multiplies

A multiply by a non-power-of-two constant uses the **immediate** multiply
\`mulli rD, rA, imm\`:

\`\`\`asm
mulli r3, r3, 12
blr
\`\`\`

(For some constants MWCC will instead synthesize the product from shifts and
adds when that's cheaper — but for many small values it just emits \`mulli\`.)

## Your task

Write \`times12\` so it compiles to the \`mulli\` above.
`,
    symbol: "times12",
    starter: `int times12(int x) {
    return 0;
}
`,
    solution: `int times12(int x) {
    return x * 12;
}
`,
    hints: [
      "A constant multiply that isn't a power of two can use `mulli`.",
      "Write the multiply in C; the constant folds into a single immediate-multiply.",
    ],
  },
  {
    id: "arithmetic-div-pow2-unsigned",
    chapter: "arithmetic",
    order: 4,
    title: "Unsigned Divide by a Power of Two",
    difficulty: 2,
    concepts: ["strength-reduction", "shifts", "unsigned"],
    brief: `
# Dividing unsigned is just a shift

For an **unsigned** value, dividing by a power of two is a logical right shift —
\`srwi\`, again an extended form of \`rlwinm\`:

\`\`\`asm
srwi r3, r3, 2    # x >> 2 == x / 4 (unsigned)
blr
\`\`\`

No rounding correction is needed because unsigned division truncates toward zero
and the high bits are simply discarded. **Signed** division by a power of two is
much trickier — it has to round toward zero for negatives, so MWCC emits a
\`srawi\`/\`addze\` correction pair rather than a plain shift, which the next lesson
walks through.

## Your task

(\`u32\` is the GameCube SDK's typedef for \`unsigned int\` — it's pre-declared for
you here, not a built-in C type.)

Write \`udiv4\` taking a \`u32 x\` to reproduce the assembly above.
`,
    symbol: "udiv4",
    starter: `u32 udiv4(u32 x) {
    return 0;
}
`,
    solution: `u32 udiv4(u32 x) {
    return x / 4;
}
`,
    hints: [
      "Unsigned divide by 4 is a logical right shift by 2.",
      "Since the type is unsigned, it's a logical right shift with no rounding correction.",
    ],
  },
  {
    id: "arithmetic-div-pow2-signed",
    chapter: "arithmetic",
    order: 4.5,
    title: "Signed Divide by a Power of Two",
    difficulty: 3,
    concepts: ["strength-reduction", "shifts", "signed", "rounding"],
    brief: `
# Signed division rounds, so it needs a fixup

The unsigned case was a clean \`srwi\`. Signed division by a power of two is
trickier: C rounds *toward zero*, but an arithmetic shift rounds *toward
negative infinity*. For a negative dividend those differ — \`-1 / 4\` is \`0\` in C,
yet \`-1 >> 2\` is \`-1\` — so MWCC adds a correction:

\`\`\`asm
srawi r0, r3, 2    # x >> 2, biased the wrong way for negatives
addze r3, r0       # add the carry back: +1 only when x was negative
blr
\`\`\`

\`srawi\` sets the carry bit when it shifts a 1 out of a negative value; \`addze\`
("add to zero, extended with carry") then nudges the quotient back toward zero
exactly when needed. A positive dividend produces no carry, so \`addze\` adds
nothing. This **\`srawi\` + \`addze\`** pair is the unmistakable signature of a
signed divide by a power of two — distinct from the lone \`srwi\` of the unsigned
case.

## Your task

Write \`sdiv4\`, taking a signed \`int x\`, to reproduce the \`srawi\`/\`addze\` pair above.
`,
    symbol: "sdiv4",
    starter: `int sdiv4(int x) {
    return 0;
}
`,
    solution: `int sdiv4(int x) {
    return x / 4;
}
`,
    hints: [
      "Signed divide by a power of two is an arithmetic shift plus a rounding fixup.",
      "Look for `srawi` followed by `addze` — the carry corrects the rounding for negatives.",
    ],
  },
  {
    id: "arithmetic-div-var",
    chapter: "arithmetic",
    order: 5,
    title: "Real Division",
    difficulty: 2,
    concepts: ["arithmetic", "divide", "signed"],
    brief: `
# When it really is a divide

Dividing by a *variable* can't be reduced to shifts, so the compiler emits the
hardware **\`divw rD, rA, rB\`** (signed divide word):

\`\`\`asm
divw r3, r3, r4
blr
\`\`\`

Unsigned division by a variable uses \`divwu\` instead. The signed/unsigned choice
is driven entirely by the C types — another reminder that *types decide the
instruction*.

## Your task

Write \`div2\` for signed \`int\`s to match the target.
`,
    symbol: "div2",
    starter: `int div2(int a, int b) {
    return 0;
}
`,
    solution: `int div2(int a, int b) {
    return a / b;
}
`,
    hints: [
      "Dividing by a variable can't be reduced to shifts — it's a hardware divide.",
      "The signed `int` type selects `divw` (an unsigned divide would use `divwu`).",
    ],
  },
  {
    id: "arithmetic-mod",
    chapter: "arithmetic",
    order: 6,
    title: "Modulo Has No Instruction",
    difficulty: 3,
    concepts: ["arithmetic", "modulo"],
    brief: `
# Remainder = divide, multiply back, subtract

PowerPC has no remainder instruction. \`a % b\` is computed as
\`a - (a / b) * b\`, so you'll see a divide, a multiply, and a subtract working
together:

\`\`\`asm
divw  r0, r3, r4   # q = a / b
mullw r0, r0, r4   # q * b
subf  r3, r0, r3   # a - q*b
blr
\`\`\`

Watch the operand order on \`subf\`: \`subf rD, rA, rB\` computes \`rD = rB - rA\`,
the *reverse* of how the mnemonic reads. Here \`subf r3, r0, r3\` is \`r3 - r0\`,
i.e. \`a - q*b\`. That backwards subtraction is a classic PowerPC gotcha.

Spotting this divide → \`mullw\` → \`subf\` trio in the wild instantly tells you the
original C was a \`%\` operator.

## Your task

Write \`mod2\` for signed \`int\`s to reproduce the assembly above.
`,
    symbol: "mod2",
    starter: `int mod2(int a, int b) {
    return 0;
}
`,
    solution: `int mod2(int a, int b) {
    return a % b;
}
`,
    hints: [
      "There is no modulo instruction; it's built from divide/multiply/subtract.",
      "Just write `a % b` and let the compiler synthesize the sequence.",
    ],
  },
  {
    id: "arithmetic-add3",
    chapter: "arithmetic",
    order: 7,
    title: "Sum of Three",
    difficulty: 2,
    concepts: ["arithmetic", "register-allocation"],
    brief: `
# Chaining adds (and a scheduling surprise)

\`a + b + c\` needs two \`add\`s — but watch *which* registers MWCC picks. At
\`-O4,p\` it doesn't naïvely accumulate into \`r3\`; it stashes \`a\` in a scratch
register, sums \`b + c\` first, then folds \`a\` back in:

\`\`\`asm
mr   r0, r3        # save a into scratch r0
add  r3, r4, r5    # b + c first
add  r3, r0, r3    # + a
blr
\`\`\`

\`r0\` is a volatile scratch register MWCC grabs freely inside a function. (It has
one architectural quirk for later: when used as a base in a load/store address,
\`r0\` reads as the literal value 0 instead of its contents — so it can't be an
addressing base.)

The result is identical, but the instruction order is the optimizer's, not the
source's. Predicting these small reorderings is exactly what matching trains.

## Your task

Write \`add3\` to match the target.
`,
    symbol: "add3",
    starter: `int add3(int a, int b, int c) {
    return 0;
}
`,
    solution: `int add3(int a, int b, int c) {
    return a + b + c;
}
`,
    hints: [
      "Three arguments arrive in r3, r4, r5.",
      "The compiler may not accumulate left-to-right; it often sums b+c first.",
      "Write `a + b + c` and observe the register choices.",
    ],
  },
  {
    id: "arithmetic-affine",
    chapter: "arithmetic",
    order: 8,
    title: "An Affine Expression",
    difficulty: 3,
    concepts: ["arithmetic", "strength-reduction", "instruction-selection"],
    brief: `
# Putting the idioms together

Real code combines these tricks. \`x * 4 + 1\` mixes a strength-reduced multiply
with an immediate add. MWCC may even fuse the shift-and-add cleverly:

\`\`\`asm
slwi r3, r3, 2    # x * 4
addi r3, r3, 1    # + 1
blr
\`\`\`

When you read disassembly, mentally collapse \`slwi\`/\`addi\` chains back into the
arithmetic expression that produced them. That reverse-mapping is the whole job.

## Your task

Write \`affine\` to reproduce the assembly above.
`,
    symbol: "affine",
    starter: `int affine(int x) {
    return 0;
}
`,
    solution: `int affine(int x) {
    return x * 4 + 1;
}
`,
    hints: [
      "Multiply by 4 is a shift; the + 1 is an immediate add.",
      "Expect `slwi r3, r3, 2` then `addi r3, r3, 1`.",
    ],
  },
];
