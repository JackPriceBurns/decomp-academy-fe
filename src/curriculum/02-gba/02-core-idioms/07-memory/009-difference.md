---
id: 1b86c4a6-ca24-447a-b068-c85d1eee71c9
slug: gba-memory-difference
title: Subtracting Pointers
difficulty: 3
concepts:
  - pointers
  - addressing
  - strength-reduction
symbol: func_08218f0c
hints:
  - The `asr` is a divide by the element size, so it tells you what the two
    pointers point at. Nothing in the C wrote a shift.
  - It takes two `u16 *` arguments and returns an `s32`. The three-operand `sub`
    puts the second argument on the left of the subtraction.
---

# The difference is measured in elements

Subtracting two pointers gives the number of *elements* between them, not the
number of bytes. The machine only works in bytes. So it subtracts the addresses
and then divides by the element size. When the size is a power of two, that
division is one shift.

```asm
0        sub       r0, r1
2        asr       r0, #2
4        bx        lr
```

Each element is four bytes, so the byte difference is shifted right by two. The
shift is arithmetic, not logical, because a pointer difference is signed:
`a - b` can be negative.

For byte pointers, the division is by one and disappears completely:

```asm
0        sub       r0, r1
2        bx        lr
```

A plain `sub` of two registers, with the result used as a number and not as an
address, is a pointer difference on 8-bit elements. Nothing else in the listing
separates it from ordinary integer subtraction. Nothing needs to, because the C
has the same form either way.

Watch the operand order. Thumb's two-operand `sub rD, rS` computes
`rD - rS`, so the destination is also the left-hand side. When the C subtracts
the arguments the other way round, that form cannot express it, so gcc uses the
three-operand `sub rD, rS, rM` instead. If you see three registers on a `sub`
and the destination is one of the sources, the arguments appear in the opposite
order in the C.

Your target does something with the difference before it returns.

## Your task

Write `func_08218f0c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08218f0c(u16 *p, u16 *q) {
    return q - p + 1;
}
```
