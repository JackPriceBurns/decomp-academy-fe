---
id: fc72b671-bdf2-4f6a-9b00-6bf5a2683a8a
slug: floats-double-constants
title: "Double Constants: Two mtc1s or One ldc1"
difficulty: 3
concepts:
  - floats
  - doubles
  - constants
symbol: func_8031cad8
hints:
  - "The double ladder steps by 0x10. Count the steps up from 1.0's `0x3ff0` to decode the target's `lui`."
  - "The operation isn't a multiply this time."
---

# Sixty-four bits need building too

A clean double constant is built like a clean float. The bits are built on
the integer side and moved across to the FPU, but now there are two halves to
move. This is `halveD(x)`, which returns `x * 0.5`:

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

Here you see the odd half by name: `ft0f` is the high 32 bits of the `ft0`
pair. The two `mtc1`s fill the pair one word at a time, with the constant's
meaningful bits in the top word and `zero` in the bottom word. Then `mul.d`
uses the *pair* under its even name.

The decoding ladder works the same way as for single precision, with one
change: **doubles step by `0x10`** in the high half, where floats stepped by
`0x80`. `1.0` is `0x3ff0`, so `2.0` is `0x4000`, `4.0` is `0x4010` and `8.0`
is `0x4020`. Going down, `0.5` is `0x3fe0` and `0.25` is `0x3fd0`.

When the bits *aren't* clean, doubles use the same second path as floats,
with a double-width load. **`ldc1`** (load doubleword to coprocessor 1) fills
a whole pair from `.rodata` in one instruction. This is `x * 0.1`:

```asm
lui   at, %hi([.rodata])
ldc1  ft0, %lo([.rodata])(at)
mul.d fv0, fa0, ft0
nop
jr    ra
nop
```

(`sdc1`, the double-width store, completes the set. You will see it when
doubles are stored in memory.)

The target uses the path with two `mtc1`s. Decode its `lui` on the double
ladder, then read the `.d` operation that uses the pair.

## Your task

Write `func_8031cad8` to reproduce the target assembly.

<!-- solution -->
```c
f64 func_8031cad8(f64 x) {
    return x + 4.0;
}
```
