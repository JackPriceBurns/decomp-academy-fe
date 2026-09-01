---
id: 72d78e72-0e0a-4531-b914-8086ea5b288d
slug: gba-loops-capstone-scan
title: "Capstone: The Scan"
difficulty: 5
concepts:
  - loops
  - control-flow
  - arrays
hints:
  - Three tests per trip - the counter against the bound, an element against zero
    to leave, and an element against zero again to decide whether it counts. The
    `b` at address 12 says the leaving test was written at the top of the body.
  - The two loads are the same address. The sentinel test is a read of its own,
    down in the rotated test block; the other reads collapsed into the load at
    the top of the body.
  - An `s32 *` and an `s32` count in, `s32` out - walk at most n elements, stop
    dead on a zero, and add up only the ones greater than zero.
symbol: func_081adc2c
---

# Everything at once

This is the shape real GBA code is full of: a bounded walk that also stops on a
sentinel, with a filter on what counts. Every piece of it is something you have
already matched, and the difficulty is entirely in taking the listing apart in
the right order.

Here is a smaller version of the same idea — a byte walk with a sentinel and a
filter:

```asm
0        mov       r2, #0
2        b         12 ~>
4      ~>cmp       r1, #32
6        bne       10 ~>
8        add       r2, #1
10     ~>add       r0, #1
12     ~>ldrb      r1, [r0, #0]
14       cmp       r1, #0
16       bne       4 ~>
18       mov       r0, r2
20       bx        lr
```

Take it apart in this order, and use the same order on anything else:

1. **Find the back-edge.** `bne 4` at 16. The loop is 4 through 16.
2. **Classify the entry branch.** `b 12` lands *inside* that range, so it is a
   rotation. The loop's test was written above the body in the source and gcc
   moved it to the bottom.
3. **Find the exits.** Only one: falling out of the `bne` at 16 into 18. One way
   out means one condition in the source.
4. **Split the body at the merge point.** `bne 10` at 6 skips address 8, so the
   increment is the conditional part and `add r0, #1` is unconditional.
5. **Read the stride.** `#1`, so bytes, matching the `ldrb`.

That gives the whole source: while the byte is nonzero, count it if it equals
32, then step. Note the loaded byte is still in r1 when the compare at 4 runs —
the test block's load served the body too, so there is one load per trip here.

Your target is the same skeleton with two differences, and both of them are
things you have seen. It is a *counted* loop as well as a sentinel one, so the
counter and the bound are live alongside the cursor and the accumulator, and
that is why it pushes. And it loads the same address twice: the sentinel test is
a read of its own, sitting in the rotated test block at the bottom, while the
reads inside the body collapsed into the single load at the top. Work out which
comparison belongs to which exit before you write anything.

## Your task

Write `func_081adc2c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081adc2c(s32 *a, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++) {
        if (a[i] == 0)
            break;
        if (a[i] > 0)
            t += a[i];
    }
    return t;
}
```
