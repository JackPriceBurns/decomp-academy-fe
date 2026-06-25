---
id: bitwise-shift-or-pack
title: Packing Two Values with a Shift and OR
difficulty: 2
concepts:
  - bitwise
  - shift
  - or
  - chaining
symbol: pack_shift_or
hints:
  - "`slwi rD, rA, n` shifts rA left by n bits, the same shift you'd write `<< n` in C."
  - The `or` joins two registers bit-by-bit — which register holds the shifted value,
    and which holds the unshifted one?
---

# A shift feeding an OR

Bitwise chaining starts the moment the result of one operation becomes an input
to the next. The simplest case: shift a value left to make room, then OR another
value into the vacated low bits.

Consider `make_word(hi, lo)`, which shifts the high part left by 16 bits and
slots the low part into the bottom half:

```asm
slwi    r0,r3,16
or      r3,r0,r4
blr
```

`slwi r0, r3, 16` is *shift left word immediate* — it moves every bit of `r3`
up by 16 positions and writes the result into `r0`. The 16 low bits of `r0` are
now zero, creating a gap. `or r3, r0, r4` then fills that gap with `r4`: any bit
set in either operand appears in `r3`.

The chain is two instructions but one conceptual operation: the `slwi` result is
live for exactly one cycle before `or` consumes it.

For the target assembly, read the `slwi` shift amount to know how far the high
value is being moved, then check the `or` to see which register provides each
half.

## Your task

Write `pack_shift_or`, taking two `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int pack_shift_or(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int pack_shift_or(int a, int b) {
    return (a << 8) | b;
}
```
