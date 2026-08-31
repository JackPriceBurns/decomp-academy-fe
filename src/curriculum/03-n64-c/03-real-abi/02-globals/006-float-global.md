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
  - "The `sub.s` operand order is `ft0` minus `fa0` — the global on the left, the argument on the right."
  - "Two lines of thought — load the global, subtract — but one line of C."
---

# lwc1 takes a %lo too

A float global uses the exact same address machinery — the only change is the
final instruction: `lwc1`, the FPU load you met with the third float argument,
carries the `%lo` half and delivers the value directly into a float register.
Here's `getSpeed`, which returns the global `f32` `gSpeed`:

```asm
lui   at, %hi(gSpeed)
lwc1  fv0, %lo(gSpeed)(at)   # load the float straight into the return reg
jr    ra
nop
```

The *address* half stays on the integer side — `lui` into `at`, because
addresses are integers no matter what they point at. Only the data crosses to
the FPU. So a float global read is a little hybrid: integer register for the
address, float register for the value. (Stores mirror it: `swc1` with a `%lo`,
when you meet one.)

The target loads a float global and does one `.s` operation against the
argument before returning. Operand order decides the meaning — check which
side the freshly loaded global sits on.

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
