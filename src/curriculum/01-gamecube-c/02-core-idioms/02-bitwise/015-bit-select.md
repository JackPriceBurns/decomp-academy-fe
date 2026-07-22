---
id: 733cb29a-0435-54a7-852b-8bc70b8ab62f
slug: bitwise-bit-select
title: "Bit Select (Mux): AND, ANDC, OR"
difficulty: 3
concepts:
  - bitwise
  - and
  - andc
  - or
  - chaining
symbol: bit_select
hints:
  - "`andc rD, rA, rB` computes `rA & ~rB` in one instruction — AND-with-complement."
  - One operand is ANDed with the mask, the other with the complement of the mask; then
    the two results are ORed together.
---

# Bit select: choosing bits from two sources with a mask

A bit-select, or bitwise mux if you prefer, builds a result one bit at a time
out of two sources. Where the mask bit is 1, you copy from one source; where it's
0, from the other. In C that's three operations, two ANDs and an OR. PowerPC
shaves it to two by killing one of the ANDs.

The instruction earning that saving is **`andc rD, rA, rB`**. It works out
`rA & ~rB` by itself, no separate `not` sitting in front of it.

Say `bit_blend(x, y, mask)` pulls bits from `x` where the mask is clear and from
`y` where it's set.

```asm
andc    r3,r3,r5
and     r0,r4,r5
or      r3,r3,r0
blr
```

The `andc r3, r3, r5` gives you `x & ~mask`, so `x` survives only at the bit
positions where the mask reads 0. Its partner `and r0, r4, r5` does the mirror
image, `y & mask`, keeping `y` where the mask reads 1. Now the two halves cover
disjoint positions, so `or r3, r3, r0` can glue them into a single word and you
land exactly one bit, from `x` or `y`, at every position. Never both. Never
neither.

Your target walks those same three instructions in the same order, just with the
registers shuffled. Spot which one carries the mask (`r5`), which feeds the
`andc`, and which feeds the `and`, and the C falls right out.

## Your task

Write `bit_select` to reproduce the assembly above.

<!-- solution -->
```c
int bit_select(int a, int b, int m) {
    return (a & m) | (b & ~m);
}
```
