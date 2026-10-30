---
id: ea75f059-e9d6-442c-9379-41fd737bd8c4
slug: gba-hardware-poll
title: Waiting on the Hardware
difficulty: 4
concepts:
  - volatile
  - loops
  - hardware
hints:
  - "The test appears twice because gcc rotates the loop: one copy on the way
    in, and one at the bottom. Write a plain `while` with an empty body, and
    both copies appear by themselves."
  - "Nothing goes in and nothing comes out. The register is 0x04000004, and the
    loop keeps running while bit 0 of it is clear."
symbol: func_08370cf0
---

# The loop the compiler is not allowed to delete

A lot of GBA code waits for something: for the display to reach the bottom of
the screen, for a DMA channel to finish, or for a serial transfer to arrive.
Each wait is written as a `while` loop with an empty body. The loop reads a
register again and again until the bit it wants is set.

The simplest version compares the whole register against a constant:

```asm
0        ldr       r1, [pc, #8] (->12)
2      ~>ldrh      r0, [r1, #0]
4        cmp       r0, #159
6        bhi       2 ~>
8        bx        lr
10       .hword    0
12       .word     67108870
```

There are four instructions, and each one matters. The address load is outside
the loop. The `ldrh` is the loop head, marked by the `~>` in the gutter. The
branch at 6 goes back to 2, so the reload is inside the loop. Look closely at
`cmp #159`. The source compared against 160, and gcc lowered the constant by
one so that it could use an unsigned "higher than" test. A `cmp` against an
odd-looking boundary such as 159 or 239 usually means the C used the round
number one above it.

Now here is the same loop without `volatile`, testing a bit of the key
register:

```asm
0        ldr       r0, [pc, #16] (->20)
2        ldrh      r1, [r0, #0]
4        mov       r0, #8
6        and       r0, r1
8        cmp       r0, #0
10       bne       18 ~>
12       mov       r0, #0
14     ~>cmp       r0, #0
16       beq       14 ~>
18     ~>bx        lr
20       .word     67109168
```

Read the loop at 14. It compares a register holding zero against zero and
branches back to itself. There is no load in it. gcc read the key register
once and decided that nothing in the program can change the result. So it moved
the whole test out of the loop, which leaves an endless loop of two
instructions. This is the bug that `volatile` exists to prevent, and you can
see it in the instructions.

The listing also shows the shape gcc gives every one of these loops. The test
is emitted **twice**. The first copy comes before the loop as an entry guard
(offsets 2 to 10). It branches past the whole loop if the condition already
fails. The second copy is the loop body itself. This rotation is why a
three-line `while` turns into ten instructions.

If you put the qualifier back, the body gets its load back. The compiler then
keeps the mask constant in a spare register across the loop. On every iteration
it copies the mask into place instead of rebuilding it. This adds one more
instruction to the body than you might expect.

## Your task

Write `func_08370cf0` to reproduce the target assembly.

<!-- solution -->
```c
void func_08370cf0(void)
{
    while ((*(vu16 *)0x04000004 & 1) == 0)
        ;
}
```
