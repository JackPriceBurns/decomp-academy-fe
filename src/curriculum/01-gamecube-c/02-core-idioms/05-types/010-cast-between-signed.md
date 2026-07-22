---
id: 9250cd40-e329-5f13-972b-a4082aea7c0e
slug: types-cast-between-signed
title: Casting Between Signed Widths
difficulty: 3
concepts:
  - casts
  - signed
  - sign-extension
symbol: s8_to_s16
hints:
  - Widening a signed byte preserves its sign, so it sign-extends.
  - "`return x;` compiles to `extsb r3, r3`."
---

# Widening a signed type keeps its sign

When both widths are *signed*, the conversion just carries the value's sign along
with it. Widen an **`s8`** up to an **`s16`** and a negative byte still needs to
read as negative, which means sign-extending it. The byte is the narrower side, so
that job lands on **`extsb`**, and the halfword it produces is correct in its low
16 bits:

```asm
extsb r3, r3        # s8 -> s16, sign preserved
blr
```

Flip the source to unsigned and the picture changes. There is no sign worth
preserving now, so a widening conversion zero-extends with a `clrlwi` rather than
sign-extending. A `u8 → u16` widen keeps the low 8 bits and clears the rest:

```asm
clrlwi r3, r3, 24   # u8 -> u16, zero-extended (no sign to preserve)
blr
```

What you start from is what matters. A signed source pulls in `extsb` or `extsh`,
and an unsigned source pulls in a mask.

## Your task

Write `s8_to_s16`, taking an `s8 x` and returning it as an `s16`. The signed
widen should emit a single `extsb`.

<!-- solution -->
```c
s16 s8_to_s16(s8 x) {
    return x;
}
```
