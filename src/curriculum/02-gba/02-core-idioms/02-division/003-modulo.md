---
id: 286eda34-7e92-4c49-b32c-080ec3e7bcb4
slug: gba-division-modulo
title: Remainder Is a Different Call
difficulty: 2
concepts:
  - division
  - helper-calls
  - calling-convention
symbol: func_08097f2c
hints:
  - Three `mov`s in front of the `bl` and only two registers hold anything worth
    keeping. Follow each value through the shuffle and see where it ends up.
  - Two `s32` parameters in, an `s32` out. The second is divided by the first and
    the remainder is what comes back.
---

# The remainder has its own routine

`%` gets its own helper. Signed operands call `__modsi3`, which takes the same
arguments in the same registers as `__divsi3` — dividend in `r0`, divisor in
`r1` — and returns the remainder in `r0`:

```asm
0        push      {lr}
2        bl        __modsi3-4
6        pop       {r1}
8        bx        r1
```

There is no helper that returns both results at once. libgcc has no divmod entry
point for this target, so a function that wants the quotient *and* the remainder
of the same pair pays for two complete calls. That comes up later in the
chapter, and it is worth knowing now that the assembly gives you no way to share
the work.

The quotient `__modsi3` computes internally never reaches your code. Compare it
with the same value written out by hand as "subtract the truncated quotient
times the divisor":

```asm
0        push      {r4, r5, lr}
2        mov       r4, r0
4        mov       r5, r1
6        bl        __divsi3-4
10       mul       r0, r5
12       sub       r4, r0
14       mov       r0, r4
16       pop       {r4, r5}
18       pop       {r1}
20       bx        r1
```

Ten instructions instead of four. Both operands have to survive the call, which
means real registers pushed on entry and popped on exit, and then the quotient
gets multiplied back up and subtracted. gcc 2.9 does no algebraic rewriting
between the two forms, so the helper name in a target tells you which one the
original author typed. `__modsi3` means somebody wrote `%`.

Your target calls `__modsi3` with a shuffle in front of it. The helper's
registers are fixed, so every `mov` before the `bl` is telling you where an
operand came from — read them in order and remember that each one overwrites its
destination.

## Your task

Write `func_08097f2c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08097f2c(s32 a, s32 b) {
    return b % a;
}
```
