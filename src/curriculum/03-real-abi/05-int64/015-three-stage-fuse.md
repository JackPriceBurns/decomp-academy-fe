---
id: int64-three-stage-fuse
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

This is the finale exercise for 64-bit integers. It threads three of the
operations you've learned — a carry chain, a borrow chain, and a bitwise mask —
into a single expression across **four** 64-bit operands. The reading strategy
never changes: scan for *pairs*, identify each as add / subtract / bitwise by
its mnemonic, and follow the running value from one pair into the next.

Consider `blend3(p, q, r, s)`, which adds three 64-bit values and then ORs the
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

Three stages, six instructions plus the `blr`. The first `addc`/`adde` build
`p + q`; the second `addc`/`adde` fold in `r`, leaving the running sum split
across a scratch high word and a low word; the two `or`s then mask in `s` with
no carry between halves. The fourth 64-bit argument `s` arrives in the `r9:r10`
pair — keep tracking register numbers, because by now the operands no longer sit
where they started.

The target rearranges the operators: it still has three stages over four
operands, but the middle stage carries a *borrow* rather than a carry, and the
final stage uses a different bitwise op. Break it at each pair boundary, name
each operation from its instruction, and rebuild the full expression in order.

## Your task

Write `fuse_64`, taking four `u64`s, to reproduce the assembly above.

<!-- starter -->
```c
u64 fuse_64(u64 a, u64 b, u64 c, u64 d) {
    return 0;
}
```

<!-- solution -->
```c
u64 fuse_64(u64 a, u64 b, u64 c, u64 d) {
    return (a + b - c) & d;
}
```
