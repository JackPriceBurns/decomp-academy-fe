---
id: 9f51851a-f1ea-4ebd-9696-394450006a25
slug: gba-abi-capstone
title: "Capstone: A Frame That Earns It"
difficulty: 5
concepts:
  - abi
  - frames
  - loops
symbol: func_083177e0
hints:
  - The running total is the value in the frame slot — it is read and written
    every trip because its address is handed out after the loop finishes.
  - An `s32 *` and an `s32` in, an `s32` out. The loop adds `weigh` of each
    element to a local total, then that total's address and the count go to
    `report` before it is returned.
---

# Everything at once

This target uses most of the chapter. A loop, a call inside it, values that have
to survive both, a frame, and a pointer into that frame. Work through it in
layers rather than top to bottom.

Start with the register layer. A call in a loop body means every loop-carried
value — the cursor, the trip count, the accumulator — is live across a `bl`, so
all of them move into `r4`-`r7` before the loop starts. That is why a loop with a
call in it has a push list and a loop without one usually does not:

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

Four saved registers for four live values: the limit in `r5`, an argument that
never changes in `r7`, the accumulator in `r6`, the counter in `r4`. The guard at
10-12 is the `for` condition tested once before entry, the back-edge at 26-28 is
the same condition tested again, and `r0` and `r1` are rebuilt from the saved
copies on every single trip because the call destroys them.

Now add the frame layer, and this is where the surprise is. You saw earlier in
this chapter that a local whose address escapes stops living in a register — the
memory slot becomes authoritative and the value has to be re-read after any
call. Put such a
local inside a loop and the cost is charged *per trip*: the accumulator can no
longer be an `add` into a saved register, it becomes a load, an add, and a store,
every iteration, for a pointer that is not used until after the loop is over. gcc
does not sink the store or hoist the load out of the loop.

That is what the extra `sub sp, #4` in your target is paying for, and it is worth
seeing once, because it is the single clearest demonstration on this machine of
why taking an address is never free.

The loop itself is the shape you already know from the loops chapter: a guard
before the body, a `ldmia rN!, {r0}` walking the array one word at a time, and a
counter rewritten to count down to zero because testing against zero is free.
The example above counts up instead, and the reason is visible in its listing at
address 14 — its counter is also one of the call's arguments, so gcc has to keep
the real value of `i` around.

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
