---
id: 89496350-cb3b-4b47-a934-63a7659d1174
slug: gba-numbers-float-chain
title: A Chain of Calls
difficulty: 4
concepts:
  - floating-point
  - soft-float
  - register-allocation
symbol: func_082a7d8c
hints:
  - Count the calls, then read the registers each one is handed. `r5` and `r6`
    are parked before the first call precisely because the second call needs
    them afterwards.
  - "Four `f32` in, an `f32` out. Two calls to the same helper feed the third,
    and `r4` carries the first result across the second call."
---

# Everything must survive the call

One float operation is a call. Two float operations are two calls, and now the
result of the first has to be alive while the second one runs. The soft-float
helpers follow the ordinary calling convention, so `r0`-`r3` are theirs to
destroy — anything that must last has to be in `r4` and up, and those have to
be pushed first.

That is the whole reason a three-term float expression costs a frame:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __mulsf3-4
8        mov       r1, r4
10       bl        __addsf3-4
14       pop       {r4}
16       pop       {r1}
18       bx        r1
```

The third argument is stashed in `r4` before anything happens, the multiply
runs on `r0` and `r1`, and the product it returns in `r0` is already sitting
where the add wants its first operand. One `mov` back out of `r4` and the
second call is ready.

Now write the same arithmetic with the terms the other way round:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __mulsf3-4
8        mov       r1, r0
10       mov       r0, r4
12       bl        __addsf3-4
16       pop       {r4}
18       pop       {r1}
20       bx        r1
```

Two extra bytes. gcc still evaluates the product first — it has to, the add
depends on it — but now the product belongs in the *second* operand position,
so it moves to `r1` and the saved value has to come back into `r0`. Nothing is
commuted and nothing is reassociated; floating-point addition is not
associative in IEEE-754 and gcc will not pretend otherwise.

That makes the shuffling between calls genuinely informative. Two `mov`s where
one would do means the operands were written in the order that costs more, and
reproducing it means writing them that way too.

Your target pushes three callee-saved registers and makes three calls. Work
out which values each call is handed, and the bracketing falls out.

## Your task

Write `func_082a7d8c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082a7d8c(f32 a, f32 b, f32 c, f32 d) {
    return (a - b) * (c - d);
}
```
