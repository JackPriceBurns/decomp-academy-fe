---
id: 9aa707c6-2626-43bc-8559-62f0bbf14571
slug: gba-division-capstone
title: "Capstone: Quotient and Remainder"
difficulty: 5
concepts:
  - division
  - calling-convention
  - signedness
symbol: func_080ca11c
hints:
  - The same value is divided twice, once through the helper and once inline.
    The inline part is a remainder, and its shift amounts give the divisor.
  - Two `s32` parameters in, an `s32` out. It returns the quotient of the two,
    plus the first one's remainder modulo 4.
---

# Quotient and remainder together

Game code often splits a value into a quotient and a remainder: frames into
seconds and ticks, an index into a row and a column, or a total into whole units
and change. There is no divmod helper on this target, so the two parts are
compiled separately. What that looks like depends on each divisor.

Here is an unsigned value taken modulo a second argument, with an eighth of the
same value added on:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        bl        __umodsi3-4
8        lsr       r4, #3
10       add       r0, r4
12       pop       {r4}
14       pop       {r1}
16       bx        r1
```

That is eight instructions, and you have seen every one of them in this
chapter. The first argument is saved in `r4` because the call will destroy
`r0`. The remainder comes back in `r0`. The saved copy is then divided by 8 with
a single `lsr`, the unsigned divide by a power of two. The add puts its result
straight into `r0`. No final move is needed, because the call's result was
written first.

The saved value does two jobs. It was saved to survive the call, and the second
division then uses that same copy without loading anything again. One `mov`
covers both jobs.

Make the same function signed and the code changes a lot. A signed divide by a
power of two is the bias sequence. A signed remainder is that sequence plus the
shift back and the subtract. In both cases the inline part is no longer one
instruction, and it needs a scratch register of its own. gcc prefers `r0`, but
the helper's return value is in it. So gcc first moves that value into another
low register. A low register is safe here, because no further call will destroy
it. When a `mov r1, r0` follows a `bl` and no second call comes after it, read
it as `r0` being freed for the arithmetic that follows.

Your target is the signed version. Work through it in three passes. First read
the push list and the saved register. Then read the call and what it returns.
Then read the inline block. Check the order of the two parts before you finish,
because writing them the other way round moves the call.

## Your task

Write `func_080ca11c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080ca11c(s32 a, s32 b) {
    return a / b + a % 4;
}
```
