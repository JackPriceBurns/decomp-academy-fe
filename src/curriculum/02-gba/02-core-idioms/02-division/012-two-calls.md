---
id: c410b83f-ad97-43b3-9327-36915a70d17c
slug: gba-division-two-calls
title: Two Divides in One Function
difficulty: 4
concepts:
  - division
  - calling-convention
  - register-allocation
symbol: func_080c1234
hints:
  - Two registers besides `lr` are pushed. One holds a value that the second
    call needs. The other holds the first call's result while the second call
    runs.
  - Two `s32` parameters in, an `s32` out. Each is divided by its own small
    constant and the two quotients are added.
---

# Two calls and the values between them

A second division gives the frame more work. Every value the first call would
destroy must be saved before it. Then the first call's *result* is one more
value that must survive the second call.

How much that costs depends on how the two divisions are related. When the
second division uses the result of the first, nothing needs to be saved:

```asm
0        push      {lr}
2        mov       r1, #60
4        bl        __udivsi3-4
8        mov       r1, #60
10       bl        __umodsi3-4
14       pop       {r1}
16       bx        r1
```

This turns a frame count into the seconds part of a clock: it divides by 60,
then takes the result modulo 60. The quotient comes back in `r0`, which is
exactly where the next helper wants its dividend. So the only setup between the
calls is loading the divisor again, because the first call overwrote it. There
are two library calls and still no callee-saved register.

Add a value that has to survive a call, and the frame appears:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __divsi3-4
8        mov       r1, r4
10       bl        __divsi3-4
14       pop       {r4}
16       pop       {r1}
18       bx        r1
```

These two divisions are chained in the same way. This time the second divisor
is a parameter, so it has to be kept in `r4` during the first call and moved
into `r1` afterwards. One value kept across a call needs one saved register.

This rule holds in general, and you can read it from the push list. A function
that pushes only `{lr}` keeps nothing across its calls. `{r4, lr}` keeps one
value, `{r4, r5, lr}` keeps two, and so on. Count the saved registers before
you read anything else. The count tells you how many values must wait across
the calls. The order in which they are loaded and used tells you what they are.

Also watch for an accumulator, a register where the answer is built up. When
two independent quotients are combined, the first one cannot stay in `r0` while
the second call runs. So it goes into a callee-saved register, and the answer is
built there. Then the final `mov r0, rN` from the last lesson moves it back into
`r0`.

Your target saves two registers besides `lr`. Work out what each one holds and
when each one is read back.

## Your task

Write `func_080c1234` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080c1234(s32 x, s32 y) {
    return x / 3 + y / 7;
}
```
