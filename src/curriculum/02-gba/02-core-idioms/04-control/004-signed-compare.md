---
id: 06525327-b2e0-438d-8790-36921f23753d
slug: gba-control-signed-compare
title: Signed Comparisons
difficulty: 2
concepts:
  - branches
  - comparisons
  - register-allocation
symbol: func_08127c94
hints:
  - "`r3` is a copy of the first argument, made at address 0 so that `r0` could
    be loaded with the value that will be returned. So the left operand of the
    compare is the second argument."
  - There are three `s32` arguments and an `s32` result. The function returns
    the third argument, and the first argument is added to it under a
    condition.
---

# Which value was on the left

`cmp Ra, Rb` subtracts `Rb` from `Ra` and keeps the flags. The signed branches
read those flags as a comparison with `Ra` on the left. The four signed branches
match C operators exactly:

    blt   <      bge   >=
    ble   <=     bgt   >

So one branch gives you two separate pieces of information. The mnemonic tells
you the operator, once you have checked whether it was inverted. The operand
order of the `cmp` tells you which C expression was on the left of that
operator.

In this example both arms return, so the branch keeps the condition as it was
written:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        sub       r0, r1
6        b         10 ~>
8      ~>add       r0, r1
10     ~>bx        lr
```

`cmp r0, r1` with `bge` means the first argument is on the left and the
operator is `>=`, as written. The arm the branch jumps to is the one the source
put first. This one is direct to read, because nothing had to move before the
compare.

The next example has to move values first, and that makes it harder to read:

```asm
0        mov       r2, r0
2        mov       r0, r1
4        cmp       r2, r0
6        ble       10 ~>
8        sub       r0, r2, r0
10     ~>bx        lr
```

The two `mov`s at the top move the arguments out of the registers they arrived
in. The first argument is copied to `r2`. The second is placed in `r0`, because
it is the value one of the arms returns. When the compare runs, `r2` holds
argument one and `r0` holds argument two. So `cmp r2, r0` compares *the first
against the second*, and `ble` is the `<=` that the source wrote.

Make a habit of tracking what each register holds at the moment of the `cmp`.
Do not read `cmp r2, r0` as "r2 versus r0". The register numbers mean nothing by
themselves. The moves above the compare tell you what each register holds.

Your target starts with two of those moves, and the compare after them uses one
of the moved registers. Work out what each register holds before you decide
which way round the comparison was written.

## Your task

Write `func_08127c94` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08127c94(s32 a, s32 b, s32 c) {
    if (b < a) c += a;
    return c;
}
```
