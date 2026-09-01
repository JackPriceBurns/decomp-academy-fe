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
  - The same value is divided twice — once through the helper, once inline. The
    inline half is a remainder, and its shift amounts name the divisor.
  - Two `s32` parameters in, an `s32` out. The quotient of the two, plus the
    first one's remainder modulo 4.
---

# Both halves of a division at once

Splitting a value into a quotient and a remainder is everywhere in game code:
frames into seconds and ticks, an index into a row and a column, a total into
whole units and change. There is no divmod helper on this target, so the two
halves are compiled independently, and what that looks like depends on what each
divisor is.

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

Eight instructions, and every one of them is something from this chapter. The
first argument is parked in `r4` because the call will destroy `r0`. The
remainder comes back in `r0`. The parked copy is then divided by 8 with a single
`lsr` — the free divide — and the add finishes in `r0`, no trailing move
needed, because the call's result was written first.

Notice how cheaply the parked value pays for itself. It was saved for the call,
and the second division then uses that same saved copy rather than reloading
anything. One `mov` covers both jobs.

Make the same shape signed and the balance shifts hard. A signed divide by a
power of two is the bias sequence; a signed remainder is that sequence plus the
shift back and the subtract. Either way the inline half stops being one
instruction and starts needing a scratch register of its own. `r0` is the
obvious choice, and the helper's return value is sitting in it, so gcc moves
that value into another low register first — a low one is safe, because no
further call is coming to destroy it. When a `mov r1, r0` follows a `bl` and no
second call is on the way, read it as `r0` being cleared for the arithmetic that
follows.

Your target is the signed version. Work through it in three passes: the push
list and the parked register, the call and what it returns, then the inline
block. Check the order of the two halves before you commit, because writing them
the other way round moves the call.

## Your task

Write `func_080ca11c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080ca11c(s32 a, s32 b) {
    return a / b + a % 4;
}
```
