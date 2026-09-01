---
id: 68368718-fec7-4257-827e-0c89b3635b5f
slug: gba-control-switch-chain
title: A Switch That Is Really Ifs
difficulty: 4
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_08161d78
hints:
  - The tests are a binary search, so the value compared first is the middle
    case rather than the first one. The bodies at the bottom of the listing are
    in source order, which is a much easier place to read the cases off.
  - Two `s32` arguments and an `s32` result. Three consecutive case values
    starting at zero, each doing something small to the second argument, and a
    default that produces a constant.
---

# The compare tree does not run in source order

A switch over a handful of values gets no special machinery. gcc turns it into
compares and branches — but not the linear chain of `if`s you would write by
hand. It builds a binary search, and the first value it tests is the middle of
the case range:

```asm
0        cmp       r0, #1
2        beq       28 ~>
4        cmp       r0, #1
6        bgt       14 ~>
8        cmp       r0, #0
10       beq       24 ~>
12       b         40 ~>
14     ~>cmp       r0, #2
16       beq       32 ~>
18       cmp       r0, #3
20       beq       36 ~>
22       b         40 ~>
24     ~>mov       r0, #5
26       b         44 ~>
28     ~>mov       r0, #12
30       b         44 ~>
32     ~>mov       r0, #30
34       b         44 ~>
36     ~>mov       r0, #7
38       b         44 ~>
40     ~>mov       r0, #1
42       neg       r0, r0
44     ~>bx        lr
```

The cases run 0 through 3 and the first test is against 1. Hit it and you are
done; otherwise `bgt` splits the range and each half tests its own values. So
the *tests* are in tree order while the *bodies* — addresses 24 through 42 — are
laid out in plain source order, each ending in a `b` to the shared exit, with
the default sitting last before it. Read the bodies to enumerate the cases, and
read the tree only to find out which body belongs to which value.

Look at addresses 0 through 6. `cmp r0, #1` is emitted, a `beq` consumes the
flags, and then `cmp r0, #1` is emitted *again* so that `bgt` can consume them
too. agbcc will not carry flags across a branch that might have been taken, no
matter how obviously they survive. A pair of identical compares with a single
conditional branch between them is a reliable fingerprint of a switch tree.

The default label is reached from two places here, and by unconditional `b`
rather than by a conditional branch: once from the bottom of the low half at 12
and once from the bottom of the high half at 22. Every leaf of the tree that
runs out of cases falls into one of those.

Your target is the same tree one case shorter, with bodies that do arithmetic
instead of loading constants.

## Your task

Write `func_08161d78` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08161d78(s32 mode, s32 v) {
    switch (mode) {
        case 0: return v;
        case 1: return v * 2;
        case 2: return v - 1;
    }
    return 0;
}
```
