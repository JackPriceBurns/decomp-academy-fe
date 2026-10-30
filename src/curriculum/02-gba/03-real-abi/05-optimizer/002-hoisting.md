---
id: 0a362a33-3bf0-4557-a904-660a92ceabf9
slug: gba-optimizer-hoisting
title: Work Moved Out of the Loop
difficulty: 4
concepts:
  - optimizer
  - loops
  - globals
symbol: func_083bc9a4
hints:
  - The pool load and the dereference sit between the guard and the loop body,
    so they run once. Write the global read inside the loop anyway, because
    that is where the C put it.
  - "`extern s32 gGain;` is declared for you. The function takes two parameters
    and returns an `s32`. The first is a pointer that `ldmia` walks through,
    and the second is the trip count."
---

# The compiler moves your work above the loop

Some expressions inside a loop use inputs that never change while the loop
runs. gcc 2.9 does not repeat these on every trip. A pass called loop-invariant
code motion finds them and emits them once, in a block the compiler creates
between the loop guard and the loop body. That block is called the preheader.

You can see this pass clearly on the GBA, because reading a global takes more
than one instruction. A pool load gets the address, and then a dereference gets
the value. The C puts that pair inside the loop, so it looks as if it should
run every trip. After hoisting, it appears exactly once, above the back edge.
The pool word itself stays at the bottom of the function.

Look at where the hoisted code is placed. gcc rotates a counted loop so the
guard comes first. The preheader sits on the guard's fall-through path, which
is the path taken when the loop will run at least once. When the trip count is
zero, the guard branches past everything, including the hoisted work. That
placement is how you recognise hoisted code: instructions that run once,
between a guard branch and a back-edge target.

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

The whole right-hand side has moved above the loop: the two pool loads at 10
and 12, the two dereferences at 14 and 16, and the `add` at 18. The loop body
only has to store the same register every trip with `stmia r0!, {r2}`, and
count down. The C has `dst[i] = gBase + gStep;` inside the loop, but the
machine reads both globals once.

The two `mov`s at 20 and 22 copy the base pointer and the count into the
registers that the body is about to change. `r0` walks forward through the
array and `r1` counts down. The original values stay in `r4` and `r3`.

Your target adds to a running total instead of storing, and the invariant it
hoists is a single global. Count the instructions between the guard and the
back-edge label, and you will find the hoisted work there.

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
