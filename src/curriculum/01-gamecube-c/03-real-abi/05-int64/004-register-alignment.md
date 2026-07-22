---
id: ccd42f31-2043-5d82-9fae-5c67cd5b458e
slug: int64-register-alignment
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
  - The body is a single add of a small constant onto the second parameter — the lesson is *which registers* that touches.
---

# Why a register sometimes gets skipped

Now and then you'll read a function whose first argument sits in `r3` while the
second seems to ignore `r4` completely. That isn't a bug. It follows from the
rule that a 64-bit argument's register pair must begin on an odd register, one of
r3, r5, r7, r9.

Walk through `show_align(u32 x, u64 y)`. The `u32 x` takes `r3`. The pair for `y`
would be `r4:r5`, except `r4` is even, so `y` aligns up to `r5:r6` and `r4` goes
unused. That is why `return y + 10;` operates on `r5:r6` and not the `r4:r5` you
might have read straight off the prototype:

```asm
li     r3, 10
li     r0, 0
addc   r4, r6, r3     # low:  y_lo (r6) + 10
adde   r3, r5, r0     # high: y_hi (r5) + 0 + carry
blr
```

When a 64-bit value leads the argument list none of this happens; the pair
already starts on an odd register. It only bites when a narrower argument forces
the gap. Find the skipped register first and the rest of the signature lines up.

## Your task

Write `aligned_64` to reproduce the assembly above.

<!-- solution -->
```c
u64 aligned_64(u32 a, u64 b) {
    return b + 5;
}
```
