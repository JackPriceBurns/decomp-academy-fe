---
id: a51af40d-c7c4-4b48-bcde-7ef8885bd2be
slug: gba-optimizer-branch-shape
title: Which Side Falls Through
difficulty: 4
concepts:
  - optimizer
  - branches
  - control-flow
symbol: func_083dbdd0
hints:
  - The `bne` at address 8 jumps forward to the arm that runs when the tested
    bit is set, so that arm is not the fall-through. Writing this as a ternary
    would give you `beq` and the two arms the other way round.
  - Three `s32` parameters, an `s32` out. The first is tested for its low bit;
    the other two swap roles between the arms.
---

# Which arm the compiler puts first

A two-way choice has to be laid out in a line. One arm gets to be the
fall-through, sitting immediately after the compare; the other gets an address
further down and a conditional branch to reach it. gcc 2.9 makes that choice
from the form of the statement you wrote, and it makes it consistently enough
that you can read the form back out of the target.

An `if`/`else` where each arm returns keeps the source's comparison. The
compare is followed by a branch in the same sense the C wrote, jumping forward
to the true arm; the false arm sits on the fall-through path and needs an
unconditional `b` to skip over the true arm it was placed above.

A ternary inverts it. The condition is emitted in the opposite sense, which
leaves the true arm on the fall-through path and sends the branch to the false
arm. When the false value is cheap enough — one instruction into a scratch
register — gcc computes it ahead of the compare and lets the branch skip the
instruction that would replace it. An `if`/`else` that assigns one variable and
returns it afterwards produces the same layout; those two spellings are
indistinguishable.

Here is the same absolute difference written both ways. First the `if`/`else`
with a return in each arm:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        sub       r0, r1, r0
6        b         10 ~>
8      ~>sub       r0, r1
10     ~>bx        lr
```

The C tested `x >= n` and the branch is `bge`, the same sense. The true arm is
at 8, reached by that branch; the false arm at 4 is the fall-through and jumps
over it.

Now the ternary:

```asm
0        sub       r2, r1, r0
2        cmp       r0, r1
4        blt       8 ~>
6        sub       r2, r0, r1
8      ~>mov       r0, r2
10       bx        lr
```

Same test in the source, `blt` in the object — inverted. The false value is
already in `r2` before the compare runs, and the `blt` skips the instruction
that would replace it. The join then needs `mov r0, r2` because the value was
built in a scratch register.

Comparing branch conditions against the source is the reliable check. If your C
produces the opposite condition to the target, the arithmetic is not the
problem; the shape of the statement is.

Your target tests a bit and takes a two-instruction arm on each side. Work out
from the branch which of the two arms the compiler placed on the fall-through
path, and write the C that puts it there.

## Your task

Write `func_083dbdd0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083dbdd0(s32 a, s32 b, s32 c) {
    if (a & 1) return b * 4 + c;
    else return c * 4 + b;
}
```
