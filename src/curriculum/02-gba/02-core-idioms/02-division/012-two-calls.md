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
  - Two registers besides `lr` are pushed. One holds a value waiting for the
    second call, the other holds the first call's result while that second call
    runs.
  - Two `s32` parameters in, an `s32` out. Each is divided by its own small
    constant and the two quotients are added.
---

# Two calls, and the traffic between them

A second division doubles the call frame's job. Everything the first call would
destroy has to be parked before it, and then the first call's *result* becomes
another value that has to survive the second one.

How much that costs depends entirely on how the two divisions relate. When the
second consumes the first, nothing needs saving at all:

```asm
0        push      {lr}
2        mov       r1, #60
4        bl        __udivsi3-4
8        mov       r1, #60
10       bl        __umodsi3-4
14       pop       {r1}
16       bx        r1
```

That is a frame count turned into the seconds part of a clock — divide by 60,
then take the result modulo 60. The quotient comes back in `r0`, which is
exactly where the next helper wants its dividend, so the only setup between the
calls is reloading the divisor that the first call clobbered. Two library calls
and still no callee-saved register in sight.

Add a value that has to cross a call and the frame appears:

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

Two divisions chained the same way, except the second divisor is a parameter
rather than a constant, so it has to be carried across the first call in `r4`
and moved into `r1` afterwards. One live value, one saved register.

The pattern generalises cleanly, and the push list is where you read it off. A
function pushing `{lr}` alone kept nothing across its calls. `{r4, lr}` kept one
thing, `{r4, r5, lr}` kept two, and so on up. Counting the saved registers
before you read anything else tells you how much of the expression is waiting on
the calls, and the order they are loaded and used tells you what.

Watch for the accumulator, too. When two independent quotients have to be
combined, the first one is homeless while the second call runs — it goes to a
callee-saved register, the answer is built there, and the trailing `mov r0, rN`
from the last lesson brings it home.

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
