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
  - There are three tests per trip. One compares the counter against the bound.
    One compares an element against zero to leave the loop. One compares an
    element against zero again to decide whether it counts. The `b` at address
    12 shows that the leaving test was written at the top of the body.
  - The two loads read the same address. The sentinel test is a separate read,
    down in the rotated test block. The other reads were merged into the load
    at the top of the body.
  - An `s32 *` and an `s32` count in, `s32` out. Walk at most n elements, stop as
    soon as you reach a zero, and add up only the elements greater than zero.
symbol: func_081adc2c
---

# Everything at once

Real GBA code is full of this shape. It is a walk with a bound that also stops
at a sentinel (a special value that marks the end of the data), and it has a
filter on which elements count. You have already matched every piece of it. The
hard part is taking the listing apart in the right order.

Here is a smaller version of the same idea, a walk over bytes with a sentinel
and a filter:

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

Take it apart in this order. Use the same order on any other loop:

1. **Find the back-edge.** It is `bne 4` at 16, so the loop is 4 through 16.
2. **Classify the entry branch.** `b 12` lands *inside* that range, so the loop
   is rotated. The loop's test was written above the body in the source, and
   gcc moved it to the bottom.
3. **Find the exits.** There is only one: falling through the `bne` at 16
   into 18. One way out means one condition in the source.
4. **Split the body at the merge point.** `bne 10` at 6 skips address 8, so the
   increment is the conditional part, and `add r0, #1` always runs.
5. **Read the stride.** It is `#1`, so the elements are bytes, which matches the
   `ldrb`.

That gives the whole source: while the byte is not zero, count it if it equals
32, then step to the next byte. Note that the loaded byte is still in r1 when
the compare at 4 runs. The load in the test block served the body too, so there
is one load per trip here.

Your target has the same structure with two differences, and you have seen both
before. It is a *counted* loop as well as a sentinel loop. So the counter and
the bound are live together with the cursor and the accumulator, and that is
why it pushes. It also loads the same address twice. The sentinel test is a
separate read in the rotated test block at the bottom. The reads inside the body
were merged into the single load at the top. Work out which comparison belongs
to which exit before you write anything.

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
