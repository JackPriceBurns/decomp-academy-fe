---
id: 1ef4f0cd-4c3d-58b4-9e72-c708e005871c
slug: arithmetic-div-pow2-signed
title: Signed Divide by a Power of Two
difficulty: 3
concepts:
  - strength-reduction
  - shifts
  - signed
  - rounding
symbol: sdiv4
hints:
  - Signed divide by a power of two is an arithmetic shift plus a rounding fixup.
  - Look for `srawi` followed by `addze` — the carry corrects the rounding for
    negatives.
---

# Signed division rounds, so it needs a fixup

Last lesson the unsigned case reduced to a single clean `srwi`. Signed division
won't sit still that easily. C rounds *toward zero* while an arithmetic shift
rounds *toward negative infinity*, and for a negative dividend those two
disagree. In C, `-1 / 4` is `0`, but `-1 >> 2` comes out as `-1`. To paper over
the gap, MWCC bolts on a correction:

```asm
srawi r0, r3, 2    # x >> 2, biased the wrong way for negatives
addze r3, r0       # add the carry back: +1 only when x was negative
blr
```

The `srawi` does the arithmetic shift, and it sets the carry bit whenever it
shifts a 1 out of a negative value. Then `addze` ("add to zero, extended with
carry") reads that carry and nudges the quotient back toward zero, but only when
it's actually needed. Feed it a positive dividend and there's no carry, so
`addze` contributes nothing. Whenever you spot the **`srawi` + `addze`** pairing,
you're looking at a signed divide by a power of two; the unsigned version never
grows that second instruction.

## Your task

Write `sdiv4`, taking a signed `int x`, to reproduce the `srawi`/`addze` pair above.

<!-- starter -->
```c
int sdiv4(int x) {
    return 0;
}
```

<!-- solution -->
```c
int sdiv4(int x) {
    return x / 4;
}
```
