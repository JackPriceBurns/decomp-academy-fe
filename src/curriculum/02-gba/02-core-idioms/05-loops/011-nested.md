---
id: a32831da-78f8-4d57-a224-84eb1ff7a1be
slug: gba-loops-nested
title: A Loop Inside a Loop
difficulty: 4
concepts:
  - loops
  - control-flow
  - strength-reduction
hints:
  - Two backward branches mean two loops. The one whose destination is further
    down the listing is the inner loop, and it sits entirely inside the outer
    loop's body.
  - The inner loop counts r1 down to zero, and the outer latch restores r1 from
    the `+1` computed before the inner loop ran. So the inner trip count is
    whatever the outer counter held on entry.
  - One `s32` in, `s32` out. The inner bound is the outer counter, and the body
    only adds one to a total, so the answer counts the pairs below the diagonal.
symbol: func_0819be5c
---

# Two back-edges

Nested loops do not get a special shape. Each loop is built exactly as it would
be on its own, with its own guard, body and back-edge. The inner loop sits
inside the outer loop's body. This gives a reading rule. Of two backward
branches, the one whose destination is *later* in the listing belongs to the
inner loop. Everything from the outer destination to the outer back-edge is one
outer trip.

Here is a pair of counted loops, one inside the other, that adds up the inner
counter:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r0, #0
6        mov       r3, #0
8        cmp       r0, r4
10       bge       32 ~>
12     ~>mov       r2, #0
14       add       r3, #1
16       cmp       r2, r1
18       bge       28 ~>
20     ~>add       r0, r2
22       add       r2, #1
24       cmp       r2, r1
26       blt       20 ~>
28     ~>cmp       r3, r4
30       blt       12 ~>
32     ~>pop       {r4}
34       pop       {r1}
36       bx        r1
```

There are two back-edges: `blt 20` at 26 and `blt 12` at 30. The inner loop is
20 to 26, and the outer loop is 12 to 30. Both guards are present. Address 10
skips both loops, and address 18 skips only the inner loop. The inner guard is
tested again on every outer trip, because the bound could be anything.

Be careful with address 14. `add r3, #1` increments the outer counter at the
*top* of the outer body, before the inner loop runs. Doing this early leaves the
inner loop free to use the low registers as it needs. It also leaves the outer
latch at 28 (the test at the bottom of the outer loop) with only a compare to
do. A `+1` above an inner loop is the outer counter being computed early. It is
not part of the body.

Your target goes one step further, so read this part slowly. Its outer counter
register is *used up* by the inner loop's countdown. The outer latch then
reloads it from a register that was set before the inner loop. Work out what
that register holds and you will have the inner loop's trip count. That trip
count gives you the whole shape of the source.

## Your task

Write `func_0819be5c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0819be5c(s32 n) {
    s32 i, j;
    s32 t = 0;
    for (i = 0; i < n; i++)
        for (j = 0; j < i; j++)
            t++;
    return t;
}
```
