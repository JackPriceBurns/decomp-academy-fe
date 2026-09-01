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
  - The pointer walks forward by 2 each iteration and the element load is
    `ldrh`, yet the function closes with `asr`. The running total is what is
    narrow, not only the return.
  - "An `s16 *` and an `s32` count, returning `s16`, with an `s16` running total
    starting at zero and a plain ascending `for` loop over the elements."
---

# Paying the width on every iteration

A narrow variable inside a loop is charged for its width once per trip. The
truncation cannot be hoisted anywhere, because each iteration has to see the
wrapped value the previous one produced, so whatever a narrow assignment costs
gets multiplied by the trip count.

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

Four instructions of that loop body are the width. Addresses 18 and 20 extend
the running total, address 22 does the actual subtraction, and addresses 24 and
26 truncate the result back into a byte for the next trip. The closing pair at
34 and 36 extends it one last time for the return.

Two details in there repay a close look.

The element load is a bare `ldrb`, with no sign extension after it, even though
it is reading through an `s8 *`. Only the low eight bits of the sum survive the
truncation at the end of the body, and the loaded element's upper bits cannot
influence them, so gcc drops the extension it would otherwise have emitted.
`ldrb` and `ldrh` in a loop like this tell you nothing about the element's
signedness.

The extension at 18 and 20 is dead. It sign-extends a value whose low eight bits
are all the truncation at 24 keeps, so it cannot change the result. gcc 2.9
emits it anyway when the accumulator is signed, and matching means reproducing
it. Widen the total to an `s32` and the shifts swap ends: the element picks up
an `lsl #24` / `asr #24` of its own straight after the load, and the truncation
at the bottom of the body disappears.

Your target pays the same tax at sixteen bits, and its pointer walk looks
different: gcc strength-reduces a halfword loop into an incrementing pointer and
leaves a byte loop indexed. Write the loop the natural way and let the compiler
do that part.

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
