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
  - There is no count anywhere. The data decides when to stop, so the C has a condition on the loaded value and nothing else.
  - "The same byte is fetched twice per trip, once in the test block at the bottom and once at the top of the body. Two loads mean two reads through the pointer in the source: one in the loop condition, one in the body."
  - A `u8 *` in, `s32` out. Add up the bytes until a zero byte appears, and step the pointer inside the body.
---

# Rotation, and the entry jump

A loop that tests first has a problem. The test needs to run before the first
trip and before every later trip, but the body sits between those points. gcc
solves this by rotating the loop. The test moves to the bottom and the body goes
on top. The function then enters the loop with an unconditional `b` that jumps
*into the middle*, straight to the test. This way the first pass is tested
before any of the body runs.

So an unconditional `b` near the top of a function, landing inside the loop, is
the sign of a rotated loop. Here is a string length function:

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

The loop top is 6 and the back-edge is at 14, so the loop covers 6 through 14.
The `b 8` at address 4 skips the counter increment on the way in, and sends the
first pass straight to the load. The entry branch of a rotated loop jumps *into*
the loop. A guard jumps *past* it. Check the destination and you can always tell
the two apart.

The C was `while (*s++) n++;`, and you can see where the `s++` was written. The
pointer advance at address 10 is in the test block, below the load, and the loop
top has only the counter increment. If you move the `s++` out of the condition
and into the body, the advance moves up past the load to sit next to that
increment. Each statement ends up in the block that matches where you wrote it.

This matters for your target, which loads from the same address twice per trip.
Here, each dereference in the source gets its own load. The loop condition reads
through the pointer, and the body reads through it again. gcc emits both loads
instead of keeping the first value in a register. Copying the byte into a local
inside the body does not merge them, because the condition is still a read.
Loops in real ROMs are full of these loads that look redundant. They are correct
output, and you should not try to optimize them away.

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
