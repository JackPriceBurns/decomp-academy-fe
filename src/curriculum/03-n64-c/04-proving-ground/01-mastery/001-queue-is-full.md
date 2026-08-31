---
id: c72fa288-5152-47f3-a778-e81e99a13bbb
slug: mastery-queue-is-full
title: "Shipped Code: Is the Queue Full?"
difficulty: 2
concepts:
  - real-code
  - structs
  - booleans
symbol: func_801cbe88
hints:
  - "Both loads are `lh` at the struct's first two offsets — match them to fields by the layout in the context, then read the `addiu` immediate."
  - "The `xor` + `sltiu v0, v0, 1` pair is the equality test from tier 2. Which side of the `==` carries the addition? The `addiu` tells you."
---

# Welcome to the proving ground

Everything in this chapter shipped on a cartridge. These are real functions
from a shipped N64 game — no more teaching examples built to demonstrate one
idea. From here on you get what the original programmers wrote: their struct
layouts, their habits, their occasional weirdness. Your job is unchanged — read
the assembly, write the C, match — but nobody arranged the target to be tidy for
you.

The opener is from the engine's generic queue, a ring buffer that game systems
use to hand work to each other. This function answers one question: is the
queue full? The struct is in the context below; its fields are `s16`s, so
expect halfword loads.

One shape to re-arm before you go in. Here's `timerDone`, which checks whether
a timer two ticks from now hits its limit:

```asm
lh    t7, 0(a0)       # t->ticks
lh    t6, 2(a0)       # t->limit
addiu t8, t7, 2       # ticks + 2
xor   v0, t6, t8      # zero exactly when the two sides agree
sltiu v0, v0, 1       # "unsigned < 1" → 1 when the xor gave 0
jr    ra
nop
```

That `xor`/`sltiu` pair is how this compiler spells `==` when the result is
*returned* rather than branched on — you met it in tier 2. The `addiu` in the
middle means one side of the comparison isn't a bare field: some constant is
added before comparing. Recover which field gets the constant, which field sits
alone, and what the constant is, and the C writes itself.

The target has the same skeleton with its own offsets and its own immediate.
Read it against the `GenericQueue` layout in the context.

## Your task

Write `func_801cbe88` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801cbe88(GenericQueue *queue) {
    return (queue->count + 1) == queue->capacity;
}
```

<!-- context -->
```c
typedef struct {
    /*00*/ s16 count;
    /*02*/ s16 capacity;
    /*04*/ s16 elementSize;
    /*06*/ s16 unk6;
    /*08*/ s16 top;
    /*0A*/ s16 bottom;
    /*0C*/ void *data;
} GenericQueue;
```
