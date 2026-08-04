---
id: 8c9b9b57-2b5f-5576-b3e2-0f4c5583d04b
slug: int64-bitwise-then-add
title: "Chaining: A Bitwise Pair Feeds a Carry Chain"
difficulty: 3
concepts:
  - 64-bit
  - bitwise
  - arithmetic
  - carry
  - chaining
symbol: func_80326e6c
hints:
  - Two stages — a flag-less bitwise pair (low then high) whose result then flows into an `addc`/`adde` carry chain.
  - The bitwise op has no carry, so its high word is computed independently; the carrying instructions appear only in the second stage.
  - Three `u64` parameters; combine the first two with a bitwise operator, then combine that with the third arithmetically.
---

# Inline result, then a carry chain

Two operators, two very different shapes in the assembly. A bitwise `or` works
each 32-bit half on its own and sets no carry flag, so its two instructions can
even swap order. A carry op cannot: `addc` sets the flag, `adde` reads it, low
word then high. Put a bitwise pair and a carry pair in the same expression and
they simply run in turn, the first feeding its `r0:r4` result to the second.

Here is `mask_then_sub(p, q, r)`. It ORs two 64-bit values and then subtracts a
third:

```asm
or     r4, r4, r6     # (p | q) low   -- no carry between halves
or     r0, r3, r5     # (p | q) high
subfc  r4, r8, r4     # (... - r) low,  set borrow
subfe  r3, r7, r0     # (... - r) high, consume borrow
blr
```

Stage one is the two `or`s, low into `r4` and high into `r0`. No flag links
them. Stage two is the `subfc`/`subfe` pair, which reads that `r0:r4` value and
subtracts `r`. The borrow belongs to stage two alone. Nothing in the `or`s ever
sets it.

Your target wears the same two-stage shape but with different operators. Name
the flag-free pair to get the first operation. Name the carrying pair to get the
second. Carry the `r0:r4` value from the first into the second, and the
expression is yours.

## Your task

Write `func_80326e6c` to reproduce the assembly above.

<!-- solution -->
```c
u64 func_80326e6c(u64 a, u64 b, u64 c) {
    return (a ^ b) + c;
}
```
