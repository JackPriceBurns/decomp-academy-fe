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
  - The `mul` result stays in `r2` from address 22 all the way to the
    `add r0, r2, r0` at 34, which adds it to something derived from itself.
    Give it a name once and use that name twice in one expression.
  - "`extern s32 gGain;` is declared for you. Two parameters, an `s32` out: a
    pointer to signed halfwords walked forwards, and a count. The divisor is 8
    and it is a signed `/`, not a shift."
---

# Everything at once

Each pass in this chapter is predictable on its own. Constants fold, invariants
lift, multiplies become adds, tails merge. What you cannot predict is what
happens when two of them meet in the same loop. There you write a candidate,
compile it, read the listing and adjust.

Here is a loop that halves every element of an array twice over and adds a
global. Written with a shift:

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

Seventeen rows, no stack frame. The pool word is loaded at 6, the global is
dereferenced at 8, and both sit above the loop. The signed halfword is read
with a plain `ldrh` and sign-extended by a shift pair that also absorbs the
`>> 2`, which is why the second shift is `asr #18` rather than `asr #16`.

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

Twenty-three rows and a callee-saved register, for a change that alters the
result only for negative inputs. The rounding correction brings a conditional
branch, the branch costs a register, the extra pressure pushes the load into the
`ldrsh` form that needs its own zero index register — and that `mov r0, #0` is
rebuilt at the top of every trip even though it never changes.

The part worth remembering is at address 24. The global's **dereference** did
not get hoisted. Its address did: `ldr r4, [pc, #36]` is up in the preheader at
6, exactly where the shift version put it. Only the `ldr r0, [r4, #0]` stayed
behind, and it now runs once per element.

Neither ingredient causes that alone. The shift version stores to memory every
trip and hoists anyway, and a loop carrying the same rounding branch without a
store hoists too. It takes a store *and* a branch in the same body before gcc
2.9's invariant motion leaves the value load behind, and no amount of reasoning
about the source gets you there — you find it by compiling and comparing.

Your target has the branch and no store, so its dereference sits where the
shift version put it. What is left to work out is the arithmetic: count the
readers of the multiply's result, and find the loop-invariant register that is
rebuilt every trip regardless.

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
