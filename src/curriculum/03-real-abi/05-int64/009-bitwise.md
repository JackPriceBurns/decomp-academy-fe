---
id: int64-bitwise
title: Bitwise Ops Are Just Two Halves
difficulty: 2
concepts:
  - 64-bit
  - bitwise
  - detection
symbol: and_64
hints:
  - AND/OR/XOR have no carry between halves, so each is just the 32-bit op done twice.
  - "`and r4,r4,r6` then `and r3,r3,r5` — low pair, then high pair."
  - Just write `a & b` on two `u64` parameters.
---

# No carry, no fingerprint

Bitwise operations treat each bit independently — there's no carry or borrow to
flow between the two halves. So a 64-bit AND, OR, or XOR is simply the ordinary
32-bit instruction applied **once per half**:

```asm
and    r4, r4, r6     # low half
and    r3, r3, r5     # high half
blr
```

`or_64` and `xor_64` are identical with `or` / `xor` substituted in.

This makes the bitwise ops the **least identifiable** 64-bit operations. Two
back-to-back `and`s on neighbouring registers are *exactly* what you'd get from
ANDing two pairs of unrelated 32-bit values — there's no carrying instruction, no
intrinsic call, nothing that says "this is one 64-bit value."

The practical takeaway: you usually **can't** prove a value is 64-bit from a
bitwise op alone. You confirm it from the *company it keeps* — if the result
flows into an `adde`, a `mulhwu` burst, a `__div2u` call, or a 64-bit compare,
*then* you know the bitwise op was operating on a 64-bit value too.

## Your task

Write `and_64` to match the target.

<!-- starter -->
```c
u64 and_64(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u64 and_64(u64 a, u64 b) {
    return a & b;
}
```
