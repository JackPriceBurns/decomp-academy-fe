---
id: c7ffe69e-c201-49b0-9b39-2d758722eba4
slug: gba-abi-keep-across-call
title: Keeping a Value Across a Call
difficulty: 4
concepts:
  - abi
  - callee-saved
  - calls
symbol: func_082f83b4
hints:
  - The value copied into `r4` is the same one that feeds the call's argument, so
    it is used twice — once inside the call's argument expression and once on the
    result.
  - Two `s32` parameters in, an `s32` out. The `sub` writes `r0`, so the call's
    result is the left operand of the subtraction.
---

# The copy that happens before the call

A `bl` is a licence for the callee to destroy `r0`-`r3`. Anything your function
still needs afterwards has to be moved somewhere protected first, and the
protected registers are `r4`-`r7`. That is why so many non-leaf functions open
with a push followed immediately by a `mov r4, rN`: the copy *is* the value
being carried across the call.

What happens *after* the call is where matching gets fussy, because the two
operands of the final arithmetic are in different places: the call's result is
in `r0`, and the survivor is in `r4`. gcc always accumulates into the **left**
operand of the C expression. These two functions differ only in the order of a
subtraction:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        mul       r0, r1
6        bl        decay-4
10       sub       r4, r0
12       mov       r0, r4
14       pop       {r4}
16       pop       {r1}
18       bx        r1
```

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        mul       r0, r1
6        bl        decay-4
10       sub       r0, r4
12       pop       {r4}
14       pop       {r1}
16       bx        r1
```

Identical prologues, identical call, and one instruction of difference. In the
first, the survivor is on the left, so the subtraction runs `r4 = r4 - r0` and
gcc has to spend a `mov r0, r4` moving the answer into the return register. In
the second the call is on the left, its result is already in `r0`, and
`sub r0, r4` finishes the job in place.

Two bytes, entirely decided by which side of the operator you wrote the call on.
When you are one instruction away from a match on a function like this, the
operand order in your C is the first thing to try. A temporary changes nothing
here: assigning the call's result to a local and subtracting on the next line
compiles to exactly these instructions, so the side of the operator is the only
lever you have.

Your target carries a value across its call as well, but that value is doing two
jobs — look at what feeds the call's argument.

## Your task

`extern s32 step(s32 v);` is declared for you. Write `func_082f83b4` to
reproduce the target assembly.

<!-- context -->
```c
extern s32 step(s32 v);
```

<!-- solution -->
```c
s32 func_082f83b4(s32 a, s32 b) {
    return step(a + b) - a;
}
```
