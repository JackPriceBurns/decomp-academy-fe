---
id: 2b141330-eeff-45e3-9120-bdeb46b4d975
slug: gba-arithmetic-pooled-constant
title: Constants From the Pool
difficulty: 3
concepts:
  - constants
  - literal-pool
  - immediates
symbol: func_0804f1b8
hints:
  - A pool word larger than 2147483648 is a negative number - subtract
    4294967296 to read it. The `add` that uses it is gcc's rewrite of a
    subtraction.
  - "Two `s32` parameters in, an `s32` out. The register arithmetic is first
    minus second, and the pooled constant is 4660 being taken away."
---

# The number is in the listing, and it may be negative

When no small value shifted left reaches the constant, gcc gives up on building
it and parks the full 32-bit word in the literal pool after the function, then
loads it:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        bx        lr
6        .hword    0
8        .word     5000
```

5000 is 625 << 3, and 625 does not fit in the eight-bit `mov`, so the pool it is.
The `.word` is the constant, printed in decimal, and reading it back is a matter
of copying the number.

Then there is the case that catches everyone. Here is a function subtracting
300:

```asm
0        ldr       r2, [pc, #4] (->8)
2        add       r0, r1, r2
4        bx        lr
6        .hword    0
8        .word     4294966996
```

The instruction is an `add`, and the constant is enormous. Both of those are the
same fact: gcc rewrites `value - K` as `value + (-K)`, and −300 stored in 32 bits
is 4294967296 − 300 = 4294966996. To read a pool word, check whether it is above
2147483648; if it is, subtract 4294967296 and you have the negative number the
source actually wrote.

This is why **every** subtraction of a constant past 255 comes out as a pool
load. A negative number can never be a small value shifted left, so the
`mov`/`lsl` trick from the last lesson is unavailable no matter how tidy the
constant looks in decimal. Adding 1024 is three instructions; subtracting 1024 is
a pool word.

One last detail from the two listings above: the `.hword 0` between the code and
the `.word` is alignment padding, because a word has to start at a multiple of
four and both functions ended at address 6. A function whose code already ends on
a multiple of four gets no padding row, so the pool word sits directly after
`bx lr`. Neither row is an instruction — but both are part of the function you
are matching.

## Your task

Write `func_0804f1b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0804f1b8(s32 a, s32 b) {
    return (a - b) - 4660;
}
```
