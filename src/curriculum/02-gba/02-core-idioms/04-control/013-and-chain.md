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
    itself. So the answer on the failing path is already in `r0` before the
    first compare runs.
  - There are two `s32` arguments and an `s32` result. The function normally
    returns the first argument. The second replaces it only when both tests
    pass.
---

# Two branches, one destination

No instruction does `&&` directly. The compiler emits a series of compares in
source order. Each one branches to the *same* address with the inverted
condition. So the only way to reach the guarded code is to fall through the end
of the series:

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

Both branches point to address 12, which holds the answer for "the condition was
false". `bge` is the opposite of the first test, and `bgt` is the opposite of
the second. The second test's constant has also been changed by one in the
usual way, so the bound in the source is 100, while the listing shows 99.

This is why you read branch *targets* before branch mnemonics. Two compares that
both jump to one label mean `&&`, whatever the operators are. Short-circuiting
comes from this pattern with no extra code. If the first branch is taken, the
second compare never runs, which is exactly what C requires.

In one case, the two compares are replaced. When both tests are against
constants, and together they describe a continuous range of one variable, gcc
rewrites them as a single unsigned comparison:

```asm
0        sub       r0, #10
2        cmp       r0, #10
4        bls       10 ~>
6        mov       r0, #0
8        b         12 ~>
10     ~>mov       r0, #1
12     ~>bx        lr
```

The code subtracts the low bound, compares against the width of the range, and
uses an *unsigned* branch. Any value below the low bound wraps around to a very
large unsigned value and fails the compare. That is the purpose of the
subtraction. Note that the branch is `bls` even though the variable being
tested is signed. A `sub` followed directly by a `cmp` and an unsigned branch is
a range test. Do not read it literally as an `&&`.

Your target still has its two compares, so this rewrite did not happen. Find the
shared target first. Then work backwards through the two conditions that lead
there.

## Your task

Write `func_0814ffa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0814ffa8(s32 a, s32 b) {
    if (a > 0 && b < a) return b;
    return a;
}
```
