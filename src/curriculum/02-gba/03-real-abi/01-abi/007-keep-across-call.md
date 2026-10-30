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
  - The value copied into `r4` is the same one that feeds the call's argument.
    So it is used twice, once inside the call's argument expression and once on
    the result.
  - The function takes two `s32` parameters and returns an `s32`. The `sub`
    writes `r0`, so the call's result is the left operand of the subtraction.
---

# The copy that happens before the call

When you call a function with `bl`, the callee is free to destroy `r0` to
`r3`. Anything your function still needs after the call must first be moved to
a callee-saved register, one of `r4` to `r7`. That is why so many non-leaf
functions start with a push followed right away by a `mov r4, rN`. The copy in
`r4` *is* the value being kept across the call.

Matching gets harder *after* the call, because the two operands of the final
arithmetic are in different places. The call's result is in `r0`, and the
saved value is in `r4`. gcc always computes the result in the register that
holds the **left** operand of the C expression. These two functions differ only
in the order of a subtraction:

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

The prologues are the same, the call is the same, and the listings differ by
one instruction. In the first, the saved value is on the left. So the
subtraction is `r4 = r4 - r0`, and gcc needs an extra `mov r0, r4` to move the
answer into the return register. In the second, the call is on the left. Its
result is already in `r0`, so `sub r0, r4` computes the answer where it needs
to be.

Those two bytes depend only on which side of the operator you wrote the call.
When a function like this is one instruction away from matching, try swapping
the operand order in your C first. A temporary variable does not help here. If
you assign the call's result to a local and subtract on the next line, it
compiles to exactly the same instructions. The side of the operator is the only
thing you can change.

Your target also keeps a value across its call, and that value has two uses.
Look at what feeds the call's argument.

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
