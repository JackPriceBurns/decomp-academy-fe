---
id: 5fd3c9b9-4de9-478e-8718-19fa02a7ebf7
slug: gba-optimizer-capstone
title: "Capstone: Writing For the Optimizer"
difficulty: 5
concepts:
  - optimizer
  - loops
  - globals
symbol: func_083e942c
hints:
  - The `mul` result stays in `r2` from address 22 until the `add r0, r2, r0`
    at 34, which adds it to a value computed from itself. Give it a name once,
    and use that name twice in one expression.
  - "`extern s32 gGain;` is declared for you. The function takes two parameters
    and returns an `s32`. The first is a pointer to signed halfwords that moves
    forward, and the second is a count. The divisor is 8, and it is a signed
    `/` rather than a shift."
---

# Several passes in one loop

Each pass in this chapter is predictable on its own. Constants fold, loop
invariants are hoisted, multiplies become adds and shared endings merge. What
you cannot predict is what happens when two passes act on the same loop. In
that case you write a candidate, compile it, read the listing and adjust.

Here is a loop that halves every element of an array twice and adds a global.
First, written with a shift:

```asm
0        mov       r2, r0
2        cmp       r1, #0
4        ble       28 ~>
6        ldr       r0, [pc, #24] (->32)
8        ldr       r3, [r0, #0]
10     ~>ldrh      r0, [r2, #0]
12       lsl       r0, #16
14       asr       r0, #18
16       add       r0, r3, r0
18       strh      r0, [r2, #0]
20       add       r2, #2
22       sub       r1, #1
24       cmp       r1, #0
26       bne       10 ~>
28     ~>bx        lr
30       .hword    0
32       .word     gShift
```

This is seventeen rows with no stack frame. The pool word is loaded at 6 and the
global is dereferenced at 8, and both are above the loop. The signed halfword is
read with a plain `ldrh`. A pair of shifts then sign-extends it, and the same
pair also does the `>> 2`. That is why the second shift is `asr #18` instead of
`asr #16`.

Now the same loop with `>> 2` written as `/ 4`:

```asm
0        push      {r4, lr}
2        cmp       r1, #0
4        ble       38 ~>
6        ldr       r4, [pc, #36] (->44)
8        mov       r2, r0
10       mov       r3, r1
12     ~>mov       r0, #0
14       ldrsh     r1, [r2, r0]
16       cmp       r1, #0
18       bge       22 ~>
20       add       r1, #3
22     ~>asr       r1, #2
24       ldr       r0, [r4, #0]
26       add       r0, r1
28       strh      r0, [r2, #0]
30       add       r2, #2
32       sub       r3, #1
34       cmp       r3, #0
36       bne       12 ~>
38     ~>pop       {r4}
40       pop       {r0}
42       bx        r0
44       .word     gShift
```

This is twenty-three rows and a callee-saved register, for a change that only
affects the result for negative inputs. The rounding correction adds a
conditional branch, and the branch costs a register. The extra register
pressure pushes the load into the `ldrsh` form, which needs its own index
register holding zero. That `mov r0, #0` is rebuilt at the top of every trip,
even though it never changes.

The important part is at address 24. The global's **dereference** was not
hoisted. Its address was: `ldr r4, [pc, #36]` is in the preheader at 6, in the
same place as in the shift version. Only the `ldr r0, [r4, #0]` stayed in the
loop, and it now runs once per element.

Neither the store nor the branch causes this on its own. The shift version
stores to memory every trip and still hoists the load. A loop with the same
rounding branch but no store hoists it too. gcc 2.9's invariant motion leaves
the value load in the loop only when the body has a store *and* a branch. You
cannot work this out by reasoning about the source. You find it by compiling
and comparing.

Your target has the branch but no store, so its dereference is where the shift
version put it. What is left to work out is the arithmetic. Count the
instructions that read the multiply's result. Also find the loop-invariant
register that is rebuilt every trip anyway.

## Your task

Write `func_083e942c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gGain;
```

<!-- solution -->
```c
s32 func_083e942c(s16 *src, s32 n) {
    s32 sum = 0;
    s32 i;
    for (i = 0; i < n; i++) {
        s32 v = src[i] * gGain;
        sum += v + v / 8;
    }
    return sum;
}
```
