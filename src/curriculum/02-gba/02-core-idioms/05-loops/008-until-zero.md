---
id: 44e003d1-c70d-4546-9e3e-15fe92f90d0f
slug: gba-loops-until-zero
title: Walking Until a Zero
difficulty: 4
concepts:
  - loops
  - control-flow
  - arrays
symbol: func_0818e800
hints:
  - There is no count anywhere - the data decides when to stop, so the C has a condition on the loaded value and nothing else.
  - "The same byte is fetched twice per trip, once in the test block at the bottom and once at the top of the body. Two loads means two reads through the pointer in the source: one in the loop condition, one in the body."
  - A `u8 *` in, `s32` out - add up the bytes until a zero one appears, stepping the pointer inside the body.
---

# Rotation, and the entry jump

A loop whose test comes first has a problem: the test needs to run before the
first trip and before every later trip, but the body sits between them. gcc
solves it by rotating the loop. The test moves to the bottom, the body goes on
top, and the function enters with an unconditional `b` that jumps *into the
middle* — straight to the test — so the first pass is tested before any body
runs.

An unconditional `b` near the top of a function, landing inside the loop, is the
fingerprint. Here is a string length:

```asm
0        mov       r1, r0
2        mov       r2, #0
4        b         8 ~>
6      ~>add       r2, #1
8      ~>ldrb      r0, [r1, #0]
10       add       r1, #1
12       cmp       r0, #0
14       bne       6 ~>
16       mov       r0, r2
18       bx        lr
```

The loop top is 6 and the back-edge is at 14, so the loop's own range is 6
through 14. The `b 8` at address 4 skips the counter increment on the way in and
drops the first pass directly onto the load. The entry branch of a rotated loop
jumps *into* the loop; a guard jumps *past* it. Check the destination and you
can always tell the two apart.

The C was `while (*s++) n++;`, and the placement of the `s++` shows: the pointer
advance at address 10 sits in the test block, below the load, and the loop top
has only the counter increment. Move the `s++` out of the condition and into the
body and the advance crosses the load to sit beside that increment instead.
Which block each statement lands in is decided by where you wrote it.

That matters for your target, which loads from the same address twice per trip.
Each source-level dereference gets its own load here: the loop condition reads
through the pointer, the body reads through it again, and gcc issues both rather
than keeping the first value in a register. Copying the byte into a local inside
the body does not merge them, because the condition is still a read. Loops in
real ROMs are full of these apparently redundant loads and they are correct
output, not something to optimize away.

## Your task

Write `func_0818e800` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0818e800(u8 *s) {
    s32 t = 0;
    while (*s) {
        t += *s;
        s++;
    }
    return t;
}
```
