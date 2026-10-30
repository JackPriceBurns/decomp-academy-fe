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
  - "Work through it one pool word at a time. The index is scaled before any
    base address is loaded, and `lsl r0, #3` means each element of the array
    is 8 bytes wide."
  - "`ldrh` then `strh` at [r2, #6] update one field in place. `mov r1, #6`
    plus `ldrsh r3, [r2, r1]` reads that same field back a second time, this
    time with sign extension, because the value is about to be multiplied.
    `lsl r1, r3, #1` followed by `add r1, r3` is a multiply by a small
    constant."
  - "`void func_083ff970(s32 i)` is the signature, and it works on `&gObjs[i]`.
    First gravity is added to `vy`. Then `y` moves forward by `vy * 3 >> 4`.
    Then the new `y` is written to `gOamY[i * 4]`."
---

# Three pool words, three phases

Read a long listing one pool word at a time. Each `.word` row names one object
that the function uses. Find every instruction that uses the register that word
was loaded into, and the function splits into phases. Three pool words means
three objects, and usually three phases: find an object, update it, and write
the result out.

Here is `coolShip`, which lowers the heat of an entry in a global ship table and
copies the result to a hardware register:

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

Every size and offset you need is visible in the listing. `lsl r0, #4` scales
the index by the element size, so the struct is 16 bytes. `[r0, #12]` is the
field at byte 12, which is the fourth word. The second pool word is a plain
scalar global, loaded once with `ldr r1, [r1, #0]`. `mul` then `asr #8` is a Q8
multiply, so `gHeatScale` has 8 fraction bits. The third pool word is written
with `strh`, because that is the width the hardware uses. Before that store,
one more `asr #4` scales the value down to what the register expects.

Also note what is missing. There is no `push` and no `sub sp`, and the epilogue
is only `bx lr`. Three globals, a struct index and a fixed-point multiply all
fit in r0-r3, so this is a leaf function with no stack frame.

Two details in your target look like mistakes, so here is a warning about each.

The first is the index. `coolShip` uses up its scaled index with a two-operand
`add r0, r1`, which overwrites it, because nothing later needs it. Your target
uses the three-operand form instead. It keeps the scaled index in r0 until the
end, and then adds a different pool word to it. So one scaled index is used for
two different arrays. Work out what has to be true about the two element sizes
for one number to work for both. This reuse is correct, even though it can
look like a bug.

The second is a field that is stored and then loaded straight back, with a
different instruction from the one that wrote it. A 16-bit store truncates the
value, so the 32-bit register the compiler was holding is no longer a correct
copy of what is in memory. The compiler has to read the field again. When that
value feeds signed arithmetic, it needs sign extension, and on Thumb that means
`ldrsh`. This instruction exists only in the register-offset form. That is why
an extra `mov` appears, only to put a constant offset in a register.

The `ldrh` in front of the final `strh` is the extra load from earlier in this
chapter. A narrow store into a volatile array comes with a load that your C
does not ask for.

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
