---
id: 778ea59d-85dd-51fa-9a1a-56c1d4cee649
slug: int64-bitwise
title: Bitwise Ops Are Just Two Halves
difficulty: 2
concepts:
  - 64-bit
  - bitwise
  - detection
symbol: func_801e3a94
hints:
  - AND/OR/XOR have no carry between halves, so each is just the 32-bit op done twice.
  - "`and r4,r4,r6` then `and r3,r3,r5` — low pair, then high pair."
  - The instruction mnemonic (`and`/`or`/`xor`) names the single operator the source used.
---

# No carry, no fingerprint

Bitwise ops have no carry. Each bit stands alone, so nothing flows between the
low and high halves of a `u64`. A 64-bit AND, OR, or XOR is therefore just the
32-bit instruction run twice, once on each half:

```asm
and    r4, r4, r6     # low half
and    r3, r3, r5     # high half
blr
```

With `a` in `r3:r4` and `b` in `r5:r6`, `and r4, r4, r6` ANDs the low words and
`and r3, r3, r5` ANDs the high words, leaving the result in `r3:r4`. Swap the
mnemonic for `or` or `xor` and you have `or_64` or `xor_64`, the same
two-instruction shape.

Because there's no carry, these are the hardest 64-bit ops to identify. That pair
of `and`s is byte-for-byte what you'd get ANDing two unrelated 32-bit pairs, with
no carrying instruction and no helper call to mark it as one wide value.

You usually can't prove width from the bitwise op alone; the surrounding code
settles it. A result flowing into an `adde`, a `mulhwu` burst, a `__div2u` call,
or a 64-bit compare is what tells you the AND was working on a 64-bit value.

## Your task

Write `func_801e3a94` to match the target.

<!-- solution -->
```c
u64 func_801e3a94(u64 a, u64 b) {
    return a & b;
}
```
