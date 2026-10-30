---
id: 5daff61e-a924-4d40-a667-663c9d6e0909
slug: gba-numbers-int-to-float
title: Converting an Integer to a Float
difficulty: 3
concepts:
  - floating-point
  - conversions
  - soft-float
symbol: func_08291848
hints:
  - "`__floatsisf` turns the signed integer in `r0` into a float. It runs
    before the multiply, so the value it converts was an integer in the
    source."
  - "An `s32` first, an `f32` second, an `f32` out. The integer is converted
    and then scaled."
---

# Where the conversion happens

Integers and floats store their bits in different layouts, so converting
between them takes real work. The code has to find the highest set bit, shift
the value up so it starts with an implicit 1, compute the exponent, and round
off the bits that do not fit. That is another job for a helper.

You read the name `__floatsisf` the same way as the arithmetic ones: **float**
from **s**igned **i**nt to **s**ingle **f**loat, with one operand and a result.
`__floatsidf` does the same conversion but produces a double.

With a conversion, the position of the call tells you what the source meant.
Two expressions that differ only in where a cast is placed produce completely
different listings. Here the cast applies to the whole division:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        bl        __floatsisf-4
10       pop       {r1}
12       bx        r1
```

The integer divide runs first, and the conversion runs after it. There are two
calls and no frame apart from saving the link register. The remainder is lost
before the float is created.

If you move the casts inside, onto each operand, you get this instead:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r1
4        bl        __floatsisf-4
8        mov       r5, r0
10       mov       r0, r4
12       bl        __floatsisf-4
16       mov       r1, r0
18       mov       r0, r5
20       bl        __divsf3-4
24       pop       {r4, r5}
26       pop       {r1}
28       bx        r1
```

This version makes three calls, uses two callee-saved registers, and gives a
different answer, because it keeps the fraction. Comparing the two listings
gives you a rule: **count the conversions and note where they are relative to
the arithmetic.** Conversions that run first mean the casts were on the
operands, and the arithmetic after them is float arithmetic. A conversion that
runs after an integer helper means the cast was applied to the whole
expression.

Remember one gap in the helper set: this libgcc has no `__floatunsisf`. For an
unsigned value, gcc emits a sign test, a step that halves the value, and a
call to `__floatsisf`. Together these do not look like a conversion.

Your target converts once and then calls one arithmetic helper. One value has
to wait in `r4` while the conversion runs. Work out which value that is.

## Your task

Write `func_08291848` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_08291848(s32 n, f32 scale) {
    return (f32)n * scale;
}
```
