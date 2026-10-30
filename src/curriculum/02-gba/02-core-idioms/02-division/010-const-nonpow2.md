---
id: 5bc5c248-2a3c-4965-b803-d2950f8dab13
slug: gba-division-const-nonpow2
title: A Constant Divisor Is Still a Call
difficulty: 3
concepts:
  - division
  - helper-calls
  - constants
symbol: func_080b8054
hints:
  - The two instructions in front of the call build one number together.
    Multiply it out before you read any further.
  - One `s32` parameter in, an `s32` out. The parameter is divided by the
    constant those two instructions build.
---

# The constant still goes to the helper

Modern compilers turn `x / 3` into a multiply by a precomputed reciprocal,
followed by a shift. gcc 2.9 does not do this when it targets Thumb. Every
constant divisor that is not a power of two is loaded into `r1` and passed to
the same helper that a variable divisor would use:

```asm
0        push      {lr}
2        mov       r1, #60
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
```

That is a division by 60, and it costs a full call. This has two consequences.
First, any `bl __divsi3` in a listing might have a constant divisor, so check
`r1` before you assume the divisor is a parameter. Second, this cost is why real
GBA games avoid dividing by a constant inside loops that run often.

The divisor's *value* is what you have to recover. The compiler builds it in one
of the three ways from the arithmetic chapter. A value up to 255 is a single `mov
r1, #k`, as above. A value that is a small number shifted left becomes a `mov`
and an `lsl`. The number in that `mov` is not the divisor, so you must multiply
the pair out before it means anything. Any other value comes from the literal
pool:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
12       .word     257
```

257 needs nine significant bits, so it cannot be built in one or two
instructions. It is stored after the code as data instead. The `(->12)` points
at the row that holds it.

As in the arithmetic chapter, read the `(->12)` and ignore the `#8`. The
immediate is measured from the PC. The PC is four bytes ahead of the
instruction, and it is rounded down to a multiple of four before the offset is
added. So the immediate never matches the distance you can count in the listing.
The arrow has already done that calculation for you.

Your target builds its divisor in the second of those three ways.

## Your task

Write `func_080b8054` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080b8054(s32 x) {
    return x / 1000;
}
```
