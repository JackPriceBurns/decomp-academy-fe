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
  - "The only `sw` parks the one argument that is never read. Its slot, 4(sp), belongs to the second argument. You must still declare it, or the argument you need would never arrive in a2."
---

# Don't skip the arguments in between

This works like the last lesson, but now the function *does* something with its
arguments. It no longer returns one of them unchanged. The counting stays the
same. Arguments that do work appear in the arithmetic. Arguments that are
ignored appear as parking stores. The highest position on either list is your
parameter count.

Suppose an `addu` takes its two sources from `a0` and `a3`:

```asm
sw   a1, 4(sp)
sw   a2, 8(sp)
addu v0, a0, a3
jr   ra
nop
```

`a0` is the 1st argument and `a3` is the 4th, so there are four parameters. The
parking stores match the two in between: `4(sp)` and `8(sp)` are the slots of
the 2nd and 3rd arguments, so `b` and `c` arrive and are ignored. You still have
to declare them. If you leave one out, the value you need no longer arrives in
`a3`:

```c
s32 edge(s32 a, s32 b, s32 c, s32 d) {
    return a + d;
}
```

Read your target and find the two source registers of the `addu`. Then use the
parked slot to fill in the rest of the argument list.

## Your task

Write `func_80375670` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80375670(s32 a, s32 b, s32 c) {
    return a + c;
}
```
