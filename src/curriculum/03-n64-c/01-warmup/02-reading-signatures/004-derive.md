---
id: 0dd59c2e-29dd-419f-a01c-ebda49850851
slug: signatures-derive
title: Count Them Yourself
difficulty: 1
concepts:
  - calling-convention
  - arguments
  - arithmetic
symbol: func_80375670
hints:
  - "The two source registers of the `addu` are the 1st and 3rd argument registers."
  - "The lone `sw` parks the one argument that's never read — 4(sp) is the second argument's slot. You must still declare it, or the argument you need would never land in a2."
---

# Mind the gap

Same game, except now the function actually *does* something with its arguments
instead of handing one straight back. The counting doesn't change: arguments
doing work show up in the arithmetic, arguments being ignored show up parked,
and the highest position on either list is your parameter count.

Say an `addu` takes its two sources from `a0` and `a3`:

```asm
sw   a1, 4(sp)
sw   a2, 8(sp)
addu v0, a0, a3
jr   ra
nop
```

`a0` is the 1st argument and `a3` is the 4th, so there are four parameters. The
two in between are exactly what the parking predicts: `4(sp)` and `8(sp)` are
the 2nd and 3rd arguments' slots, so `b` and `c` arrive and are ignored. You
still have to declare them — leave one out and the value you need would never
land in `a3` to begin with:

```c
s32 edge(s32 a, s32 b, s32 c, s32 d) {
    return a + d;
}
```

Read your target, find the `addu`'s two source registers, and let the parked
slot fill in the roster.

## Your task

Write `func_80375670` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80375670(s32 a, s32 b, s32 c) {
    return a + c;
}
```
