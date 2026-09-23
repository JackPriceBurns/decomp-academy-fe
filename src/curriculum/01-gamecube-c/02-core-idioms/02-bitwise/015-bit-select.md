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
symbol: func_800cf2c8
hints:
  - "`andc rD, rA, rB` computes `rA & ~rB` in one instruction — AND-with-complement."
  - One operand is ANDed with the mask, the other with the complement of the mask; then
    the two results are ORed together.
---

# Bit select: taking bits from two values with a mask

A bit select builds a result from two values and a mask. For each bit
position, the mask decides which value the bit comes from. Where the mask bit is
1, the result takes that bit from one value. Where it is 0, it takes the bit
from the other value.

In C this takes four operations: an AND to keep one value's bits where the mask
is 1, a NOT to invert the mask, a second AND to keep the other value's bits
where the mask is 0, and an OR to combine the two. PowerPC needs only three
instructions, because it has one instruction that does the NOT and an AND
together.

## `andc`: AND with complement

`andc rD, rA, rB` computes `rA & ~rB`. The second source register, `rB`, is
inverted before the AND, so no separate NOT instruction is needed. The operand
order matters: only `rB` is inverted.

Here is a function that clears some bits in a flags word and then sets others:

```c
u32 update_flags(u32 flags, u32 clear, u32 set) {
    return (flags & ~clear) | set;
}
```

```asm
andc    r0,r3,r4
or      r3,r5,r0
blr
```

The arguments arrive in `r3`, `r4` and `r5`. `andc r0, r3, r4` computes
`flags & ~clear`, and the `or` then adds the bits from `set`. There is no NOT
instruction in the output. When you see `andc`, the `~` belongs on the operand
in the `rB` slot.

## Reading a bit select

A bit select compiles to an `and`, an `andc` and an `or`. To read one:

- The register that appears in both the `and` and the `andc` is the mask.
- The other input to the `and` is the value kept where the mask is 1.
- The `rA` input to the `andc` is the value kept where the mask is 0.
- The `or` combines the two results. The two ANDs keep different bit positions,
  so every bit of the result comes from exactly one of the values.

MWCC computes the left side of the `|` first, so the order of the `and` and
the `andc` tells you which side you wrote each term on. If your version
compiles to the right instructions in the wrong order, swap the two sides of
the `|`.

## Your task

Write `func_800cf2c8` to reproduce the assembly above.

<!-- solution -->
```c
int func_800cf2c8(int a, int b, int m) {
    return (a & m) | (b & ~m);
}
```
