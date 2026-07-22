---
id: ce9b7612-2bdc-547c-8ae2-c07cc624b5f8
slug: int64-three-stage-fuse
title: "Chaining: Carry, Borrow, and Mask in One Body"
difficulty: 5
concepts:
  - 64-bit
  - arithmetic
  - carry
  - borrow
  - bitwise
  - chaining
symbol: fuse_64
hints:
  - Three stages of pairs — a carry chain, then a borrow chain on its result, then a flag-free bitwise pair against the fourth operand.
  - Each stage is a low-word/high-word pair; only the last `adde`/`subfe`/bitwise of each stage feeds the next, with the running high word held in a scratch register.
  - Four `u64` parameters; combine the first three with two arithmetic operators, then mask the result with the fourth.
---

# The whole chapter in one function

Four 64-bit operands, three operations, one expression. That is the finale, and
`blend3(p, q, r, s)` shows the shape: it adds three 64-bit values, then ORs the
sum with a fourth:

```asm
addc   r4, r4, r6     # (p + q) low,  carry
adde   r0, r3, r5     # (p + q) high
addc   r3, r8, r4     # (... + r) low,  carry
adde   r0, r7, r0     # (... + r) high   -> sum in r0:r3
or     r4, r10, r3    # (sum | s) low   -- bitwise, no flag
or     r3, r9, r0     # (sum | s) high
blr
```

Three stages, six instructions and the `blr`. The opening `addc`/`adde` build
`p + q`, then the next pair folds in `r`, leaving the running sum spread across a
scratch high word and a low word. From there the two `or`s mask in `s`, no flag
crossing the halves. One thing to mind: the fourth argument `s` lands in
`r9:r10`, so by now the operands sit nowhere near where they started.

Your target reuses this skeleton with two swaps. The middle pair borrows where
`blend3` carried, and the closing pair masks with a bitwise op that isn't `or`.
Name each operator from its pair, and since every pair feeds the next, the
`r3:r4` value at the `blr` is the whole four-operand expression.

## Your task

Write `fuse_64` to reproduce the assembly above.

<!-- solution -->
```c
u64 fuse_64(u64 a, u64 b, u64 c, u64 d) {
    return (a + b - c) & d;
}
```
