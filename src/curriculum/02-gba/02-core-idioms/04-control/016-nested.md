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
  - The two conditional branches land on two different addresses, and each
    address produces a different answer. Count the different answers to get the
    number of arms.
  - There are three `s32` arguments and an `s32` result. The result is 1, 2 or
    3, depending on how far the values get through a chain of equality tests.
  - The inner compare uses a register that the source did not name. The outer
    test has already proved two of the arguments equal, so either one works.
---

# Count the destinations

To a compiler, nesting and `&&` are the same idea, and they often produce the
same bytes. In a listing, you tell them apart by whether the inner `if` has any
work of its own to do when it fails.

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

The two branches have two different destinations. Failing the outer test goes
to 12 and produces a constant. Failing the inner test goes to 14 and returns
without changing `r0`, which holds the first argument. Two tests give three
outcomes here. That is only possible if the tests are really nested, with the
inner failure handled inside the outer arm.

If you remove the inner `else`, the structure becomes simpler:

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

Now both branches point at 12, and the listing has the `&&` pattern from
earlier in the chapter. The compiled code cannot tell you whether the source
nested two `if`s or joined them with `&&`. Both versions match, so choose
whichever reads better next to the surrounding code.

Expect one more thing in nested equality tests. Once an outer `if` has shown
that two values are equal, gcc can use either of them in the inner compare, and
it does. So the register in the second `cmp` may not be the one the source
named. Do not read it as a different variable. The compiler is using the fact
that the outer test just proved.

Your target has three destinations. That tells you the structure before you
have worked out any of the conditions.

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
