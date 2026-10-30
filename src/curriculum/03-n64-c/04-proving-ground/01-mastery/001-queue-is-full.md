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
  - "Both loads are `lh` at the struct's first two offsets. Match them to fields using the layout in the context, then read the `addiu` immediate."
  - "The `xor` + `sltiu v0, v0, 1` pair is the equality test from tier 2. The `addiu` tells you which side of the `==` has the addition."
---

# Welcome to the proving ground

Every function in this chapter shipped on a cartridge. They are real functions
from a shipped N64 game, and none of them is a teaching example built to show a
single idea. From here on you get what the original programmers wrote,
including their struct layouts and their habits, some of which are unusual.
Your job is the same as before: read the assembly and write C that matches it.
The difference is that nobody made the target tidy for you.

The first function comes from the engine's generic queue. This is a ring buffer
that game systems use to pass work to each other. The function checks one
thing: whether the queue is full. The struct is in the context below. Its
fields are `s16`s, so expect halfword loads.

First, a reminder of one pattern. Here is `timerDone`, which checks whether a
timer will reach its limit two ticks from now:

```asm
lh    t7, 0(a0)       # t->ticks
lh    t6, 2(a0)       # t->limit
addiu t8, t7, 2       # ticks + 2
xor   v0, t6, t8      # zero exactly when the two sides agree
sltiu v0, v0, 1       # "unsigned < 1" → 1 when the xor gave 0
jr    ra
nop
```

You met the `xor`/`sltiu` pair in tier 2. It is how this compiler writes `==`
when the result is *returned* instead of used for a branch. The `addiu` in the
middle means one side of the comparison is more than a plain field: a constant
is added to it before the comparison. Work out which field gets the constant,
which field stands alone, and what the constant is. Then you can write the C.

The target has the same structure, with its own offsets and its own immediate.
Compare it with the `GenericQueue` layout in the context.

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
