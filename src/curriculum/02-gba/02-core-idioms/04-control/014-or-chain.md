---
id: 926436e1-8572-4b2e-89e6-8308c961ec3b
slug: gba-control-or-chain
title: Short-Circuit or
difficulty: 3
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0815471c
hints:
  - The first branch jumps forward into the body, and the second jumps over it.
    That difference is the only thing that separates the two short-circuit
    operators.
  - There are two `s32` arguments and an `s32` result. If either argument is
    zero, the function returns the same constant. Otherwise it adds the two
    together.
---

# The first branch points at the body

`||` and `&&` compile to the same two compares on the same two values. The
difference is where the first branch points.

```asm
0        cmp       r0, #0
2        blt       8 ~>
4        cmp       r1, #0
6        bge       14 ~>
8      ~>mov       r0, #1
10       neg       r0, r0
12       b         16 ~>
14     ~>add       r0, r1
16     ~>bx        lr
```

The branch at 2 jumps *into* the body at 8, and it uses the condition exactly as
the source wrote it. One test passing is enough, so there is nothing left to
check. The branch at 6 is the last one, and it is the inverted one. There are no
more tests after it, so failing it means the whole condition failed, and it
jumps past the body to 14.

Here is the same function with only the operator changed:

```asm
0        cmp       r0, #0
2        bge       14 ~>
4        cmp       r1, #0
6        bge       14 ~>
8        mov       r0, #1
10       neg       r0, r0
12       b         16 ~>
14     ~>add       r0, r1
16     ~>bx        lr
```

Both branches are inverted, and both point at 14. The two versions have the same
compares, branches and body, and both are eighteen bytes. You can tell the
operator only from whether the two branch targets are the same.

Look briefly at the body in both: `mov r0, #1` followed by `neg r0, r0`. Thumb
cannot load minus one in a single instruction. So when the compiler has to
create it from nothing on a return path, it uses two instructions.

Your target uses the `||` pattern, with a different comparison in both tests.
Read the first branch's destination to confirm which operator you are looking
at. Then take the opposite of the last branch to get the second test.

## Your task

Write `func_0815471c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0815471c(s32 a, s32 b) {
    if (a == 0 || b == 0) return 0;
    return a + b;
}
```
