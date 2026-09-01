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
  - 200 is written into `r1` before the compare, so it is the answer that
    survives when the branch is taken. That makes it the arm after the colon.
  - One `s32` argument and an `s32` result, chosen between two constants by a
    single comparison against zero.
---

# The first constant you see is the else arm

A ternary that produces a value gets a different skeleton from an `if`/`else`
that branches. The false arm is written into the destination register *before*
the compare, and the true arm is one instruction that conditionally overwrites
it. There is no join branch, because the skip target is simply the next
instruction.

```asm
0        mov       r2, #0
2        cmp       r0, r1
4        ble       8 ~>
6        sub       r2, r0, r1
8      ~>mov       r0, r2
10       bx        lr
```

Read it backwards from the `mov r0, r2`: whatever is in `r2` at address 8 is the
answer. `r2` starts as 0, and the subtraction at 6 replaces it only when `ble`
falls through — that is, when the relation the source wrote is true. So 0 is the
arm after the colon, the subtraction is the arm after the question mark, and
`ble` is the inversion of the operator between them.

The seed disappears when the false arm already lives somewhere useful:

```asm
0        mov       r2, #7
2        cmp       r0, #0
4        beq       8 ~>
6        mov       r2, r1
8      ~>mov       r0, r2
10       bx        lr
```

Same skeleton with a constant false arm and a register true arm. `beq` skips the
overwrite when the tested value is zero, so the condition is a bare truth test
of the first argument and 7 is what a zero produces.

This matters for matching because the `if`/`else` spelling of the same decision
compiles to something else. Give both arms a `return` and an instruction of
their own and you get the join-branch shape from earlier in the chapter: no seed
above the compare, and a `b` at the end of the first arm. The seed is what
separates the two, so read the instruction above the `cmp` before anything else.

Your target seeds a constant, compares against zero, and overwrites the seed
with a second constant. Apply the reading above to sort the two arms out, then
invert the branch for the relation.

## Your task

Write `func_0813e1d8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0813e1d8(s32 x) {
    return x < 0 ? 100 : 200;
}
```
