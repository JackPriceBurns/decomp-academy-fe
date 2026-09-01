---
id: d64b81ca-e6c2-4005-8da4-8565787e7e00
slug: gba-foundations-big-constant
title: When a Constant Will Not Fit
difficulty: 2
concepts:
  - immediates
  - constants
  - shifts
symbol: offsetFar
hints:
  - Read the pair as one value - the `mov` puts a small number in a spare
    register and the `lsl` scales it up before the add.
  - Multiply the moved constant by 2 to the power of the shift amount and you
    have the number your C should add.
---

# Building what you cannot encode

The immediate field is eight bits wide, so `add rD, #imm` tops out at 255. Ask
for more and the compiler cannot put the number in the instruction at all. It
has to build the value in a spare register first, and then add that register.

Here is a function adding 768:

```asm
0        mov       r1, #192
2        lsl       r1, #2
4        add       r0, r1
6        bx        lr
```

Three instructions where the small-constant version needed one. The compiler
picked `r1` as scratch — argument registers it no longer needs are fair game —
moved 192 into it, shifted left by 2 to reach 768, then did the add.

Why 192 and not something else? Because the constant has to be reachable by a
`mov`, which has the same eight-bit ceiling, and 768 is 192 × 4. The compiler
looks for a value under 256 that reaches the target with a single shift, and
768 = 192 << 2 fits. Not every number can be written that way, and the next
lesson is about what happens when one cannot.

To read the pair back, do the arithmetic yourself: take the moved constant,
shift it left by the shift amount, and that is the number the original C wrote.

## Your task

Write `offsetFar`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 offsetFar(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 offsetFar(s32 x) {
    return x + 1000;
}
```
