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
  - Two arms write `r0` and both end at the same `bx lr`. Work out which arm the
    conditional branch selects and what has to be true to land there.
  - Two `s32` arguments and an `s32` result. One arm answers with a constant
    when the second argument is zero; the other adds the two arguments together.
---

# Every return lands on the same instruction

A function with two `return` statements does not get two return instructions.
gcc 2.9 gives the body one exit at the bottom, and each `return` in the source
becomes a way of arriving at that exit with the right value in `r0`.

Sometimes an early return costs nothing at all:

```asm
0        mov       r2, r0
2        mov       r0, r1
4        cmp       r2, r0
6        bgt       10 ~>
8        add       r0, r2, #1
10     ~>bx        lr
```

Read the first two instructions as staging. The first argument is parked in
`r2` and the second is moved into `r0`, which is where a returned value has to
end up. One of the two answers is therefore already in place before the compare
even runs: when `bgt` is taken it goes straight to the `bx lr` and returns the
second argument, and when it falls through the `add` overwrites `r0` with the
other answer on the way past. Six instructions, two returns, no join branch.

When the two answers cannot share a register that way, the exit needs a join:

```asm
0        cmp       r0, #200
2        bgt       8 ~>
4        mul       r0, r1
6        b         10 ~>
8      ~>sub       r0, #200
10     ~>bx        lr
```

The `b 10` at address 6 is the whole cost of the second way out. The
conditional branch picks an arm, each arm writes `r0`, and whichever arm is laid
down first has to hop over the other one to reach the shared `bx lr`. An
unconditional `b` sitting immediately before a `~>` label is nearly always
this — the end of one arm, stepping over the next.

Notice where `bgt` goes: to address 8, the arm that subtracts. A conditional
branch always means the same thing — go to the target when this condition
holds — so the arm sitting at the target is the arm that condition selects.
Here that is the `if`, which is the opposite of the guarded statement in the
previous lesson. The next lesson makes a rule out of which arm the compiler
puts where.

Your target is the second shape. For each arm, ask what had to be true to reach
it, and the two halves of the source fall out.

## Your task

Write `func_0811edac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0811edac(s32 total, s32 count) {
    if (count == 0) return 0;
    return total + count;
}
```
