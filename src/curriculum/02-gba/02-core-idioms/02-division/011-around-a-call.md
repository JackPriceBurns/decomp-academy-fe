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
  - The value copied into `r4` before the call is one the helper is about to
    consume as well. Read which register that copy takes it from.
  - Two `s32` parameters in, an `s32` out. Their quotient, with the first
    argument added back on.
---

# What survives a bl, and what does not

`r0` through `r3` belong to the callee. A helper is free to destroy all four,
and the division helpers do. So the moment a division appears inside a larger
expression, every other value the function still needs has to be somewhere
safe — and safe means `r4` upward, the registers the ABI promises a callee will
restore.

Those registers belong to somebody else too, so using one means pushing it on
entry and popping it on exit. A single extra live value turns `push {lr}` into
`push {r4, lr}` and adds two instructions to the epilogue. Here is a remainder
with a third argument subtracted from it:

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
afterwards. That is the whole shape: park, call, use. When you see `mov r4, rN`
as the first instruction after a push, you are looking at an argument being
saved from a call that has not happened yet.

Now the same subtraction written the other way round — the third argument minus
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

One instruction longer, and the extra instruction is a `mov r0, r4` at the end.
Thumb's `sub` is destructive, so a subtraction that has to keep the saved value
on the left writes its result into `r4`, and the answer then has to be carried
back to `r0` to be returned. Written the other way, the result lands in `r0`
where it was already wanted and no move is needed.

That trailing `mov r0, rN` is a tell worth memorising. It says the expression
was written with the saved value first and the call's result second, and it
survives all the way from the source through register allocation. `+` behaves
the same way; a named temporary changes nothing. When your diff shows one spare
`mov` at the bottom, the fix is usually to swap the two operands in your C.

Your target parks a value before its call as well, and that value is one the
division itself uses. Work out which register the copy reads, then let the shape
of the instruction after the `bl` tell you the operand order.

## Your task

Write `func_080bc7c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080bc7c0(s32 a, s32 b) {
    return a / b + a;
}
```
