---
id: 74001662-2781-4359-baa7-026fa28a3a64
slug: gba-control-nested
title: Nested Conditions
difficulty: 4
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0815d604
hints:
  - The two conditional branches land on two different addresses, and each of
    those addresses produces a different answer. Count the distinct answers and
    you have the number of arms.
  - Three `s32` arguments and an `s32` result of 1, 2 or 3, depending on how far
    down a chain of equalities the values get.
  - The inner compare names a register the source did not — the outer test has
    already proved two of the arguments equal, so either one will do.
---

# Count the destinations

Nesting and `&&` are the same idea to a compiler, and much of the time they
produce the same bytes. What separates them in a listing is whether the inner
`if` has anything of its own to do when it fails.

```asm
0        cmp       r0, #0
2        ble       12 ~>
4        cmp       r1, #0
6        ble       14 ~>
8        add       r0, r1
10       b         14 ~>
12     ~>mov       r0, #0
14     ~>bx        lr
```

Two branches, two different destinations. Failing the outer test goes to 12 and
produces a constant; failing the inner test goes to 14 and returns without
touching `r0`, which is the first argument. Three outcomes from two tests, and
that is only possible if the tests are genuinely nested, with the inner failure
handled inside the outer arm.

Remove the inner `else` and the structure collapses:

```asm
0        cmp       r0, #0
2        ble       12 ~>
4        cmp       r1, #0
6        ble       12 ~>
8        mov       r0, #1
10       b         14 ~>
12     ~>mov       r0, #0
14     ~>bx        lr
```

Now both branches point at 12 and the listing is the and-chain shape from
earlier in the chapter. There is no way to tell from the object whether the
source nested two `if`s or joined them with `&&` — both spellings match, so pick
whichever reads better next to the surrounding code.

One more thing to expect in nested equality tests. Once an outer `if` has
established that two values are equal, gcc is free to use either of them in the
inner compare, and it does — so the register in the second `cmp` may not be the
one the source named. Do not read that as a different variable; read it as the
compiler cashing in the fact the outer test just proved.

Your target has three destinations, which fixes the shape before you have worked
out a single condition.

## Your task

Write `func_0815d604` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0815d604(s32 a, s32 b, s32 c) {
    if (a == b) {
        if (b == c) return 3;
        return 2;
    }
    return 1;
}
```
