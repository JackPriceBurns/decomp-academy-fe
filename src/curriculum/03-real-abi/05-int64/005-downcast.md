---
id: int64-downcast
title: The Downcast Fingerprint
difficulty: 3
concepts:
  - 64-bit
  - types
  - detection
symbol: add_64_downcast
hints:
  - The operands are 64-bit even though the return type is narrow; the truncation happens in the cast, not the arithmetic.
  - "MWCC still emits `addc` on the low word, then just `mr r3,r4` to deliver it — the carry instruction gives away the hidden 64-bit add."
  - Return type is `u32`; both parameters are `u64`.
---

# When the result is narrow but the math isn't

A common puzzle: the assembly does 64-bit work, but the function returns a plain
32-bit value. This happens when the source computes with wide types but only the
low 32 bits are kept. Call it a **downcast**.

Here's the tell. Even though only the low word survives, MWCC *still* computes
using a carrying instruction. Compare a downcast subtraction with a plain 32-bit
one:

```asm
# u32 sub_down(u64 a, u64 b) — 64-bit operands, u32 result:
subfc  r4, r6, r4     # 64-bit low-word subtract (borrow recorded but unused)
mr     r3, r4         # deliver the low word as the u32 result
blr
```

A purely 32-bit `a - b` on `u32` operands would emit a single `subf r3, r4, r3`
— **no `subfc`**. The fact that MWCC reaches for `subfc` here and then throws
the carry away is a fingerprint: it proves the *operands* were 64-bit even
though the *result* is narrow.

This is genuinely useful in the wild. ProDG optimizes the carry away and looks
identical to 32-bit math, but on **every MWCC version** the `addc`/`subfc`
survives — so on our compiler, a stray carrying instruction feeding a truncated
result is a reliable signal that a 64-bit type is hiding in the source.

## Your task

Write `add_64_downcast` to reproduce the assembly above.

<!-- starter -->
```c
u32 add_64_downcast(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u32 add_64_downcast(u64 a, u64 b) {
    return a + b;
}
```
