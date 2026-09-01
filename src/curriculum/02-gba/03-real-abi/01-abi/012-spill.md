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
  - Four values are protected across the call, and all four of them arrived as
    arguments — which is why the fourth one had to go somewhere Thumb cannot
    push.
  - Four `s32` parameters in, an `s32` out. Only the first is passed to `mixIn`;
    the other three are folded into the result afterwards, in register order.
---

# The r8 tax

There are exactly four cheap places to keep a value across a call: `r4`, `r5`,
`r6`, `r7`. When a function needs a fifth, gcc reaches above them into `r8` —
and Thumb's `push` instruction cannot encode `r8`. Only `r0`-`r7` and `lr` fit in
a push list.

So it does it in two steps. Copy `r8` down into a low register that has already
been saved, push that low register, and mirror the whole thing in the epilogue.
Five values live across one call:

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

Addresses 2-4 and 30-32 are the entire tax: four extra instructions to save and
restore one register. Thumb's `add rd, rm` does have a high-register form, which
is why address 26 can read `r8` directly — but most instructions do not, so a
value parked in `r8` that needs to be multiplied or subtracted has to be copied
down into a low register first, one `mov` per use. Note also that the second push
carries no `lr`; it is a pure spill, and the `pop {r3}` that undoes it lands in
whichever low register was free at that point.

The `ldr r7, [sp, #24]` at address 14 is the fifth argument, and its offset
counts both pushes: five registers in the first list and one in the second make
six words, so the incoming block starts twenty-four bytes up.

There is a surprise waiting in the smaller case. You would expect gcc to fill
`r4`, `r5`, `r6`, `r7` before paying for `r8`, and it does not always. When all
four of the incoming argument registers must survive a call, this compiler
reaches for `r8` as the fourth home and leaves `r7` untouched — four extra
instructions of prologue and epilogue it did not have to spend, plus one more
`mov` at every use that cannot take a high register. Nothing you write predicts
which functions get this treatment, but the shape is deterministic: if your
attempt uses `r7` where the target uses `r8`, change *how many* values stay live
rather than reordering your statements.

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
