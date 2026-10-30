---
id: 29a6dfcc-72d2-42bd-a877-46802ac51a8c
slug: gba-control-early-return
title: Two Ways Out
difficulty: 2
concepts:
  - branches
  - control-flow
  - returns
symbol: func_0811edac
hints:
  - Both arms write `r0`, and both end at the same `bx lr`. Work out which arm
    the conditional branch selects, and what must be true to reach it.
  - There are two `s32` arguments and an `s32` result. One arm returns a
    constant when the second argument is zero. The other arm adds the two
    arguments together.
---

# Every return lands on the same instruction

A function with two `return` statements does not get two return instructions.
gcc 2.9 gives the function one exit at the bottom. Each `return` in the source
becomes a path to that exit with the right value in `r0`.

Sometimes an early return needs no extra instructions:

```asm
0        mov       r2, r0
2        mov       r0, r1
4        cmp       r2, r0
6        bgt       10 ~>
8        add       r0, r2, #1
10     ~>bx        lr
```

The first two instructions set up the registers. The first argument is moved
to `r2`, and the second is moved into `r0`, which is where a return value must
end up. So one of the two answers is already in place before the compare runs.
When `bgt` is taken, it goes straight to the `bx lr` and returns the second
argument. When it falls through, the `add` replaces `r0` with the other answer
before it reaches the `bx lr`. That gives two returns in six instructions, with
no join branch.

When the two answers cannot share a register like this, the exit needs a join:

```asm
0        cmp       r0, #200
2        bgt       8 ~>
4        mul       r0, r1
6        b         10 ~>
8      ~>sub       r0, #200
10     ~>bx        lr
```

The `b 10` at address 6 is the only extra instruction the second return
needs. The conditional branch picks an arm, and each arm writes `r0`. The arm
placed first must jump over the other arm to reach the shared `bx lr`. An
unconditional `b` just before a `~>` label nearly always means this: it is the
end of one arm, jumping over the next one.

Notice where `bgt` goes: to address 8, the arm that subtracts. A conditional
branch always means the same thing: go to the target when this condition is
true. So the arm at the target is the arm that the condition selects. Here that
arm is the `if` body, which is the opposite of the guarded statement in the
previous lesson. The next lesson gives a rule for which arm the compiler puts
where.

Your target uses the second shape. For each arm, work out what had to be true
to reach it. That gives you the two halves of the source.

## Your task

Write `func_0811edac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0811edac(s32 total, s32 count) {
    if (count == 0) return 0;
    return total + count;
}
```
