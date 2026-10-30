---
id: 1aeed39b-f4fe-4f66-ac40-a181a90b5efb
slug: gba-division-around-a-call
title: Arithmetic Around the Call
difficulty: 4
concepts:
  - division
  - calling-convention
  - register-allocation
symbol: func_080bc7c0
hints:
  - The value copied into `r4` before the call is also about to be used by the
    helper. Check which register the copy reads from.
  - Two `s32` parameters in, an `s32` out. It returns their quotient plus the
    first argument.
---

# Which registers survive a call

`r0` to `r3` belong to the callee. A helper may overwrite all four, and the
division helpers do. So when a division is part of a larger expression, every
other value the function still needs must be kept somewhere safe. Safe means
`r4` and above, the callee-saved registers. The ABI says a callee must restore
them before it returns.

Those registers may hold values for your function's own caller, so using one
means pushing it on entry and popping it on exit. One extra value that must stay
live turns `push {lr}` into `push {r4, lr}` and adds two instructions to the
epilogue. Here is a remainder with a third argument subtracted from it:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __modsi3-4
8        sub       r0, r4
10       pop       {r4}
12       pop       {r1}
14       bx        r1
```

`r2` would not survive the call, so it is copied to `r4` first and read back
afterwards. That is the whole pattern: save, call, use. When `mov r4, rN` is
the first instruction after a push, an argument is being saved so that it is
still there after a call that comes later.

Now here is the same subtraction the other way round, the third argument minus
the remainder:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __modsi3-4
8        sub       r4, r0
10       mov       r0, r4
12       pop       {r4}
14       pop       {r1}
16       bx        r1
```

This is one instruction longer, and the extra instruction is a `mov r0, r4` at
the end. Thumb's `sub` overwrites its first operand. So a subtraction with the
saved value on the left writes its result into `r4`, and the answer then has to
be moved back to `r0` to be returned. In the first version, the result goes
straight into `r0`, where it is needed, so no move is required.

That final `mov r0, rN` is worth remembering. It shows that the expression was
written with the saved value first and the call's result second. That order is
kept all the way from the source through register allocation. `+` behaves the
same way, and using a named temporary changes nothing. When your diff shows one
extra `mov` at the end, the fix is usually to swap the two operands in your C.

Your target also saves a value before its call, and the division itself uses
that value too. Work out which register the copy reads from. Then use the form
of the instruction after the `bl` to find the operand order.

## Your task

Write `func_080bc7c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080bc7c0(s32 a, s32 b) {
    return a / b + a;
}
```
