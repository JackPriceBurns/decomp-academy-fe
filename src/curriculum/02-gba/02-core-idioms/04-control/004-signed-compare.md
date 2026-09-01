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
    be loaded with the value that is going to be returned. That means the
    compare's left operand is the second argument, not the first."
  - Three `s32` arguments and an `s32` result. The third argument is what comes
    back; the first is conditionally added onto it.
---

# Which value was on the left

`cmp Ra, Rb` subtracts `Rb` from `Ra` and keeps the flags, and the signed
branches read those flags as a relation with `Ra` on the left. The four of them
map onto C exactly:

    blt   <      bge   >=
    ble   <=     bgt   >

That gives you two independent pieces of information from one branch. The
mnemonic tells you the operator, once you have accounted for whether it was
inverted; the `cmp`'s operand order tells you which C expression was on the left
of that operator.

Here are both arms returning, so the branch keeps the polarity it was written
with:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        sub       r0, r1
6        b         10 ~>
8      ~>add       r0, r1
10     ~>bx        lr
```

`cmp r0, r1` with `bge`: first argument on the left, `>=` as written, and the
arm it jumps to is the one the source put first. Straightforward, because
nothing had to move before the compare.

The next one has to move something, and that is where the reading gets
interesting:

```asm
0        mov       r2, r0
2        mov       r0, r1
4        cmp       r2, r0
6        ble       10 ~>
8        sub       r0, r2, r0
10     ~>bx        lr
```

The two `mov`s at the top swap the arguments out of the registers they arrived
in: the first is copied to `r2` and the second is installed in `r0` because it
is the value one of the arms returns. By the time the compare runs, `r2` holds
argument one and `r0` holds argument two — so `cmp r2, r0` is *first versus
second*, and `ble` is the `<=` the source wrote.

Get in the habit of tracking what each register holds at the moment of the
`cmp`, rather than reading `cmp r2, r0` as "r2 versus r0". The register numbers
mean nothing on their own; the shuffle above them is what gives them meaning.

Your target opens with two of those moves, and the compare that follows names
one of them. Work out what each register holds before you decide which way round
the relation was written.

## Your task

Write `func_08127c94` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08127c94(s32 a, s32 b, s32 c) {
    if (b < a) c += a;
    return c;
}
```
