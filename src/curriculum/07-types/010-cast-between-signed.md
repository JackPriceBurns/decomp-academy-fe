---
id: types-cast-between-signed
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

Converting between two *signed* widths follows the value's own sign. Promoting an
**`s8`** to an **`s16`** must preserve negativity, so the byte is sign-extended —
and since the byte is the narrower type, that's an **`extsb`** (the halfword
result still carries the correct sign in its low 16 bits):

```asm
extsb r3, r3        # s8 -> s16, sign preserved
blr
```

The rule generalizes: when the *source* is signed, a widening conversion
sign-extends from the source width. When the source is unsigned, the same
conversion would zero-extend (a `clrlwi`) instead — a `u8 → u16` widen keeps the
low 8 bits and clears the rest:

```asm
clrlwi r3, r3, 24   # u8 -> u16, zero-extended (no sign to preserve)
blr
```

The signedness of the value you start from is what picks `extsb`/`extsh` versus a
mask.

## Your task

Write `s8_to_s16`, taking an `s8 x` and returning it as an `s16`. The signed
widen should emit a single `extsb`.

<!-- starter -->
```c
s16 s8_to_s16(s8 x) {
    return 0;
}
```

<!-- solution -->
```c
s16 s8_to_s16(s8 x) {
    return x;
}
```
