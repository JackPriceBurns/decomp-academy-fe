---
id: 47fff241-2410-4a56-b83c-1abbfece1776
slug: gba-numbers-float-add
title: Adding Two Floats
difficulty: 2
concepts:
  - floating-point
  - soft-float
  - calling-convention
symbol: func_082841ec
hints:
  - Two calls to the same helper mean the source uses that operator twice.
    The `mov r4, r2` before the first call moves a value into a register the
    call will not change.
  - "Three `f32` in, an `f32` out. Write the sum in the order the assembly
    performs it, and the third argument ends up in `r4` by itself."
---

# The add is a call

Two floats are passed like any two 32-bit values: in `r0` and `r1`. What
differs is what the registers contain. Each one holds the raw IEEE-754 bit
pattern, with the sign, exponent and mantissa packed into one word. No
instruction in the machine can add two of these.

So the compiler calls a routine that can:

```asm
0        push      {lr}
2        bl        __addsf3-4
6        pop       {r1}
8        bx        r1
```

The call is the whole function. The arguments are already in the right
registers, so there is nothing to set up. `__addsf3` reads `r0` and `r1` and
returns the sum in `r0`, which is also where the function's own return value
goes. The `push {lr}` and the epilogue are there only because `bl` overwrites
the link register.

Look closely at that epilogue. With `-mthumb-interwork`, a return is a `pop`
followed by a `bx`. gcc pops `lr` into the **lowest register that is not
holding a return value**. A one-word return value uses `r0`, so `lr` goes to
`r1`. A `void` function would pop into `r0`. So before you read any of the
body, you already know how much the function returns.

If you change one character of the source, only the symbol changes:

```asm
0        push      {lr}
2        bl        __subsf3-4
6        pop       {r1}
8        bx        r1
```

The registers, the frame and the size are all the same. Only the helper's name
tells you the operator. So translating soft float back to C starts as a lookup:
read the symbol, then write the operator.

Your target makes two calls, and one value has to survive the first call. Work
out where that value goes and why it has to go there.

## Your task

Write `func_082841ec` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082841ec(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
