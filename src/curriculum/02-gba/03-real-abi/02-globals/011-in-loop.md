---
id: 82d4b9d2-a738-4393-baa3-7e8c7878a757
slug: gba-globals-in-loop
title: A Global Inside a Loop
difficulty: 5
concepts:
  - globals
  - loops
  - registers
symbol: func_083489dc
hints:
  - Two globals are in play - one is walked element by element, the other is
    read once before the loop starts because nothing in the loop can change it.
  - "Nothing in, an `s32` out. The countdown starts at 11, the accumulator lives in r2, and `mul r0, r3` happens once per element."
---

# What gets hoisted, and what it costs

A pool load is loop-invariant by construction: the address of a global never
changes. So it is lifted out of the loop, and inside the loop the base register
is walked forward instead of being recomputed.

Walking is done with the load/store-multiple instructions. `ldmia rN!, {r0}`
loads one word through `rN` and post-increments `rN` by four in the same
instruction — the compiler's `*p++`. The loop counter is reversed into a
countdown at the same time, because comparing against zero is cheaper than
comparing against a limit.

`bumpLane` adds three to every element of a global array:

```asm
0        ldr       r2, [pc, #16] (->20)
2        mov       r1, #5
4      ~>ldr       r0, [r2, #0]
6        add       r0, #3
8        stmia     r2!, {r0}
10       sub       r1, #1
12       cmp       r1, #0
14       bge       4 ~>
16       bx        lr
18       .hword    0
20       .word     gLane
```

One pool word, fetched once at address 0. `r2` is both the pool base and the
walking pointer: the body loads through it at offset zero, and the `stmia r2!`
stores the updated value and steps the pointer on. `r1` counts 5, 4, 3, ... down
to 0, and the loop runs six times even though the source counted upwards from
zero.

Add a *second* global to the body of a loop like this and the register bill goes
up sharply. The value of a global the loop never writes is loop-invariant too,
so it gets loaded once before the loop and pinned in a register for the
duration — and between the accumulator, the counter, the walking pointer, the
hoisted value and a scratch register for each element, the function runs out of
low registers. The compiler reaches for `r4`, which is callee-saved, so a leaf
function with no calls in it grows a `push {r4, lr}` prologue and the
three-instruction interworking epilogue.

Seeing a frame in a function that calls nothing is the signal: something in the
loop was hoisted and had nowhere to live.

## Your task

Write `func_083489dc` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gSamples[12];
extern s32 gGain;
```

<!-- solution -->
```c
s32 func_083489dc(void) {
    s32 i;
    s32 s = 0;
    for (i = 0; i < 12; i++) {
        s += gSamples[i] * gGain;
    }
    return s;
}
```
