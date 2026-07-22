---
id: 1103f32c-95ce-5788-b013-24673be3f3ba
slug: types-mix-signs
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

A mixed-sign expression has no house rule. Sign one operand, leave the other
unsigned, and the compiler quietly asks each value on its own how it means to
grow to 32 bits. Whichever one is unsigned gets a `clrlwi` to scrub its upper
bits clean, while the signed value instead has its sign dragged upward by `extsb`
or `extsh`. Only with both stretched to full width does the arithmetic get its
turn, which is the whole reason you end up staring at two different extends parked
right beside each other.

Look at `merge(a, b)`, which adds a signed `s16` to an unsigned `u8`:

```asm
extsh  r3, r3      # a: sign-extend (s16 is signed)
clrlwi r0, r4, 24  # b: zero-extend (u8 is unsigned)
add    r3, r3, r0
blr
```

Spot `extsh` next to `clrlwi` and the story tells itself, one signed operand
sharing the expression with one unsigned. The trick is to read them apart instead
of as a pair. Whichever extend you are looking at, its kind nails down the
signedness, while the width is whatever its reach implies, be that the `clrlwi`
count or the `extsb`-versus-`extsh` pick.

Your target subtracts where this one added, so its final instruction is `subf`
rather than `add`. The wrinkle to remember is that `subf rD, rA, rB` works out
`rB − rA`, so the order your operands take in the C is precisely what decides
which widened value gets pulled out of which. Get that ordering right.

## Your task

Write `mix_signs` to match the target assembly. Both extends and the `subf` must line up.

<!-- solution -->
```c
int mix_signs(u8 a, s8 b) {
    return a - b;
}
```
