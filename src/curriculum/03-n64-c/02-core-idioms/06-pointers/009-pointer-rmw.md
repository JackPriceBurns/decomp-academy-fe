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
  - "Load and store share the same offset and base — that's one memory location being updated in place. The middle instruction is the update."
  - "The middle op is a register-form `addu` with an argument register as one operand; a compound assignment writes it in one line."
---

# The sandwich: lw, op, sw

Updating a value in memory takes three instructions, always in the same
order — load it, change it, store it back:

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

The tell is in the address operands: **the `lw` and the `sw` use the
same offset and the same base register.** That's one location, read and
rewritten — a read-modify-write, or RMW. In C it's a compound
assignment (`-=`, `+=`, `|=`, …) or its spelled-out `*p = *p op x`
form; IDO compiles both identically, so write whichever reads better.

RMW is the beating heart of game state: health ticking down, a
score accumulating, a timer advancing. Whole functions exist just to
perform one of these sandwiches on a pointer they're handed. When you
scan a big listing, pair up loads and stores by their `offset(base)` —
every matched pair is a location being updated, and the instructions
between them are the update.

In the target, the amount isn't a constant — it arrives as the second
argument, so the middle of the sandwich is a register-form operation
instead of an immediate.

## Your task

Write `func_8007fac0` to reproduce the target assembly.

<!-- solution -->
```c
void func_8007fac0(s32 *total, s32 x) {
    *total += x;
}
```
