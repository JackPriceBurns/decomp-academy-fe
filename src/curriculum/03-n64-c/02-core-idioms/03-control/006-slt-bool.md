---
id: 00e460e9-db15-4171-880c-72cf5d85f926
slug: control-slt-bool
title: "slt: A Comparison You Can Hold"
difficulty: 2
concepts:
  - compare
  - booleans
symbol: func_80039180
hints:
  - "Two `slt`s on the same pair of registers, opposite orders — decode each one literally (first source < second source), then see what the `subu` does with the pair."
  - "The result is 1, 0, or -1 depending on how a and b relate. Two comparisons and one subtraction, all in one C expression."
---

# The comparison as a value

Branches consume comparisons; sometimes C wants to *keep* one — return it,
store it, hand it to a caller. The instruction for this is **`slt`**,
set-on-less-than — the signed sibling of the `sltu` you met testing bits. It
writes 1 to its destination if the first source is strictly less than the
second, else 0:

```asm
slt  v0, a0, a1    # v0 = (a < b) ? 1 : 0
jr   ra
nop
```

One instruction, and the whole function `return a < b;` is done — no branch
anywhere. Now the wrinkle that makes `slt` worth a careful read every time:
**MIPS has no set-on-greater-than**. When C says `a > b`, the compiler uses
the same `slt` with the operands swapped — "b < a" *is* "a > b":

```asm
slt  v0, a1, a0    # v0 = (b < a) ? 1 : 0 — i.e. a > b
jr   ra
nop
```

Identical mnemonic, identical registers, opposite meaning — the only
difference is which operand comes first. So the reading rule is mechanical:

> `slt d, x, y` always means exactly `x < y`. Decode it literally, in
> operand order, *then* decide whether the C spells it `<` or a flipped `>`.

The target below puts both directions in one function: two `slt`s over the
same pair of arguments, one in each order, and a `subu` combining the two
booleans into a single result. Decode each compare literally, work out what
value the subtraction yields when `a` is bigger, smaller, or equal — you'll
recognize a classic comparator — and write it as one expression: two
parenthesized comparisons and an arithmetic operator.

## Your task

Write `func_80039180` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80039180(s32 a, s32 b) {
    return (a > b) - (a < b);
}
```
