---
id: 110d8e69-a6f6-4554-ab4a-7a9441c03057
slug: globals-float
title: Float Globals Load Straight Into the FPU
difficulty: 2
concepts:
  - globals
  - fpu
  - hi-lo
symbol: func_80043638
hints:
  - "The `sub.s` operand order is `ft0` minus `fa0`: the global on the left, the argument on the right."
  - "There are two steps (load the global, then subtract), but they fit in one line of C."
---

# lwc1 takes a %lo too

A float global uses the same address machinery. Only the final instruction
changes. `lwc1`, the FPU load you met with the third float argument, carries the
`%lo` half and loads the value directly into a float register. Here is
`getSpeed`, which returns the global `f32` `gSpeed`:

```asm
lui   at, %hi(gSpeed)
lwc1  fv0, %lo(gSpeed)(at)   # load the float straight into the return reg
jr    ra
nop
```

The *address* half stays on the integer side: `lui` loads into `at`, because
addresses are integers whatever they point at. Only the data moves to the FPU.
So a float global read uses both kinds of register: an integer register for the
address and a float register for the value. (Stores work the same way, using
`swc1` with a `%lo`, when you meet one.)

The target loads a float global and does one `.s` operation with it before
returning. The operand order decides the meaning, so check which side the
loaded global is on.

## Your task

`extern f32 gDrift;` is declared for you. Write `func_80043638` to reproduce the
target assembly.

<!-- solution -->
```c
f32 func_80043638(f32 d) {
    return gDrift - d;
}
```

<!-- context -->
```c
extern f32 gDrift;
```
