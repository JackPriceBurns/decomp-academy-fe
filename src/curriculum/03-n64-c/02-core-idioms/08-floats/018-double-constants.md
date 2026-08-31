---
id: fc72b671-bdf2-4f6a-9b00-6bf5a2683a8a
slug: floats-double-constants
title: "Double Constants: Two Ferries or One ldc1"
difficulty: 3
concepts:
  - floats
  - doubles
  - constants
symbol: func_8031cad8
hints:
  - "The double ladder steps by 0x10 — count rungs up from 1.0's `0x3ff0` to decode the target's `lui`."
  - "The operation isn't a multiply this time."
---

# Sixty-four bits need building too

A clean double constant materializes like a clean float — bits built
integer-side, ferried across — except now there are two halves to
deliver. Here's `halveD(x)`, which returns `x * 0.5`:

```asm
 0:  lui   at, 0x3fe0     # 0.5's HIGH word: 0x3FE00000
 4:  mtc1  at, ft0f       # → the pair's upper half
 8:  mtc1  zero, ft0      # low word: all zeros → the lower half
 c:  nop
10:  mul.d fv0, fa0, ft0  # x * 0.5
14:  nop
18:  jr    ra
1c:  nop
```

There's the odd half by name: `ft0f` is the high 32 bits of the
`ft0` pair, and the two `mtc1`s fill the pair one word at a time —
the constant's meaningful bits up top, `zero` below. Then `mul.d`
consumes the *pair* under its even name.

The decoding ladder works the same as single precision, with one
recalibration: **doubles step by `0x10`** in the high half where
floats stepped by `0x80`. `1.0` is `0x3ff0`, so `2.0` is `0x4000`,
`4.0` is `0x4010`, `8.0` is `0x4020` — and downwards, `0.5` is
`0x3fe0`, `0.25` is `0x3fd0`.

And when the bits *aren't* clean? Same second path as floats, with a
doublewide load — **`ldc1`**, load doubleword to coprocessor 1,
filling a whole pair from `.rodata` in one go. Here's `x * 0.1`:

```asm
lui   at, %hi([.rodata])
ldc1  ft0, %lo([.rodata])(at)
mul.d fv0, fa0, ft0
nop
jr    ra
nop
```

(`sdc1`, the doublewide store, completes the set — you'll meet it
when doubles live in memory.)

The target uses the two-ferry path: decode its `lui` on the
double ladder, then read the `.d` operation that consumes the pair.

## Your task

Write `func_8031cad8` to reproduce the target assembly.

<!-- solution -->
```c
f64 func_8031cad8(f64 x) {
    return x + 4.0;
}
```
