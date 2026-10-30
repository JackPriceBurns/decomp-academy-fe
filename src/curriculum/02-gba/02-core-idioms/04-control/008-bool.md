---
id: 80aeb42a-cca3-4084-9de7-cd47b0171787
slug: gba-control-bool
title: A Comparison as a Value
difficulty: 2
concepts:
  - branches
  - comparisons
  - control-flow
symbol: func_08139a64
hints:
  - The seed is 0, and the branch skips the `mov` that would make it 1. So the
    answer is 1 exactly when the branch is not taken. Take the opposite of `blt`
    to get the comparison.
  - There are two `s32` arguments and an `s32` result that is only ever 0 or 1.
    The comparison itself is the return value, with no `if` around it.
---

# Set zero first, then overwrite it with one

Sometimes a comparison is used as a *value*, instead of as a branch condition.
It still has to be built from branches, because Thumb has no conditional
execution and no instruction that copies a flag into a register. gcc 2.9 has
one general method. It puts 0 in a register (the seed), compares, jumps over a
`mov #1` when the comparison is false, and returns whatever is left in the
register.

```asm
0        mov       r1, #0
2        cmp       r0, #7
4        ble       8 ~>
6        mov       r1, #1
8      ~>mov       r0, r1
10       bx        lr
```

That is six instructions for one operator in C. The seed at address 0 runs
before the compare. It sets up the false answer in advance, before either
outcome is chosen. `ble` is the opposite of the comparison that was written,
exactly as for a guarded statement, because the `mov #1` is a body that the
branch skips.

The last `mov r0, r1` looks wasteful, and sometimes it is. Here it is needed
because the compare uses `r0` for the value being tested, so the result is
built in another register. If you make the tested value unsigned and change the
bound, everything except the branch stays in place:

```asm
0        mov       r1, #0
2        cmp       r0, #39
4        bhi       8 ~>
6        mov       r1, #1
8      ~>mov       r0, r1
10       bx        lr
```

It has the same six instructions and the same two registers. The branch is now
unsigned, and the compare constant is one lower, as for any `<` against a
constant. The bound in the source is 40. You learned both of these readings in
earlier lessons, and the seed and overwrite pattern around them does not change
either one.

Some comparisons do not use this method. `a != b` as a value compiles with no
branch: an `eor`, a `neg`, an `orr` and a shift. `x < 0` becomes a single
`lsr #31`, and `x >= 0` becomes an `mvn` before that same shift. If a target
shows the full pattern (seed, compare, branch, set), you can rule out all of
those before you start.

Your target uses the same pattern, with two registers and a signed branch.

## Your task

Write `func_08139a64` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08139a64(s32 a, s32 b) {
    return a >= b;
}
```
