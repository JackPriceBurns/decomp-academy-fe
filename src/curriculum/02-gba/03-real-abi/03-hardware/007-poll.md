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
  - The test appears twice because gcc rotates the loop — once on the way in,
    once at the bottom. Write the plain `while` with an empty body and both
    copies appear on their own.
  - "Nothing in, nothing out. The register is 0x04000004 and the loop spins
    while bit 0 of it is clear."
symbol: func_08370cf0
---

# The loop the compiler is forbidden to delete

Half of GBA code is waiting: for the display to reach the bottom of the screen,
for a DMA channel to finish, for a serial transfer to arrive. All of it is
written as a `while` loop with an empty body that re-reads a register until the
bit it wants shows up.

The simplest possible version compares the whole register against a constant:

```asm
0        ldr       r1, [pc, #8] (->12)
2      ~>ldrh      r0, [r1, #0]
4        cmp       r0, #159
6        bhi       2 ~>
8        bx        lr
10       .hword    0
12       .word     67108870
```

Four instructions, and every one of them matters. The address load sits outside
the loop; the `ldrh` is the loop head, marked by the `~>` in the gutter; and the
branch at 6 goes back to 2, so the reload is inside. `cmp #159` is worth a
second look: the source compared against 160, and gcc folded the constant down
by one so it could use an unsigned "higher than" test. A `cmp` against an
odd-looking boundary like 159 or 239 usually means the C wrote the round number
one above it.

Now the same loop without `volatile`, testing a bit of the key register:

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

Read the loop at 14: it compares a register holding zero against zero and
branches back to itself. There is no load in it. gcc read the key register once,
proved to itself that nothing in the program can change the result, and hoisted
the whole test out — leaving a two-instruction hang. This is the bug `volatile`
exists to prevent, and it is sitting right there in the instruction stream.

The other thing this listing shows is the shape gcc gives every one of these
loops. The test is emitted **twice**: once before the loop as an entry guard
(offsets 2 to 10, branching past the whole thing if the condition already
fails), and once as the loop body proper. That rotation is why a three-line
`while` turns into ten instructions.

Put the qualifier back and the body regains its load. The compiler then keeps
the mask constant alive in a spare register across the loop and copies it into
place on every iteration rather than rebuilding it, which adds one more
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
