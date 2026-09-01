---
id: 726f86c6-1feb-4e6b-b3af-f6a32b8ca35b
slug: gba-numbers-float-divide
title: Dividing Floats
difficulty: 3
concepts:
  - floating-point
  - soft-float
  - strength-reduction
symbol: func_0828d0d4
hints:
  - "`__divsf3` divides `r0` by `r1`. Trace which value reaches `r0` just
    before the call — the two `mov`s at 12 and 14 exist to put it there."
  - "Three `f32` in, an `f32` out. The dividend is the first argument; the
    other two are combined first."
---

# A call on top of a call's worth of work

Integer division on this chip already costs a call, because there is no divide
instruction. Float division costs the same call plus everything soft float
already costs: unpack two IEEE numbers, compute a quotient mantissa bit by bit,
renormalise, round, repack. `__divsf3` is the most expensive helper in the
set.

The shape, though, is the plainest one in the chapter:

```asm
0        push      {lr}
2        bl        __divsf3-4
6        pop       {r1}
8        bx        r1
```

Order is the thing to be careful about. `__divsf3` divides `r0` by `r1`, and
unlike an add there is no symmetry to fall back on, so whichever value the
compiler routes into `r0` is the numerator. When the source's operands are
already in the wrong registers you will see explicit `mov`s to swap them, and
those moves are how you recover which way round the original division was
written.

Now a division that is not one:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1048576000
```

That is `x / 4.0f`. The pool word 1048576000 is 0x3E800000, which is 0.25f, and
the helper is `__mulsf3`. Because 4.0 is an exact power of two, its reciprocal
is exact too, so multiplying gives bit-identical results to dividing — and a
multiply is several times cheaper. gcc takes the trade every time the divisor
is a power of two. Divide by 3.0f and the reciprocal is not exact, so
`__divsf3` stays.

The consequence for matching is worth stating plainly: a `__mulsf3` against a
pool word can mean either a multiply or a division, and you cannot always tell
which the author wrote. `x * 0.5f` and `x / 2.0f` compile to the same bytes.

Your target makes two calls with a register shuffle in between. The shuffle is
the interesting part — it tells you where the brackets were.

## Your task

Write `func_0828d0d4` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0828d0d4(f32 total, f32 a, f32 b) {
    return total / (a + b);
}
```
