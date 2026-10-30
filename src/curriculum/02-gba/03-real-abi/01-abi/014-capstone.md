---
id: 9f51851a-f1ea-4ebd-9696-394450006a25
slug: gba-abi-capstone
title: "Capstone: A Loop That Needs a Frame"
difficulty: 5
concepts:
  - abi
  - frames
  - loops
symbol: func_083177e0
hints:
  - The running total is the value in the frame slot. It is read and written on
    every iteration, because its address is passed to another function after
    the loop finishes.
  - The function takes an `s32 *` and an `s32`, and returns an `s32`. The loop
    adds `weigh` of each element to a local total. Then the total's address and
    the count go to `report`, and the total is returned.
---

# Everything at once

This target uses most of what this chapter covers: a loop, a call inside the
loop, values that must survive both, a frame, and a pointer into that frame.
Work through it one layer at a time, instead of from top to bottom.

Start with the registers. When a loop body contains a call, every value carried
from one iteration to the next is live across a `bl`. Here those values are the
cursor, the trip count and the accumulator (the running total). So all of them
move into `r4` to `r7` before the loop starts. That is why a loop with a call in
it has a push list, and a loop without a call usually does not:

```asm
0        push      {r4, r5, r6, r7, lr}
2        mov       r5, r0
4        mov       r7, r1
6        mov       r6, #0
8        mov       r4, #0
10       cmp       r6, r5
12       bge       30 ~>
14     ~>mov       r0, r4
16       mov       r1, r7
18       bl        rateOf-4
22       add       r6, r0
24       add       r4, #1
26       cmp       r4, r5
28       blt       14 ~>
30     ~>mov       r0, r6
32       pop       {r4, r5, r6, r7}
34       pop       {r1}
36       bx        r1
```

There are four saved registers for four live values: the limit in `r5`, an
argument that never changes in `r7`, the accumulator in `r6`, and the counter
in `r4`. The guard at 10-12 is the `for` condition, tested once before the loop
starts. The back-edge at 26-28 tests the same condition again. `r0` and `r1`
are rebuilt from the saved copies on every iteration, because the call destroys
them.

Now add the frame. Earlier in this chapter you saw that once a local's address
is given to another function, the local no longer lives in a register. The
memory slot becomes the only reliable copy, and the value must be read again
after any call. If such a local is used inside a loop, you pay that cost *on
every iteration*. The accumulator can no longer be an `add` into a saved
register. Instead, every iteration does a load, an add and a store, for a
pointer that is not used until the loop is over. gcc does not move the store
after the loop or the load before it.

That is the reason for the extra `sub sp, #4` in your target. It is worth
seeing once, because it shows clearly why taking an address always has a cost.

The loop itself has the shape you know from the loops chapter. There is a guard
before the body, a `ldmia rN!, {r0}` that walks the array one word at a time,
and a counter that gcc rewrites to count down to zero, because testing against
zero costs nothing extra. The example above counts up instead. You can see the
reason at address 14 in its listing: its counter is also one of the call's
arguments, so gcc has to keep the real value of `i`.

## Your task

`extern s32 weigh(s32 v);` and `extern void report(s32 *slot, s32 n);` are
declared for you. Write `func_083177e0` to reproduce the target assembly.

<!-- context -->
```c
extern s32 weigh(s32 v);
extern void report(s32 *slot, s32 n);
```

<!-- solution -->
```c
s32 func_083177e0(s32 *arr, s32 n) {
    s32 t = 0;
    s32 i;
    for (i = 0; i < n; i++) {
        t += weigh(arr[i]);
    }
    report(&t, n);
    return t;
}
```
