---
id: 0a362a33-3bf0-4557-a904-660a92ceabf9
slug: gba-optimizer-hoisting
title: Lifted Out of the Loop
difficulty: 4
concepts:
  - optimizer
  - loops
  - globals
symbol: func_083bc9a4
hints:
  - The pool load and the dereference sit between the guard and the body, so
    they run once. Write the global read inside the loop anyway - that is
    where the C put it.
  - "`extern s32 gGain;` is declared for you. Two parameters in, an `s32` out:
    a pointer walked by `ldmia` and the trip count."
---

# The compiler moves your work above the loop

A computation whose inputs never change inside a loop does not belong inside
the loop, and gcc 2.9 knows it. Loop-invariant code motion finds those
expressions and emits them once, in a block the compiler creates between the
loop guard and the loop body — the preheader.

On the GBA this transformation is unusually visible, because reading a global
is not one instruction. It is a pool load to get the address and then a
dereference to get the value. Written inside a loop, that pair looks like it
should run every trip; hoisted, it appears exactly once, above the back edge,
with the pool word still parked at the bottom of the function.

Watch where the hoisted code lands. gcc rotates a counted loop so the guard
comes first, and the preheader sits on the guard's fall-through path — the
path taken when the loop will run at least once. A zero trip count branches
straight past everything, hoisted work included. That placement is the
giveaway: instructions that run once, sitting between a guard branch and a
back-edge target.

Here is `fillRow`, which writes `gBase + gStep` into every slot of an array:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r3, r1
6        cmp       r3, #0
8        ble       32 ~>
10       ldr       r0, [pc, #28] (->40)
12       ldr       r1, [pc, #28] (->44)
14       ldr       r2, [r0, #0]
16       ldr       r0, [r1, #0]
18       add       r2, r0
20       mov       r0, r4
22       mov       r1, r3
24     ~>stmia     r0!, {r2}
26       sub       r1, #1
28       cmp       r1, #0
30       bne       24 ~>
32     ~>pop       {r4}
34       pop       {r0}
36       bx        r0
38       .hword    0
40       .word     gBase
44       .word     gStep
```

The whole right-hand side — two pool loads at 10 and 12, two dereferences at
14 and 16, and the `add` at 18 — has moved above the loop. All the body has
left to do is store the same register every trip with `stmia r0!, {r2}` and
count down. The C says `dst[i] = gBase + gStep;` inside the loop; the machine
reads both globals once.

The two `mov`s at 20 and 22 copy the base pointer and the count into the
registers the body is about to destroy — `r0` walks forward through the array
and `r1` counts down — leaving the originals in `r4` and `r3`.

Your target runs an accumulation instead of a store, and the invariant it lifts
is a single global. Count the instructions between the guard and the back-edge
label and you will find them there.

## Your task

Write `func_083bc9a4` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gGain;
```

<!-- solution -->
```c
s32 func_083bc9a4(s32 *p, s32 n) {
    s32 sum = 0;
    s32 i;
    for (i = 0; i < n; i++) sum += p[i] * gGain;
    return sum;
}
```
