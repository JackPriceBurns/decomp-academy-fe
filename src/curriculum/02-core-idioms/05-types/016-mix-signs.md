---
id: types-mix-signs
title: Mixed Signedness in One Expression
difficulty: 3
concepts:
  - widening
  - zero-extension
  - sign-extension
  - mixed-signedness
  - operand-order
symbol: mix_signs
hints:
  - "One operand zero-extends (`clrlwi`), the other sign-extends (`extsb`/`extsh`)
    — the extend each operand gets is decided by *its own* declared signedness,
    not the other's."
  - "A subtraction of two values is `subf rD, rA, rB`, which computes `rB − rA`;
    watch which widened operand ends up subtracted from which."
---

# Signedness is decided per operand, not per expression

When one operand is signed and the other unsigned, there is no single rule for
the whole expression — each value is extended according to **its own** type. The
unsigned one zero-extends (`clrlwi`), the signed one sign-extends
(`extsb`/`extsh`), and then the arithmetic combines the two full-width results.
Mixing signedness in one expression therefore shows *both* extend kinds
side-by-side.

Consider `merge(a, b)` adding a signed `s16` and an unsigned `u8`:

```asm
extsh  r3, r3      # a: sign-extend (s16 is signed)
clrlwi r0, r4, 24  # b: zero-extend (u8 is unsigned)
add    r3, r3, r0
blr
```

The `extsh` and the `clrlwi` sitting next to each other are the tell: this is one
signed and one unsigned operand. Read each extend independently — its kind gives
the signedness, its width (the `clrlwi` shift, or `extsb` vs `extsh`) gives the
width.

The target subtracts rather than adds, so it ends in **`subf`** instead of `add`.
Recall `subf rD, rA, rB` computes `rB − rA` — the operand order in the C
expression decides which widened value is subtracted from which, so match it
carefully.

## Your task

Write `mix_signs`, taking a `u8` and an `s8` and returning their difference as an
`int`, to match the target assembly. Both extends and the `subf` must line up.

<!-- starter -->
```c
int mix_signs(u8 a, s8 b) {
    return 0;
}
```

<!-- solution -->
```c
int mix_signs(u8 a, s8 b) {
    return a - b;
}
```
