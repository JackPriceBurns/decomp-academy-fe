---
id: types-widen-zero-vs-sign
title: "Widening: Zero vs Sign Extend"
difficulty: 2
concepts:
  - widening
  - sign-extension
  - zero-extension
symbol: widen_u8
hints:
  - Widening an unsigned byte to a word zero-extends — a mask, not a sign-extend.
  - "`return x;` compiles to `clrlwi r3, r3, 24` (keep the low 8 bits)."
---

# Same value, two ways to fill the top bits

Widening a narrow *value already in a register* (not a fresh load) shows the
sign/unsigned split clearly. A **`u8 → u32`** widen zero-extends with a
rotate-mask, printed as **`clrlwi`** (clear left word immediate) — here clearing
the top 24 bits:

```asm
clrlwi r3, r3, 24   # keep low 8 bits, zero the rest
blr
```

A signed **`s8 → s32`** widen instead sign-extends with **`extsb`**:

```asm
extsb r3, r3        # replicate bit 7 into the top 24 bits
blr
```

`clrlwi r3, r3, 24` and `extsb r3, r3` differ only in whether the high bits become
zeros or copies of the sign bit — exactly the unsigned-vs-signed choice. (For
this lesson we widen the *unsigned* case.)

`clrlwi` is just a readable spelling of an `rlwinm` rotate-mask: `clrlwi r3, r3,
24` is the same instruction as `rlwinm r3, r3, 0, 24, 31`. Some disassemblers
print the raw `rlwinm` form, so treat the two as identical when reading a diff.

## Your task

Write `widen_u8`, taking a `u8 x` and returning it as a `u32`. The unsigned widen
should emit a single `clrlwi`.

<!-- starter -->
```c
u32 widen_u8(u8 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 widen_u8(u8 x) {
    return x;
}
```
