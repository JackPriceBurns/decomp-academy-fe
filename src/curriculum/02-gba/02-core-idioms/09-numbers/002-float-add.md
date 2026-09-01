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
  - Two calls to the same helper means the source names that operator twice.
    The `mov r4, r2` before the first call is a value being parked somewhere a
    call cannot reach it.
  - "Three `f32` in, an `f32` out. Write the sum in the order the assembly
    performs it and the third argument lands in `r4` on its own."
---

# The add that is a call

Two floats arrive the way any two 32-bit values arrive: in `r0` and `r1`. The
difference is what they contain. Each register holds the raw IEEE-754 bit
pattern — sign, exponent, mantissa, packed into a word — and no instruction in
the machine can add them.

So the compiler calls someone who can:

```asm
0        push      {lr}
2        bl        __addsf3-4
6        pop       {r1}
8        bx        r1
```

The whole function is the call. Arguments are already in the right registers,
so there is nothing to set up; `__addsf3` reads `r0` and `r1`, returns the sum
in `r0`, and that is also where the return value belongs. The `push {lr}` and
the epilogue exist purely because `bl` overwrites the link register.

Look at that epilogue closely. With `-mthumb-interwork` a return is `pop` then
`bx`, and gcc pops `lr` into the **lowest register that is not carrying a
return value**. A one-word return leaves `r0` occupied, so `lr` goes to `r1`.
A `void` function would pop into `r0`. Before reading a single line of the
body you already know how much the function gives back.

Change one character of the source and only the symbol changes:

```asm
0        push      {lr}
2        bl        __subsf3-4
6        pop       {r1}
8        bx        r1
```

Same registers, same frame, same size. The operator lives entirely in the
helper's name, so translating soft float back to C starts as a lookup: read the
symbol, write the operator.

Your target makes two calls, and something has to survive the first one. Work
out where it goes and why it has to go there.

## Your task

Write `func_082841ec` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082841ec(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
