---
id: 99017c93-6a22-48b6-8efa-fce7f45ea184
slug: gba-control-ternary
title: Picking One of Two
difficulty: 3
concepts:
  - branches
  - control-flow
  - constants
symbol: func_0813e1d8
hints:
  - 200 is written into `r1` before the compare, so it is the answer that is left
    when the branch is taken. That makes it the arm after the colon.
  - There is one `s32` argument and an `s32` result. The result is one of two
    constants, chosen by a single comparison against zero.
---

# The first constant you see is the else arm

A ternary that produces a value compiles to a different pattern from an
`if`/`else` that branches. The false arm is written into the destination
register *before* the compare. The true arm is one instruction that overwrites
it when the condition is true. There is no join branch, because the skip target
is the next instruction.

```asm
0        mov       r2, #0
2        cmp       r0, r1
4        ble       8 ~>
6        sub       r2, r0, r1
8      ~>mov       r0, r2
10       bx        lr
```

Read it backwards from the `mov r0, r2`. Whatever is in `r2` at address 8 is the
answer. `r2` starts as 0, and the subtraction at 6 replaces it only when `ble`
falls through, which means when the condition in the source is true. So 0 is the
arm after the colon, and the subtraction is the arm after the question mark.
`ble` is the opposite of the operator in the condition.

When the false arm is already in a useful place, the seed is not needed:

```asm
0        mov       r2, #7
2        cmp       r0, #0
4        beq       8 ~>
6        mov       r2, r1
8      ~>mov       r0, r2
10       bx        lr
```

This is the same pattern, with a constant false arm and a register true arm.
`beq` skips the overwrite when the tested value is zero. So the condition is a
plain truth test of the first argument, and 7 is the result when it is zero.

This matters for matching, because the same decision written as an `if`/`else`
compiles to different code. If both arms have a `return` and their own
instruction, you get the join branch pattern from earlier in the chapter. There
is no seed above the compare, and there is a `b` at the end of the first arm.
The seed is how you tell the two apart, so read the instruction above the `cmp`
first.

Your target puts a constant in a register as the seed, compares against zero,
and overwrites the seed with a second constant. Use the reading above to work
out which arm is which. Then take the opposite of the branch to get the
condition.

## Your task

Write `func_0813e1d8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0813e1d8(s32 x) {
    return x < 0 ? 100 : 200;
}
```
