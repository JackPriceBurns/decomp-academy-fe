---
id: fd592871-2c35-51e6-8916-d96229deb3d5
slug: bitwise-and-mask
title: Masking Bits With AND
difficulty: 1
concepts:
  - bitwise
  - and
  - masks
symbol: func_803564a0
hints:
  - AND against a small constant mask uses the immediate form.
  - "`x & 0x12` compiles to `andi. r3, r3, 18` (0x12 == 18)."
  - The dot records flags in `cr0`; this target does not use them.
---

# Keeping only the bits you want

Masking throws away the bits you don't care about. AND a number with a mask and
only the mask's set bits survive; everything else collapses to zero. When those
set bits lie scattered rather than forming a single run, MWCC falls back to its
immediate AND, `andi.`.

Watch `n` get masked with `0x0A` — decimal 10, bits 1 and 3 set:

```asm
andi.  r3, r3, 10
blr
```

Only 16 bits fit in that immediate, which pins `andi.` to the low half-word and
nothing above it. The dot marks the record form: `cr0` gets LT, GT, or EQ
from a signed comparison of the result with zero, plus SO copied from the
summary-overflow flag. MWCC emits `andi.` even when these flags go unread,
because PowerPC has no dotless immediate AND.

(A run of contiguous bits compiles another way — "Testing Whether a Bit Is Set"
covers that. Because `0x0A` splits its set bits apart, `andi.` is what you land
on.)

Recover the target mask from its immediate, then write the C expression that
reproduces it.

## Your task

Write `func_803564a0` to match the target.

<!-- solution -->
```c
u32 func_803564a0(u32 x) {
    return x & 0x12;
}
```
