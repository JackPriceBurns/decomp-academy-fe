---
id: de499c96-24b9-4279-8f91-a458210cf748
slug: gba-control-and-chain
title: Short-Circuit and
difficulty: 3
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0814ffa8
hints:
  - Both branches go to the same address, and that address is the `bx lr`
    itself — so the answer on the failing path is already in `r0` before the
    first compare runs.
  - Two `s32` arguments and an `s32` result. The first argument is what normally
    comes back; the second replaces it only when both tests pass.
---

# Two branches, one destination

`&&` has no instruction behind it. What the compiler emits is a run of compares
in source order, each one branching to the *same* address with the inverted
condition, so that falling off the end of the run is the only way to reach the
guarded code:

```asm
0        cmp       r0, r1
2        bge       12 ~>
4        cmp       r1, #99
6        bgt       12 ~>
8        sub       r0, r1, r0
10       b         14 ~>
12     ~>mov       r0, #0
14     ~>bx        lr
```

Address 12 is where both branches point, and it holds the answer for "the
condition did not hold". `bge` is the inversion of the first test, `bgt` the
inversion of the second — and the second test's constant has been nudged the
usual way, so the source bound is 100 rather than the 99 you can see.

This is why you read branch *targets* before branch mnemonics. Two compares that
both jump to one label is `&&`, whatever the operators are. Short-circuiting
comes out of the shape for free: if the first branch is taken, the second
compare never executes, which is exactly what C promises.

There is one arrangement where the whole thing disappears. When both tests are
against constants and together they describe a contiguous range of one variable,
gcc rewrites them as a single unsigned comparison:

```asm
0        sub       r0, #10
2        cmp       r0, #10
4        bls       10 ~>
6        mov       r0, #0
8        b         12 ~>
10     ~>mov       r0, #1
12     ~>bx        lr
```

Subtract the low bound, compare against the width of the range, branch
*unsigned*. Anything below the low bound wraps to a huge unsigned value and
fails the compare, which is the trick's whole point — and note `bls` even though
the variable under test is signed. A `sub` immediately followed by a `cmp` and
an unsigned branch is a range test, not an `&&` you can read literally.

Your target keeps its two compares, so no such rewrite happened. Find the shared
target first, then work backwards through the two conditions that lead there.

## Your task

Write `func_0814ffa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0814ffa8(s32 a, s32 b) {
    if (a > 0 && b < a) return b;
    return a;
}
```
