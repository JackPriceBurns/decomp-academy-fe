---
id: f6fef480-94f4-4347-a58c-0f33eca7ff86
slug: gba-structs-capstone
title: "Capstone: An Entity Update"
difficulty: 5
concepts:
  - structs
  - bitwise
  - control-flow
hints:
  - "Split the target into three pieces: the flag test, the guarded work, and
    the subtraction at the end. Name the field that each memory access touches
    before you write any C."
  - The function takes a `struct Entity *` and returns an `s32`. One local
    starts from a narrow field, and a flag decides whether something is added
    to it. Then the local is subtracted from the field at 124.
symbol: func_0827fa78
---

# Everything at once

This chapter has been building towards real entity update code. That code has
a byte of flags, a couple of narrow counters, and a payload large enough to
push the interesting fields past the offset limit. This target uses all three
at once.

Here is a function that works on a window record. The record has a byte flag, a
halfword field, and a pair of words on either side of the 124-byte limit:

```asm
0        mov       r2, r0
2        ldrb      r1, [r2, #5]
4        mov       r0, #32
6        and       r0, r1
8        cmp       r0, #0
10       bne       20 ~>
12       ldrb      r1, [r2, #4]
14       ldr       r0, [r2, #124]
16       add       r0, r1
18       b         30 ~>
20     ~>mov       r0, r2
22       add       r0, #128
24       ldrh      r1, [r2, #0]
26       ldr       r0, [r0, #0]
28       sub       r0, r1
30     ~>bx        lr
```

There are three things to notice here. The flag test at 2 to 10 is the
standard pattern: load the byte, put the mask in a scratch register, `and` them,
and compare the result with zero. The `bne` jumps *forward* to the code for the
true case. So the fall-through path at 12 is the `else`, and a taken branch
means the condition was true.

Instructions 20, 22 and 26 are one field access, with the `ldrh` for a
different field placed among them. The struct base is in `r2`. This time the
`add` does not overwrite it, because `r2` is still needed for that `ldrh`. So
the compiler copies the base with `mov r0, r2` and does the `add` on the copy.
It takes three instructions to read the field at 128, while the field at 124
took one.

This is the pattern to look for in your own target. The `add` goes into
whichever copy of the pointer is not needed again. That is a new `mov` copy
when the base is still needed for another field, and the base register itself
when it is not. Either way, the `mov`, the `add` and the load at `[rD, #0]` are
one field access. Any instruction between them belongs to a different access.

Your target tests a flag of its own, does work on only one side of the branch,
and ends with a subtraction. Work out every offset from the struct in the
context block. There is an array in the middle, and the size of that array
decides where the last two fields are.

## Your task

Write `func_0827fa78` to reproduce the target assembly.

<!-- context -->
```c
struct Entity {
    u8 flags;
    u8 kind;
    u16 timer;
    s32 x;
    s32 y;
    u32 anim[28];
    s32 hp;
    s32 armor;
};
```

<!-- solution -->
```c
s32 func_0827fa78(struct Entity *e) {
    s32 d = e->timer;
    if (e->flags & 4) {
        d = d + e->armor;
    }
    return e->hp - d;
}
```
