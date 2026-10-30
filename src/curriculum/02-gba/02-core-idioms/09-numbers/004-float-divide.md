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
    before the call. The two `mov`s at 12 and 14 are there to put it in place."
  - "Three `f32` in, an `f32` out. The dividend is the first argument. The
    other two are combined first."
---

# Division costs the most

On this chip, even integer division costs a call, because there is no divide
instruction. Float division costs that call plus all the usual soft float
work. The helper unpacks two IEEE numbers, computes the quotient's mantissa one
bit at a time, normalises it, rounds it and packs the result again.
`__divsf3` is the most expensive helper in the set.

Its shape, however, is the simplest in the chapter:

```asm
0        push      {lr}
2        bl        __divsf3-4
6        pop       {r1}
8        bx        r1
```

Be careful with the order. `__divsf3` divides `r0` by `r1`. Division is not
symmetric like addition, so whatever value the compiler puts in `r0` is the
numerator. If the source's operands start in the wrong registers, you will see
explicit `mov`s that swap them. Those moves tell you which way round the
original division was written.

Now look at a division that compiles to a multiply:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1048576000
```

This is `x / 4.0f`. The pool word 1048576000 is 0x3E800000, which is 0.25f,
and the helper is `__mulsf3`. Because 4.0 is an exact power of two, its
reciprocal is exact too. So multiplying by the reciprocal gives exactly the
same bits as dividing, and a multiply is several times cheaper. gcc makes this
swap whenever the divisor is a power of two. If you divide by 3.0f, the
reciprocal is not exact, so `__divsf3` stays.

This matters for matching. A `__mulsf3` with a pool word can come from either
a multiply or a division, and you cannot always tell which one the author
wrote. `x * 0.5f` and `x / 2.0f` compile to the same bytes.

Your target makes two calls, with some register moves between them. Pay most
attention to those moves, because they tell you where the brackets were.

## Your task

Write `func_0828d0d4` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0828d0d4(f32 total, f32 a, f32 b) {
    return total / (a + b);
}
```
