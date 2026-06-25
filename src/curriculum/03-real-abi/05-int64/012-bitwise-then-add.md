---
id: int64-bitwise-then-add
title: "Chaining: A Bitwise Pair Feeds a Carry Chain"
difficulty: 3
concepts:
  - 64-bit
  - bitwise
  - arithmetic
  - carry
  - chaining
symbol: xor_add_64
hints:
  - Two stages — a flag-less bitwise pair (low then high) whose result then flows into an `addc`/`adde` carry chain.
  - The bitwise op has no carry, so its high word is computed independently; the carrying instructions appear only in the second stage.
  - Three `u64` parameters; combine the first two with a bitwise operator, then combine that with the third arithmetically.
---

# Inline result, then a carry chain

Bitwise ops and carry arithmetic look very different in the assembly — one has
no flag between halves, the other lives or dies by it. When they appear in one
expression, you can read them in order: the bitwise pair runs first, parks its
two-word result in registers, and the carrying pair consumes it.

Consider `mask_then_sub(p, q, r)`, which ORs two 64-bit values together and then
subtracts a third:

```asm
or     r4, r4, r6     # (p | q) low   -- no carry between halves
or     r0, r3, r5     # (p | q) high
subfc  r4, r8, r4     # (... - r) low,  set borrow
subfe  r3, r7, r0     # (... - r) high, consume borrow
blr
```

The two `or`s are the bitwise stage: each half is independent, so there's no
flag and they can run in either order. The result sits in the `r0:r4` pair,
which then feeds the `subfc`/`subfe` subtract. The borrow flag only appears in
the second stage — the bitwise op never touches it.

The target keeps this two-stage shape but swaps which bitwise operator runs
first and which arithmetic operation follows. Identify the bitwise pair by its
flag-free mnemonic, then read the carrying pair to recover the second operation,
and thread the running value from one stage into the next.

## Your task

Write `xor_add_64`, taking three `u64`s, to reproduce the assembly above.

<!-- starter -->
```c
u64 xor_add_64(u64 a, u64 b, u64 c) {
    return 0;
}
```

<!-- solution -->
```c
u64 xor_add_64(u64 a, u64 b, u64 c) {
    return (a ^ b) + c;
}
```
