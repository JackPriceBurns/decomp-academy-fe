---
id: int64-downcast-chain
title: "Chaining: A Downcast Prunes the Chain"
difficulty: 4
concepts:
  - 64-bit
  - types
  - detection
  - chaining
  - downcast
symbol: and_down_64
hints:
  - The return type is `u32`, so only the low word matters — every high-word instruction in the chain is dropped.
  - What survives is the low half of each operation; the leading carrying instruction (`addc`/`subfc`) still betrays that the operands were 64-bit.
  - Three `u64` parameters but a `u32` result; combine the first two arithmetically, then the third bitwise, and the cast keeps the low word.
---

# What a downcast leaves behind

You met the downcast fingerprint on a single operation: a `u64 + u64` truncated
to `u32` still emits an `addc`, even though the carry it records is never used.
When the wide expression is a *chain*, the downcast is even more dramatic — the
compiler keeps only the low-word instruction of every step and discards the
entire high-word half of the computation.

Consider `low_combo(p, q, r)`, which subtracts two 64-bit values, ORs in a
third, and returns only the low 32 bits:

```asm
subfc  r4, r6, r4     # (p - q) low word -- carry recorded, never read
or     r3, r8, r4     # ( ... | r) low word, delivered straight to r3
blr
```

Compare this to the full-width version, which would also carry the borrow into a
`subfe` on the high words and OR the high words together. None of that appears:
because the result is `u32`, every high-word instruction is dead code, so MWCC
never emits it. What's left is one low-word instruction per operation. The
leading `subfc` is the giveaway — a plain 32-bit subtract would have been a bare
`subf`, so the carrying form proves the operands were 64-bit even though only 32
bits survive.

The target follows the same pattern with a different arithmetic operation and a
different bitwise operation, again truncated to `u32`. Read each surviving
low-word instruction to recover the operation, and remember the cast is what
collapsed the chain.

## Your task

Write `and_down_64`, taking three `u64`s and returning a `u32`, to reproduce the
assembly above.

<!-- starter -->
```c
u32 and_down_64(u64 a, u64 b, u64 c) {
    return 0;
}
```

<!-- solution -->
```c
u32 and_down_64(u64 a, u64 b, u64 c) {
    return (u32)((a + b) & c);
}
```
