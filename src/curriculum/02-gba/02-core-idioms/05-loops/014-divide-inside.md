---
id: 1823086a-1c16-49a2-9383-b7e1381d2275
slug: gba-loops-divide-inside
title: A Divide Per Trip
difficulty: 4
concepts:
  - loops
  - division
  - calling-convention
hints:
  - "`__divsi3` takes the numerator in r0 and the denominator in r1 and returns
    the quotient in r0. The value copied into r1 right before each call is what
    you are dividing by."
  - That divisor sits in a callee-saved register for the whole loop because the
    call would destroy it, which means it arrived as an argument.
  - An `s32 *`, an `s32` count and an `s32` divisor in; `s32` out - the sum of
    the quotients.
symbol: func_081a94b8
---

# The helper call hiding in the body

The ARM7TDMI has no divide instruction, so what a division costs you depends
entirely on whether the compiler can see the divisor.

A constant power of two stays inline. It becomes a shift, plus a bias to make
the rounding go toward zero the way C requires for negative numerators:

```asm
0        mov       r3, #0
2        cmp       r3, r1
4        bge       28 ~>
6        mov       r2, r0
8      ~>ldr       r0, [r2, #0]
10       cmp       r0, #0
12       bge       16 ~>
14       add       r0, #7
16     ~>asr       r0, #3
18       add       r3, r0
20       add       r2, #4
22       sub       r1, #1
24       cmp       r1, #0
26       bne       8 ~>
28     ~>mov       r0, r3
30       bx        lr
```

That is `t += a[i] / 8`. The branch at 12 is not an `if` in the source — it is
the bias, added only when the value is negative — and the shift amount is the
log of the divisor. Worth remembering as a reading rule: a `cmp rX, #0 / bge`
straddling an `add` of one-less-than-a-power-of-two and an `asr` is a signed
division, not a conditional.

It still costs, though. The branch sinks the pointer advance below the merge
point, exactly as a real `if` would, so this loop loads with `ldr` and advances
separately instead of using the load-multiple.

A divisor the compiler cannot see costs far more. It becomes `bl __divsi3`, with
the numerator in r0 and the denominator in r1, and the whole loop turns into a
calling loop. Everything carried across the call moves to r4-r7 — the cursor,
the countdown, the accumulator, *and* the divisor, which would otherwise be
destroyed by being passed in r1.

Your target is that second case. Count the pushed registers, decide what each
one holds, and then read the two instructions right before the `bl`.

## Your task

Write `func_081a94b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081a94b8(s32 *a, s32 n, s32 d) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += a[i] / d;
    return t;
}
```
