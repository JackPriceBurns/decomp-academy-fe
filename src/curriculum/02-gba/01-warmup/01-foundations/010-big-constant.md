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
  - Read the pair as one value. The `mov` puts a small number in a spare
    register, and the `lsl` scales it up before the add.
  - Multiply the moved constant by 2 to the power of the shift amount. The
    result is the number your C should add.
---

# Building a constant that does not fit

The immediate field is eight bits wide, so `add rD, #imm` can add at most 255.
For a larger number, the compiler cannot put the number in the instruction at
all. It has to build the value in a spare register first, and then add that
register.

Here is a function that adds 768:

```asm
0        mov       r1, #192
2        lsl       r1, #2
4        add       r0, r1
6        bx        lr
```

That is three instructions, where the small-constant version needed one. The
compiler chose `r1` as a scratch register. It can use any argument register
that it no longer needs. It moved 192 into `r1`, shifted it left by 2 to get
768, and then did the add.

The compiler used 192 because the constant has to be loaded by a `mov`, which
has the same eight-bit limit, and 768 is 192 × 4. The compiler looks for a value
under 256 that reaches the target with a single shift, and 768 = 192 << 2
works. Not every number can be built this way. The next lesson covers what
happens when a number cannot.

To read the pair back, do the arithmetic yourself. Take the moved constant and
shift it left by the shift amount. The result is the number in the original C.

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
