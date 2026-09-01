---
id: 524b2ae9-530e-49fe-bf24-1b3a5493e889
slug: gba-realfinale-grand
title: "Grand Capstone: The Frame Update"
difficulty: 5
concepts:
  - capstone
  - structs
  - fixed-point
  - volatile
symbol: func_083ff970
hints:
  - "Take it one pool word at a time. The index is scaled before any base is
    loaded, and `lsl r0, #3` means the array's element is 8 bytes wide."
  - "`ldrh` then `strh` at [r2, #6] is one field updated in place. `mov r1, #6`
    plus `ldrsh r3, [r2, r1]` is that same field read back a second time, with
    its sign this time, because the value is about to be multiplied. `lsl r1,
    r3, #1` followed by `add r1, r3` is a multiply by a small constant."
  - "`void func_083ff970(s32 i)` working on `&gObjs[i]`: gravity goes into `vy`,
    then `y` advances by `vy * 3 >> 4`, then the new `y` is written out to
    `gOamY[i * 4]`."
---

# Three pool words, three phases

Long listings are read one pool word at a time. Each `.word` row names one
object the function touches; find every instruction that uses the register that
word was loaded into, and the function falls apart into phases. Three pool words
means three objects, and usually three phases: locate something, update it,
publish it.

Here is `coolShip`, which bleeds heat out of an entry in a global ship table and
mirrors the result to a hardware register:

```asm
0        lsl       r0, #4
2        ldr       r1, [pc, #24] (->28)
4        add       r0, r1
6        ldr       r1, [pc, #24] (->32)
8        ldr       r2, [r0, #12]
10       ldr       r1, [r1, #0]
12       mul       r1, r2
14       asr       r1, #8
16       sub       r2, r1
18       str       r2, [r0, #12]
20       ldr       r0, [pc, #12] (->36)
22       asr       r2, #4
24       strh      r2, [r0, #0]
26       bx        lr
28       .word     gShips
32       .word     gHeatScale
36       .word     gRegHeat
```

Every measurement you need is on the face of it. `lsl r0, #4` scales the index
by the element size, so the struct is 16 bytes. `[r0, #12]` is the field at byte
12, the fourth word. The second pool word is a plain scalar global, loaded once
with `ldr r1, [r1, #0]`. `mul` then `asr #8` is a Q8 multiply, so `gHeatScale`
carries 8 fraction bits. And the third pool word is written with `strh`, which
is the width hardware wants, after one more `asr #4` to bring the value down to
whatever the register expects.

Note also what is missing: no `push`, no `sub sp`, nothing in the epilogue but
`bx lr`. Three globals, a struct index and a fixed-point multiply all fit in
r0-r3, so this is a leaf with no frame at all.

Two details in your own target are worth being warned about, because both look
like mistakes.

The first is the index. `coolShip` consumes its scaled index with a two-operand
`add r0, r1`, destroying it, because nothing later needs it. Your target uses
the three-operand form and keeps the scaled index alive in r0 to the very end,
then adds a different pool word to it. One scaled index, two different arrays.
Work out what has to be true about the two element sizes for one number to serve
both — the arithmetic is doing you a favour that is easy to misread as a bug.

The second is a field that gets stored and then immediately loaded back, with a
different instruction than the one that wrote it. A 16-bit store truncates, so
the 32-bit register the compiler was holding is no longer a valid copy of what
is in memory; it has to re-read. And when the re-read value feeds signed
arithmetic it needs sign extension, which on Thumb means `ldrsh` — an
instruction that exists only in the register-offset form, which is why an
otherwise pointless `mov` appears just to hold a constant offset in a register.

The `ldrh` in front of the final `strh` is the one from earlier in this chapter:
a narrow write into a volatile array, and a load you never asked for.

## Your task

Write `func_083ff970` to reproduce the target assembly.

<!-- context -->
```c
struct Obj { s16 x; s16 y; s16 vx; s16 vy; };

extern struct Obj gObjs[16];
extern s32 gGravity;
extern vu16 gOamY[128];
```

<!-- solution -->
```c
void func_083ff970(s32 i) {
    struct Obj *o = &gObjs[i];

    o->vy += gGravity;
    o->y += (o->vy * 3) >> 4;
    gOamY[i * 4] = o->y;
}
```
