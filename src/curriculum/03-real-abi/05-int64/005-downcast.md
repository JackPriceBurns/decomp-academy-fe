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
  - The math is 64-bit even though the return type is u32 — add two u64s, return u32.
  - "MWCC still emits `addc` on the low word, then just `mr r3,r4` to deliver it — the carry instruction gives away the hidden 64-bit add."
  - Return type is `u32`; both parameters are `u64`.
---

# When the result is narrow but the math isn't

A common puzzle: the assembly does 64-bit work, but the function returns a plain
32-bit value. This happens when you add two `u64`s and assign — or return — only
the low 32 bits. Call it a **downcast**.

Here's the tell. Even though only the low word survives, MWCC *still* computes the
add with the carrying instruction:

```asm
addc   r4, r4, r6     # 64-bit low-word add (carry recorded but unused)
mr     r3, r4         # deliver the low word as the u32 result
blr
```

A purely 32-bit `a + b` would emit a single plain `add r3, r3, r4` — **no `addc`**.
The fact that MWCC reaches for `addc` here, then throws the carry away, is a
fingerprint: it proves the *operands* were 64-bit even though the *result* is
narrow. (The same holds for `subfc` on a downcast subtraction.)

This is genuinely useful in the wild. ProDG optimizes the carry away and looks
identical to 32-bit math, but on **every MWCC version** the `addc`/`subfc`
survives — so on our compiler, a stray carrying instruction feeding a truncated
result is a reliable signal that a 64-bit type is hiding in the source.

## Your task

Write `add_64_downcast`: add two `u64`s but return the result as a `u32`.

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
