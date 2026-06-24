---
id: int64-register-alignment
title: The Odd-Register Alignment Rule
difficulty: 3
concepts:
  - 64-bit
  - calling-convention
  - abi
symbol: aligned_64
hints:
  - A u64 argument must start on an *odd* register number, so a preceding u32 can leave a gap.
  - "With `u32 a` in r3, the `u64 b` skips r4 and occupies r5:r6 — so the body works on r5/r6, not r4/r5."
  - The C is just `return b + 5;` — the lesson is *which registers* that touches.
---

# Why a register sometimes gets skipped

The ABI requires a 64-bit argument's register pair to **start on an odd-numbered
register** (r3, r5, r7, r9). Most of the time that's automatic. But when a
narrower argument comes first, it can leave a register **unused** to keep the
pair aligned.

Consider `show_align(u32 x, u64 y)`:

- `x` (a `u32`) takes `r3`.
- `y` would naturally fall into `r4:r5` — but `r4` is **even**, so it's skipped.
- `y` aligns up to **`r5:r6`** instead, leaving `r4` empty.

So `return y + 10;` operates on `r5:r6`, not the `r4:r5` you might expect:

```asm
li     r3, 10
li     r0, 0
addc   r4, r6, r3     # low:  y_lo (r6) + 10
adde   r3, r5, r0     # high: y_hi (r5) + 0 + carry
blr
```

This is a frequent source of confusion when reading real code: an argument
register appears to go unused for no reason. The reason is alignment — the 64-bit
value behind it had to bump up to the next odd register. Spot the skipped
register and the signature suddenly makes sense.

## Your task

Write `aligned_64`, taking a `u32` then a `u64`, to reproduce the assembly above.

<!-- starter -->
```c
u64 aligned_64(u32 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u64 aligned_64(u32 a, u64 b) {
    return b + 5;
}
```
