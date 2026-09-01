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
  - The first branch jumps forward into the body; the second jumps over it. That
    asymmetry is the entire difference between the two short-circuit operators.
  - Two `s32` arguments and an `s32` result. Either argument being zero produces
    the same constant answer; otherwise the two are added together.
---

# The first branch points at the body

`||` and `&&` compile to the same two compares over the same two values. What
separates them is where the first branch points.

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

The branch at 2 jumps *into* the body at 8, and it does so with the condition
exactly as the source wrote it — one test passing is enough, so there is nothing
left to check. The branch at 6 is the last one, and it is the inverted one: with
no further tests to fall back on, failing it means the whole condition failed,
so it jumps past the body to 14.

Now the same function with the operator changed and nothing else touched:

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

Both branches inverted, both pointing at 14. Two compares, two branches, the
same body, the same eighteen bytes — and the operator is legible purely from
whether the branch targets agree.

The body in both is worth a glance on its way past: `mov r0, #1` followed by
`neg r0, r0`. Minus one has no single-instruction Thumb encoding, so the
compiler builds it in two whenever it has to materialise it fresh on a return
path.

Your target uses the or-shape with a different relation in both tests. Read the
first branch's destination to confirm which operator you are looking at, then
invert the last one to recover the second test.

## Your task

Write `func_0815471c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0815471c(s32 a, s32 b) {
    if (a == 0 || b == 0) return 0;
    return a + b;
}
```
