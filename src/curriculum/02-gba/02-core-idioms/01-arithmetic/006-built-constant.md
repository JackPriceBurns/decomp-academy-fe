---
id: 5d234950-81f9-4fc8-8b5b-b7dc3e61bb4e
slug: gba-arithmetic-built-constant
title: Constants Built From Two Instructions
difficulty: 3
concepts:
  - immediates
  - constants
  - shifts
symbol: func_0804a874
hints:
  - Read the `mov` and the `lsl` as a single number - shift the moved value left
    by the shift amount and that is the constant the source wrote.
  - "Two `s32` parameters in, an `s32` out. The subtraction runs second minus
    first, and the built constant is added to that difference."
---

# Reading a constant out of a mov and a shift

Once a constant passes 255 no immediate field can hold it, so agbcc builds the
value in a spare register before using it. The first thing it tries is a small
number scaled by a power of two.

Here is `y + 2000`:

```asm
0        mov       r2, #250
2        lsl       r2, #3
4        add       r0, r1, r2
6        bx        lr
```

250 shifted left by 3 is 2000. Recovering the constant is that arithmetic run
forwards: **take the moved value, multiply by 2 to the power of the shift.**

The pair gcc picks is predictable. It uses the *smallest* shift that brings the
value under 256, so 2000 becomes 250 << 3 rather than 125 << 4, and 65280 comes
out like this:

```asm
0        mov       r1, #255
2        lsl       r1, #8
4        add       r0, r1
6        bx        lr
```

255 << 8. The moved value is always in 0..255 and the shift is whatever makes up
the difference.

Two details are worth noticing in those listings. The constant is built in a
**scratch** register — `r2` in the first, `r1` in the second — chosen from
whatever the arguments left free, so the register number tells you nothing about
the source. And in the first example the final add came out three-operand
(`add r0, r1, r2`) because the value being added to was still sitting in `r1`,
exactly the operand-order rule from earlier in this chapter.

Where the constant appears in the listing matters as well: gcc emits the whole
`mov`/`lsl` pair at the point the constant is *used*, so any register arithmetic
that comes first in the source comes first in the assembly, and the constant
build sits after it.

Not every number is reachable this way — 257 and 1025 are not a small value times
a power of two, and those take a different route entirely. That is the next
lesson. Yours is reachable.

## Your task

Write `func_0804a874` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0804a874(s32 a, s32 b) {
    return (b - a) + 1024;
}
```
