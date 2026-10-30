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
  - There are three `mov`s in front of the `bl`, but only two registers hold
    values that matter. Follow each value through the moves and see where it
    ends up.
  - Two `s32` parameters in, an `s32` out. The second is divided by the first and
    the remainder is returned.
---

# The remainder has its own routine

The `%` operator has its own helper. For signed operands gcc calls `__modsi3`.
It takes its arguments in the same registers as `__divsi3` (the dividend in
`r0`, the divisor in `r1`) and returns the remainder in `r0`:

```asm
0        push      {lr}
2        bl        __modsi3-4
6        pop       {r1}
8        bx        r1
```

No helper returns both results at once. libgcc has no divmod routine for this
target, so a function that needs the quotient *and* the remainder of the same
two values makes two complete calls. This comes up later in the chapter. For
now, know that the assembly has no way to share the work between them.

`__modsi3` computes a quotient internally, but that quotient never reaches your
code. Compare the call above with the same value written out by hand as
"subtract the truncated quotient times the divisor":

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

That is ten instructions instead of four. Both operands have to survive the
call, so they are kept in registers that are pushed on entry and popped on exit.
Then the quotient is multiplied by the divisor and subtracted. gcc 2.9 never
rewrites one of these forms into the other, so the helper name in a target tells
you which one the original author typed. `__modsi3` means somebody wrote `%`.

Your target calls `__modsi3` after moving some registers around. The helper's
registers are fixed, so every `mov` before the `bl` tells you where an operand
came from. Read them in order, and remember that each one overwrites its
destination register.

## Your task

Write `func_08097f2c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08097f2c(s32 a, s32 b) {
    return b % a;
}
```
