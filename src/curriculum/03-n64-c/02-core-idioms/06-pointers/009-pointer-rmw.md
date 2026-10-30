---
id: 81feb03b-8bed-436d-8952-2c2f1d132d02
slug: pointers-rmw
title: "Read, Modify, Write"
difficulty: 2
concepts:
  - pointers
  - stores
  - rmw
symbol: func_8007fac0
hints:
  - "The load and the store use the same offset and base, so one memory location is updated in place. The middle instruction is the update."
  - "The middle instruction is a register-form `addu` with an argument register as one operand. A compound assignment writes it in one line."
---

# The sandwich: lw, op, sw

Updating a value in memory takes three instructions, always in the same
order. The code loads the value, changes it, and stores it back:

```c
void drain(s32 *hp) {
    *hp = *hp - 5;
}
```

```asm
lw    t6, 0(a0)     # read  *hp
addiu t7, t6, -5    # …minus 5
sw    t7, 0(a0)     # write it back
jr    ra
nop
```

You can recognize it from the address operands: **the `lw` and the `sw` use
the same offset and the same base register.** That is one location, read and
then written again. This is called a read-modify-write, or RMW. In C it is a
compound assignment (`-=`, `+=`, `|=`, …) or the longer form
`*p = *p op x`. IDO compiles both the same way, so write whichever is clearer.

Games update their state with RMW all the time: health going down, a score
adding up, a timer moving forward. Some functions do nothing except one of
these sandwiches on a pointer they are given. When you read a big listing,
pair up the loads and stores by their `offset(base)`. Each matching pair is
a location being updated, and the instructions between them are the update.

In the target, the amount is not a constant. It comes in as an argument, so
the middle of the sandwich is a register-form operation instead of an
immediate.

## Your task

Write `func_8007fac0` to reproduce the target assembly.

<!-- solution -->
```c
void func_8007fac0(s32 *total, s32 x) {
    *total += x;
}
```
