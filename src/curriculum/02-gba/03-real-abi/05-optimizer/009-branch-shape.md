---
id: a51af40d-c7c4-4b48-bcde-7ef8885bd2be
slug: gba-optimizer-branch-shape
title: Which Arm Falls Through
difficulty: 4
concepts:
  - optimizer
  - branches
  - control-flow
symbol: func_083dbdd0
hints:
  - The `bne` at address 8 jumps forward to the arm that runs when the tested
    bit is set, so that arm is not on the fall-through path. A ternary would
    give you `beq`, with the two arms the other way round.
  - The function takes three `s32` parameters and returns an `s32`. The first
    is tested for its low bit. The other two swap roles between the arms.
---

# Which arm the compiler puts first

The two arms of a choice have to be placed one after the other in memory. One
arm is the fall-through, placed right after the compare. The other arm goes at
an address further down, and a conditional branch jumps to it. gcc 2.9 decides
which is which from the form of the statement you wrote. It does this
consistently enough that you can read the form back from the target.

An `if`/`else` where each arm returns keeps the comparison from the source.
After the compare comes a branch with the same condition the C wrote, and it
jumps forward to the true arm. The false arm sits on the fall-through path. It
needs an unconditional `b` to skip over the true arm, which is placed below it.

A ternary reverses this. The condition is emitted the opposite way round, so
the true arm is on the fall-through path and the branch goes to the false arm.
Sometimes the false value is cheap enough to build with one instruction into a
scratch register. Then gcc computes it before the compare, and the branch skips
the instruction that would replace it. An `if`/`else` that assigns one variable
and returns it afterwards produces the same layout. You cannot tell those two
versions apart.

Here is the same absolute difference written both ways. First, the `if`/`else`
with a return in each arm:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        sub       r0, r1, r0
6        b         10 ~>
8      ~>sub       r0, r1
10     ~>bx        lr
```

The C tested `x >= n`, and the branch is `bge`, the same condition. The true
arm is at 8, and that branch reaches it. The false arm at 4 is the
fall-through, and it jumps over the true arm.

Now the ternary:

```asm
0        sub       r2, r1, r0
2        cmp       r0, r1
4        blt       8 ~>
6        sub       r2, r0, r1
8      ~>mov       r0, r2
10       bx        lr
```

The source has the same test, but the object has `blt`, the reversed
condition. The false value is already in `r2` before the compare runs, and the
`blt` skips the instruction that would replace it. The join then needs
`mov r0, r2`, because the value was built in a scratch register.

Comparing the branch condition with the source is the reliable check. If your C
produces the opposite condition from the target, the problem is the shape of
the statement, and your arithmetic can stay as it is.

Your target tests a bit and has a two-instruction arm on each side. Use the
branch to work out which arm the compiler placed on the fall-through path.
Then write the C that puts it there.

## Your task

Write `func_083dbdd0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083dbdd0(s32 a, s32 b, s32 c) {
    if (a & 1) return b * 4 + c;
    else return c * 4 + b;
}
```
