---
id: 68368718-fec7-4257-827e-0c89b3635b5f
slug: gba-control-switch-chain
title: A Switch Built From Compares
difficulty: 4
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_08161d78
hints:
  - The tests are a binary search, so the first value compared is the middle
    case. The bodies at the bottom of the listing are in source order, and they
    are a much simpler place to read the cases from.
  - There are two `s32` arguments and an `s32` result. There are three
    consecutive case values, starting at zero. Each one does something small to
    the second argument, and a default produces a constant.
---

# The compare tree does not run in source order

A switch over a few values gets no special structure. gcc turns it into
compares and branches, arranged as a binary search instead of the simple chain
of `if`s you would write by hand. The first value it tests is in the middle of
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

The cases run from 0 through 3, and the first test is against 1. If the value
matches, the branch goes straight to that body. Otherwise `bgt` splits the
range, and each half tests its own values. So the *tests* are in tree order,
but the *bodies* (addresses 24 through 42) are in source order. Each body ends
in a `b` to the shared exit, and the default comes last, just before the exit.
Read the bodies to list the cases. Read the tree only to find out which body
belongs to which value.

Look at addresses 0 through 6. The compiler emits `cmp r0, #1`, a `beq` reads
the flags, and then `cmp r0, #1` is emitted *again* so that `bgt` can read them
too. agbcc does not keep flags across a branch that might have been taken, even
when the flags are clearly still valid. Two identical compares with one
conditional branch between them are a reliable sign of a switch tree.

Here the default label is reached from two places, both by an unconditional `b`
and never by a conditional branch. One is at the bottom of the low half at 12,
and the other is at the bottom of the high half at 22. Every leaf of the tree
that runs out of cases ends at one of those.

Your target has the same tree with one case fewer, and its bodies do arithmetic
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
