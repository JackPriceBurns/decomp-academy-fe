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
  - "A register seeded with 0 before any work, a `mov #1` at the very bottom, and every failing branch aimed at the same address - that is a short-circuited `&&` chain producing a flag. Four branches out means four conditions."
  - Each test compares one box's edge against the other box's edge plus its extent. Offsets 0 and 8 are one axis, 4 and 12 are the other; watch which of the two pointers each `ldr` reads from.
  - '"Two `Box *` go in and an `s32` comes out. The source conditions use `<`, which the compiler inverted into `bge`, and the box that owns the bare coordinate is on the left of each comparison.'
---

# Four questions, one answer

Two axis-aligned rectangles overlap only if they overlap horizontally *and*
vertically, and each axis takes two comparisons - one for each box being to the
left of the other. Four tests, and the first one that fails settles it, which is
exactly what `&&` promises.

gcc 2.9 has a fixed skeleton for that. It seeds a register with 0 before any of
the work happens, tests each condition with its comparison **inverted** so a
failure branches forward, and puts a `mov rN, #1` at the bottom that only
executes if control fell all the way through. Every failure branch aims at the
same address, because the compiler merged the identical exits into one:

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

`r3` is the answer, set up before the first `cmp`. The source asked `v >= lo`,
so the escape is `blt`; it asked `v <= hi`, so the escape is `bgt`. Reading the
conditions off a listing means flipping every branch you see.

`||` builds the same pieces the other way round:

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

Here a *passing* test jumps straight to the `mov r2, #1`, so the `ble` carries
the condition the source wrote. The last test in the chain has nothing left to
skip to, so it goes back to the inverted form and its `beq` branches past the
`mov`. The direction of the jump tells you which operator was written: branches
away from the `mov #1` are `&&`, branches into it are `||`.

Your target is four tests deep, and every comparison has an addition on one
side of it. Take one branch at a time, flip it, and note which base register
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
