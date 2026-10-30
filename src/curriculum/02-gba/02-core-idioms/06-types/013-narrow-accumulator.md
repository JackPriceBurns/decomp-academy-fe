---
id: 0c47e41b-917d-4e56-b5b8-d1b2e097953e
slug: gba-types-narrow-accumulator
title: An s16 That Keeps Truncating
difficulty: 4
concepts:
  - narrow-types
  - loops
  - promotion
symbol: func_081e7d10
hints:
  - The pointer moves forward by 2 each iteration and the element load is
    `ldrh`, but the function ends with `asr`. The return value is narrow, and so
    is the running total.
  - "The arguments are an `s16 *` and an `s32` count, and the function returns
    `s16`. It keeps an `s16` running total that starts at zero, and uses a plain
    ascending `for` loop over the elements."
---

# The width costs instructions on every iteration

A narrow variable inside a loop costs extra instructions on every iteration.
The truncation cannot be moved out of the loop, because each iteration has to
use the wrapped value that the previous one produced. So the cost of a narrow
assignment is multiplied by the number of iterations.

Here is a running total held in an `s8`:

```asm
0        push      {r4, r5, lr}
2        mov       r5, r0
4        mov       r4, r1
6        mov       r3, #0
8        mov       r2, #0
10       cmp       r3, r4
12       bge       34 ~>
14     ~>add       r0, r5, r2
16       ldrb      r1, [r0, #0]
18       lsl       r0, r3, #24
20       asr       r0, #24
22       sub       r0, r1
24       lsl       r0, #24
26       lsr       r3, r0, #24
28       add       r2, #1
30       cmp       r2, r4
32       blt       14 ~>
34     ~>lsl       r0, r3, #24
36       asr       r0, #24
38       pop       {r4, r5}
40       pop       {r1}
42       bx        r1
```

Four instructions in that loop body are there only because of the width.
Addresses 18 and 20 extend the running total, address 22 does the actual
subtraction, and addresses 24 and 26 truncate the result back to a byte for the
next iteration. The final pair at 34 and 36 extends it one last time for the
return.

Two details in this code are worth a closer look.

The element load is a plain `ldrb` with no sign extension after it, even though
it reads through an `s8 *`. The truncation at the end of the body keeps only
the low eight bits of the result, and the upper bits of the loaded element
cannot affect them. So gcc leaves out the extension it would otherwise emit. In
a loop like this, `ldrb` and `ldrh` tell you nothing about the element's
signedness.

The extension at 18 and 20 has no effect. It sign-extends a value, but the
truncation at 24 keeps only the low eight bits, so the extension cannot change
the result. gcc 2.9 still emits it when the accumulator is signed, and to match
you have to reproduce it. If you widen the total to an `s32`, the shifts move to
the other end. The element gets its own `lsl #24` / `asr #24` straight after the
load, and the truncation at the bottom of the body disappears.

Your target pays the same cost at sixteen bits, and the way it steps through
memory looks different. gcc turns a halfword loop into a pointer that is
incremented each iteration (this is called strength reduction), but it leaves a
byte loop indexed. Write the loop in the normal way and leave that part to the
compiler.

## Your task

Write `func_081e7d10` to reproduce the target assembly.

<!-- solution -->
```c
s16 func_081e7d10(s16 *p, s32 n) {
    s16 t = 0;
    s32 i;
    for (i = 0; i < n; i++) t += p[i];
    return t;
}
```
