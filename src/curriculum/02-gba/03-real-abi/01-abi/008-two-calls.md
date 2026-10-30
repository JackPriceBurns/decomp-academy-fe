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
  - Three values are kept in saved registers. Both parameters are kept, because
    each call's argument is built from both of them. Then the first call's
    result is kept while the second call runs.
  - The function takes two `s32` parameters and returns an `s32`. Each call
    takes one arithmetic combination of the two parameters, and the two results
    are added.
---

# Saving values between two calls

With one call, gcc keeps the values that must outlive it in `r4` to `r7`. With
two calls, it needs that *and* a place to keep the first result while the
second call runs, because the second `bl` will overwrite `r0`.

These two needs decide the shape of the code. Everything that must survive is
set up before the first call. The first result is moved out of `r0` into a
saved register straight away. The second call's argument is moved *into* `r0`.
The arithmetic that combines the results happens at the end, once both
operands are available:

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

The two saved registers do two different jobs. `r5` is set before the first
call and not used until after it. It holds the second call's argument, kept
safe across the first call. `r4` is set from `r0` after the first call, so it
holds the first call's result. The push list alone tells you that two values
stay live across a `bl` somewhere. Where each register is written tells you
which values they are.

The end of the function follows the rule from the last lesson: gcc computes the
result in the register of the left operand. The subtraction's left operand is
the first call, so the result is built in `r4`, and an extra `mov r0, r4` moves
it into the return register. When both operands of a binary operator are calls,
the `bl` that comes first is the call written on the left. So the listing keeps
the order of the source.

Your target follows the same pattern, with one more value to keep. The
arithmetic that builds each call's argument happens in two different places:
one before the first call, and one between the two calls.

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
