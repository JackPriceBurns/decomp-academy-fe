---
id: 37bdfde0-e061-419a-9c3a-d6f92c9a30fb
slug: gba-abi-two-calls
title: Two Calls in a Row
difficulty: 4
concepts:
  - abi
  - callee-saved
  - calls
symbol: func_082fcb28
hints:
  - Three values are protected — both parameters, because each call's argument is
    built from both of them, and then the first call's result while the second
    call runs.
  - Two `s32` parameters in, an `s32` out. Each call takes one arithmetic
    combination of the two parameters, and the two results are added.
---

# Bookkeeping between two calls

One call needs the values that outlive it in `r4`-`r7`. Two calls need that
*and* somewhere to keep the first result while the second call runs, because the
second `bl` will happily overwrite `r0`.

The shape falls out of those two pressures. Everything that must survive is set
up before the first call, the first result is immediately moved out of `r0` into
a saved register, the second call's argument is moved *into* `r0`, and the
combining arithmetic happens at the end when both operands are finally in hand:

```asm
0        push      {r4, r5, lr}
2        mov       r5, r1
4        bl        lookupCost-4
8        mov       r4, r0
10       mov       r0, r5
12       bl        upkeep-4
16       sub       r4, r0
18       mov       r0, r4
20       pop       {r4, r5}
22       pop       {r1}
24       bx        r1
```

Two saved registers doing two different jobs. `r5` is loaded before the first
call and not used until after it — that is the second call's argument being kept
out of harm's way. `r4` is loaded after the first call from `r0` — that is the
first call's result. Reading the push list alone tells you two things live
across a `bl` somewhere; reading where each one is written tells you which.

The tail is the accumulator rule from the last lesson, still in force: the
subtraction's left operand is the first call, so it accumulates into `r4` and
pays a `mov r0, r4` to get home. And when both operands of a binary operator
are calls, the `bl` that appears first is the one written on the left, so the
listing preserves the source order.

Your target does the same dance with one extra value in flight, and the
arithmetic that builds each call's argument happens in two different places —
one before the first call, one between the two.

## Your task

`extern s32 charge(s32 v);` and `extern s32 drain(s32 v);` are declared for you.
Write `func_082fcb28` to reproduce the target assembly.

<!-- context -->
```c
extern s32 charge(s32 v);
extern s32 drain(s32 v);
```

<!-- solution -->
```c
s32 func_082fcb28(s32 a, s32 b) {
    return charge(a + b) + drain(a - b);
}
```
