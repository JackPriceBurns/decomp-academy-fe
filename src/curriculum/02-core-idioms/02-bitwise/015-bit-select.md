---
id: bitwise-bit-select
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

A bit-select (sometimes called a bitwise mux) picks individual bits from one of
two sources depending on a mask: where the mask is 1 take from one source, where
it is 0 take from the other. In C that is three operations — two ANDs and an OR —
but PowerPC has an instruction that eliminates one of the ANDs.

**`andc rD, rA, rB`** computes `rA & ~rB`, AND-with-complement, in a single
instruction. No separate `not` needed.

Consider `bit_blend(x, y, mask)`, which selects bits from `x` where the mask is
clear and from `y` where the mask is set:

```asm
andc    r3,r3,r5
and     r0,r4,r5
or      r3,r3,r0
blr
```

- `andc r3, r3, r5` = `x & ~mask` (keeps `x` bits where the mask is 0).
- `and  r0, r4, r5` = `y & mask`  (keeps `y` bits where the mask is 1).
- `or   r3, r3, r0` merges both halves: the final register holds one bit from
  `x` or `y` at every position, never both and never neither.

The target assembly does the same three-instruction sequence in the same order,
but with operands in different registers. Identify which register holds the mask
(`r5`), which register contributes bits through `andc`, and which through `and`,
then express that in C.

## Your task

Write `bit_select`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int bit_select(int a, int b, int m) {
    return 0;
}
```

<!-- solution -->
```c
int bit_select(int a, int b, int m) {
    return (a & m) | (b & ~m);
}
```
