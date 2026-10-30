---
id: 5e11675d-4c12-4dc1-b709-4468515eb5d7
slug: gba-abi-spill
title: Running Out of Registers
difficulty: 5
concepts:
  - abi
  - callee-saved
  - register-pressure
symbol: func_0830e8f8
hints:
  - Four values are kept across the call, and all four of them arrived as
    arguments. That is why the fourth one had to go in a register that Thumb
    cannot push.
  - The function takes four `s32` parameters and returns an `s32`. Only the
    first is passed to `mixIn`. The other three are combined into the result
    afterwards, in register order.
---

# The cost of using r8

There are exactly four cheap places to keep a value across a call: `r4`, `r5`,
`r6` and `r7`. When a function needs a fifth, gcc uses the next register up,
`r8`. But Thumb's `push` instruction cannot encode `r8`. Only `r0` to `r7` and
`lr` fit in a push list.

So gcc saves it in two steps. It copies `r8` down into a low register that has
already been saved, and then pushes that low register. The epilogue does the
same steps in reverse. Here five values stay live across one call:

```asm
0        push      {r4, r5, r6, r7, lr}
2        mov       r7, r8
4        push      {r7}
6        mov       r4, r0
8        mov       r5, r1
10       mov       r6, r2
12       mov       r8, r3
14       ldr       r7, [sp, #24]
16       bl        shadeOne-4
20       add       r0, r4
22       add       r0, r5
24       add       r0, r6
26       add       r0, r8
28       add       r0, r7
30       pop       {r3}
32       mov       r8, r3
34       pop       {r4, r5, r6, r7}
36       pop       {r1}
38       bx        r1
```

Addresses 2-4 and 30-32 are the whole extra cost: four instructions to save and
restore one register. Thumb's `add rd, rm` has a form that works on high
registers, which is why address 26 can read `r8` directly. Most instructions
have no such form. So if a value kept in `r8` needs to be multiplied or
subtracted, it must first be copied down into a low register, with one `mov`
for each use. Also note that the second push does not include `lr`. It is a
pure spill, and the `pop {r3}` that undoes it uses whichever low register is
free at that point.

The `ldr r7, [sp, #24]` at address 14 loads the fifth argument. Its offset
counts both pushes. Five registers in the first list and one in the second make
six words, so the incoming block starts twenty-four bytes above `sp`.

When only four values need saving, you might expect gcc to fill `r4`, `r5`,
`r6` and `r7` before it pays for `r8`. It does not always do that. When all
four incoming argument registers must survive a call, this compiler uses `r8`
for the fourth value and leaves `r7` unused. That costs four extra instructions
in the prologue and epilogue that it did not need, plus one more `mov` at every
use that cannot take a high register. Nothing in your C tells you in advance
which functions get this treatment, but the output is deterministic: the same
code always gives the same registers. If your attempt uses `r7` where the
target uses `r8`, change *how many* values stay live. Reordering your
statements will not fix it.

## Your task

`extern s32 mixIn(s32 v);` is declared for you. Write `func_0830e8f8` to
reproduce the target assembly.

<!-- context -->
```c
extern s32 mixIn(s32 v);
```

<!-- solution -->
```c
s32 func_0830e8f8(s32 a, s32 b, s32 c, s32 d) {
    return mixIn(a) + a * b + c - d;
}
```
