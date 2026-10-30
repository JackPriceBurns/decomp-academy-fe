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
  - The function uses two globals. One is read element by element. The other is
    read once before the loop starts, because nothing in the loop can change it.
  - "It takes no arguments and returns an `s32`. The countdown starts at 11, the accumulator is in `r2`, and `mul r0, r3` runs once per element."
---

# What gets hoisted, and what it costs

A pool load is always loop-invariant, because the address of a global never
changes. So the compiler moves it out of the loop, which is called hoisting.
Inside the loop, the compiler moves the base register forward each time instead
of computing the address again.

To move the pointer forward, the compiler uses the load/store-multiple
instructions. `ldmia rN!, {r0}` loads one word through `rN` and then adds four
to `rN`, all in one instruction. This is how the compiler does `*p++`. The
compiler also turns the loop counter into a countdown, because comparing
against zero is cheaper than comparing against a limit.

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

There is one pool word, loaded once at address 0. `r2` holds both the base from
the pool and the moving pointer. The body loads through it at offset zero, and
the `stmia r2!` stores the updated value and moves the pointer on. `r1` counts
5, 4, 3, ... down to 0, so the loop runs six times, even though the source
counted up from zero.

If you add a *second* global to the body of a loop like this, the loop needs
many more registers. The value of a global that the loop never writes is
loop-invariant too. So the compiler loads it once before the loop and keeps it
in a register the whole time. The function now needs registers for the
accumulator, the counter, the moving pointer, the hoisted value and a scratch
value for each element, and it runs out of low registers. The compiler then
uses `r4`, which is callee-saved. So a leaf function with no calls in it gets a
`push {r4, lr}` prologue and the three-instruction interworking epilogue.

If a function that calls nothing has a stack frame, that is a sign that
something in the loop was hoisted and there was no free register to keep it in.

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
