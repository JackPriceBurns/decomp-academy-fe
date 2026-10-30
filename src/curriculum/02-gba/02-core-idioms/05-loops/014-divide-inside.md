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
  - "`__divsi3` takes the numerator in r0 and the denominator in r1, and returns
    the quotient in r0. The value copied into r1 right before each call is what
    you are dividing by."
  - That divisor stays in a callee-saved register for the whole loop, because the
    call would destroy it. This means it arrived as an argument.
  - An `s32 *`, an `s32` count and an `s32` divisor in; `s32` out. It returns the
    sum of the quotients.
symbol: func_081a94b8
---

# A helper call in the body

The ARM7TDMI has no divide instruction. So the cost of a division depends on
whether the compiler knows the divisor when it compiles the code.

Division by a constant power of two stays inline. It becomes a shift, plus a
bias that makes the result round toward zero, as C requires for negative
numerators:

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

That is `t += a[i] / 8`. The branch at 12 does not come from an `if` in the
source. It adds the bias, and only when the value is negative. The shift amount
is the log of the divisor. This gives a reading rule. When a `cmp rX, #0 / bge`
jumps over an `add` of a power of two minus one and lands on an `asr`, you are
looking at a signed division. The source has no conditional there.

This still has a cost. The branch moves the pointer advance below the merge
point, exactly as a real `if` would. So this loop loads with `ldr` and advances
separately, instead of using the load-multiple.

A divisor that the compiler does not know costs much more. The division becomes
`bl __divsi3`, with the numerator in r0 and the denominator in r1, and the loop
becomes a loop that makes a call. Everything carried across the call moves to
r4-r7. That means the cursor, the countdown, the accumulator, *and* the divisor.
The divisor has to move too, because it is passed in r1 and the call destroys
r1.

Your target is the second case. Count the pushed registers and decide what each
one holds. Then read the two instructions just before the `bl`.

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
