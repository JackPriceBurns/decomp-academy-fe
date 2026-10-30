---
id: 3ef01036-908b-4f2d-9749-94d6f3bc3bcb
slug: gba-mastery-collision
title: A Box Overlap Test
difficulty: 4
concepts:
  - branches
  - structs
  - boolean-logic
symbol: func_08422910
hints:
  - "Suppose a register is set to 0 before any work, a `mov #1` is at the very
    bottom, and every failing branch goes to the same address. Then the code is
    a short-circuited `&&` chain that produces a flag. Four branches out means
    four conditions."
  - "Each test compares an edge of one box with the other box's edge plus its
    extent. Offsets 0 and 8 are one axis, and 4 and 12 are the other. Watch
    which of the two pointers each `ldr` reads from."
  - "Two `Box *` go in and an `s32` comes out. The source conditions use `<`,
    which the compiler inverted into `bge`. In each comparison, the box that
    supplies the plain coordinate is on the left."
---

# Four questions, one answer

Two axis-aligned rectangles overlap only if they overlap horizontally *and*
vertically. Each axis needs two comparisons, one for each box being to the left
of the other. That makes four tests, and the first one that fails decides the
result. This is exactly how `&&` behaves.

gcc 2.9 always compiles this with the same structure. It sets a register to 0
before any of the work happens. It tests each condition with its comparison
**inverted**, so that a failure branches forward. At the bottom it puts a
`mov rN, #1`, which only runs if control reached the end without branching.
Every failure branch goes to the same address, because the compiler merged the
identical exits into one:

```asm
0        mov       r3, #0
2        cmp       r0, r1
4        blt       12 ~>
6        cmp       r0, r2
8        bgt       12 ~>
10       mov       r3, #1
12     ~>mov       r0, r3
14       bx        lr
```

`r3` holds the answer, and it is set up before the first `cmp`. The source
tested `v >= lo`, so the exit branch is `blt`. It tested `v <= hi`, so the exit
branch is `bgt`. To read the conditions from a listing, reverse every branch you
see.

`||` uses the same pieces the other way round:

```asm
0        mov       r2, #0
2        cmp       r0, #0
4        ble       14 ~>
6        mov       r0, #4
8        and       r0, r1
10       cmp       r0, #0
12       beq       16 ~>
14     ~>mov       r2, #1
16     ~>mov       r0, r2
18       bx        lr
```

Here a *passing* test jumps straight to the `mov r2, #1`, so the `ble` has the
same condition as the source. The last test in the chain has nothing left to
jump to, so it uses the inverted form again, and its `beq` branches past the
`mov`. The direction of the jump tells you which operator was written. Branches
that skip the `mov #1` come from `&&`, and branches that jump to it come from
`||`.

Your target has four tests in a row, and every comparison has an addition on one
side. Take one branch at a time, reverse it, and note which base register
supplied each operand.

## Your task

Write `func_08422910` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    s32 x;
    s32 y;
    s32 w;
    s32 h;
} Box;
```

<!-- solution -->
```c
s32 func_08422910(Box *a, Box *b)
{
    return a->x < b->x + b->w
        && b->x < a->x + a->w
        && a->y < b->y + b->h
        && b->y < a->y + a->h;
}
```
