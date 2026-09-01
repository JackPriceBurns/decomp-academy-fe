---
id: 5daff61e-a924-4d40-a667-663c9d6e0909
slug: gba-numbers-int-to-float
title: Converting In
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

# Where the conversion sits

Integers and floats are different bit layouts, so moving between them is real
work: find the top set bit, shift the value up so it starts with an implicit 1,
compute the exponent, round off what does not fit. Another helper.

`__floatsisf` reads that name the same way as the arithmetic ones: **float**
from **s**igned **i**nt to **s**ingle **f**loat, one operand and a result.
`__floatsidf` is the double-producing twin.

With a conversion, the position of the call carries the meaning. Two
expressions that differ only in where a cast sits produce completely different
listings. Here the cast wraps the whole division:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        bl        __floatsisf-4
10       pop       {r1}
12       bx        r1
```

Integer divide first, conversion afterwards. Two calls, no frame beyond the
link register, and the remainder is gone before the float ever exists.

Move the casts inside, onto each operand, and you get this instead:

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

Three calls, two callee-saved registers and a completely different answer —
this one keeps the fraction. The reading rule falls out of the comparison:
**count the conversions and note where they sit relative to the arithmetic.**
Conversions that run first mean the casts were on the operands, and the
arithmetic that follows them is float arithmetic. A conversion that runs after
an integer helper means the cast was applied to the whole expression.

One gap in the helper set to file away: there is no `__floatunsisf` in this
libgcc. An unsigned value gets a sign test, a halving trick and a call to
`__floatsisf`, which together look nothing like a conversion.

Your target converts once and then calls one arithmetic helper. Something has
to wait in `r4` while the conversion runs; work out what.

## Your task

Write `func_08291848` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_08291848(s32 n, f32 scale) {
    return (f32)n * scale;
}
```
