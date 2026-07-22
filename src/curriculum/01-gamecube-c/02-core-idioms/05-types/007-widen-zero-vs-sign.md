---
id: 7ea3ae3a-ef9c-529b-8218-67e561937d10
slug: types-widen-zero-vs-sign
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

This split is easiest to see when the narrow value is *already in a register*
instead of coming from a fresh load. Widening a **`u8 → u32`** zero-extends, and
the compiler does it with a rotate-mask that disassembles to **`clrlwi`** (clear
left word immediate). Here it clears the top 24 bits:

```asm
clrlwi r3, r3, 24   # keep low 8 bits, zero the rest
blr
```

The signed version, a **`s8 → s32`** widen, uses **`extsb`** instead. That copies
the sign bit upward rather than masking the high bits to zero:

```asm
extsb r3, r3        # replicate bit 7 into the top 24 bits
blr
```

So `clrlwi r3, r3, 24` and `extsb r3, r3` do almost the same job. The only
difference is what lands in the high bits, zeros for the unsigned case and copies
of the sign bit for the signed one. (This lesson is the *unsigned* one.)

Watch out for the `rlwinm` alias as well. `clrlwi` is just the readable name for a
particular rotate-mask, so `clrlwi r3, r3, 24` and `rlwinm r3, r3, 0, 24, 31` are
the same encoding. If your disassembler prints the raw `rlwinm`, treat it as the
`clrlwi` you expected.

## Your task

Write `widen_u8`, taking a `u8 x` and returning it as a `u32`. The unsigned widen
should emit a single `clrlwi`.

<!-- solution -->
```c
u32 widen_u8(u8 x) {
    return x;
}
```
