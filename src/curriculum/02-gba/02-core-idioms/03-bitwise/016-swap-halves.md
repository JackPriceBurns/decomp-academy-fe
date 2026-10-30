---
id: db1bc539-b106-48bb-9f5c-4ee3995cac8f
slug: gba-bitwise-swap-halves
title: Swapping Halves
difficulty: 4
concepts:
  - shifts
  - bitwise
  - constants
symbol: func_08111750
hints:
  - There are two rotates by different amounts, then one `orr`. Convert each
    rotate count into the pair of shifts that produced it before you write
    anything.
  - The function takes two `u32` arguments and returns a `u32`. Each argument
    is rotated by its own amount, and the two rotated values are or-ed together.
---

# ror, and which way it rotates

If you shift a value's bits out of one end and back in at the other, gcc 2.9
recognises the idiom. Shift right by `k`, shift left by `32 - k`, or the two
results together, and the whole expression becomes a rotate:

```asm
0        mov       r1, #4
2        ror       r0, r1
4        bx        lr
```

That is two instructions for what looks like three operations in the C. The
`mov` is there because Thumb's `ror` can only take its count from a register.
There is no `ror r0, #4` encoding, so a constant rotate always needs a `mov` as
well.

Be careful with the number in that `mov`. `ror` rotates **right**, and gcc
turns every left rotate into a right rotate by subtracting the count from 32. So
a rotate left by 8 appears as `mov rN, #24`. If you read it as a rotate right by
24, your C will produce exactly the same instruction. The two forms are
interchangeable for matching, so write whichever makes sense with the code
around it. A swap of a word's two halves is the one count that reads the same in
either direction.

The pattern is only recognised for a constant count. If the rotate amount is a
variable, gcc does not use `ror` at all:

```asm
0        mov       r3, r0
2        lsl       r0, r1
4        mov       r2, #32
6        sub       r2, r1
8        lsr       r3, r2
10       orr       r0, r3
12       bx        lr
```

That is six instructions doing by hand what a single `ror r0, r1` would do, and
the hardware does support that instruction. gcc 2.9 has no pattern for it. When
you see this shape in a ROM, do not look for a special rotate helper. The
original C was the ordinary pair of shifts joined with an or, with a count that
was not a constant.

## Your task

Write `func_08111750` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08111750(u32 a, u32 b) {
    return ((a >> 16) | (a << 16)) | ((b << 8) | (b >> 24));
}
```
