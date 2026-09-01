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
  - Two rotates by different amounts, then one `orr`. Convert each rotate count
    into the pair of shifts that produced it before you write anything.
  - Two `u32` arguments and a `u32` result. Each argument is rotated by its own
    amount and the two rotated values are or-ed together.
---

# ror, and the direction it hides

Write a value's bits out one end and back in the other and gcc 2.9 recognises
the idiom. Shift right by `k`, shift left by `32 - k`, or the two together, and
the whole thing becomes a rotate:

```asm
0        mov       r1, #4
2        ror       r0, r1
4        bx        lr
```

Two instructions for what looks like three operations in the C, and the `mov` is
there because Thumb's `ror` takes its count from a register only. There is no
`ror r0, #4` encoding, so a constant rotate always drags a `mov` along with it.

The number in that `mov` needs care. `ror` rotates **right**, and gcc normalises
every left rotate into a right one by subtracting from 32. A rotate left by 8
therefore appears as `mov rN, #24`, and reading it as a rotate right by 24 will
give you C that produces the identical instruction — so the two spellings are
interchangeable for matching, and you should write whichever makes sense of the
code around it. A swap of a word's two halves is the one count that reads the
same in either direction.

The pattern fires only for a constant count. Make the rotate amount a variable
and gcc gives up completely:

```asm
0        mov       r3, r0
2        lsl       r0, r1
4        mov       r2, #32
6        sub       r2, r1
8        lsr       r3, r2
10       orr       r0, r3
12       bx        lr
```

Six instructions doing by hand what a single `ror r0, r1` would have done, and
the hardware can encode that instruction perfectly well. gcc 2.9 simply has no
pattern for it. When you meet this shape in a ROM, do not go looking for a
clever rotate helper — the original C was the ordinary shift-shift-or, with a
count that was not a constant.

## Your task

Write `func_08111750` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08111750(u32 a, u32 b) {
    return ((a >> 16) | (a << 16)) | ((b << 8) | (b >> 24));
}
```
